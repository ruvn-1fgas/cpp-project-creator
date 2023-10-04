'use strict';

import * as vscode from 'vscode';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';

interface EasyProjectsJSON {
    version: string;
    directories?: string[];
    templates: {
        [templateName: string]: {
            directories?: [string];
            blankFiles?: [string];
            files?: { [from: string]: string };
            openFiles?: [string];
        };
    };
}

export function activate(context: vscode.ExtensionContext) {
    let createProjectCommand: vscode.Disposable = vscode.commands.registerCommand('cpp-project-creator.createProject', createProject);

    let buildButton: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    buildButton.command = 'workbench.action.tasks.build';
    buildButton.text = '⚙ Build';
    buildButton.tooltip = 'Build Project [Ctrl+F7]';
    buildButton.show();

    let buildAndRunButton: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    buildAndRunButton.command = 'workbench.action.tasks.test';
    buildAndRunButton.text = '▶ Build & Run';
    buildAndRunButton.tooltip = 'Build & Run Project [F7]';
    buildAndRunButton.show();

    context.subscriptions.push(createProjectCommand);
    context.subscriptions.push(buildButton);
    context.subscriptions.push(buildAndRunButton);
}

export function deactivate() {
    // Nothing to do here
}

const createProject = async () => {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('C++ Project Creator: No workspace folder found!');
        return;
    }

    let templates: Array<string> = [];

    try {
        const res = readFileSync(`${__dirname}/templates/project/files.json`, 'utf8');
        let data = JSON.parse(res.toString());

        for (let template in data.templates) {
            templates.push(template);
        }

        const selected = await vscode.window.showQuickPick(templates, { placeHolder: 'Select a template' });
        await selectFolder(data, selected);
        vscode.workspace.getConfiguration('files').update('associations', { "*.tpp": "cpp" }, vscode.ConfigurationTarget.Workspace);
        vscode.workspace.getConfiguration('terminal.integrated.shell').update('windows', "cmd.exe", vscode.ConfigurationTarget.Workspace);
    } catch (error) {
        vscode.window.showErrorMessage('C++ Project Creator: Could not load templates local.');
        vscode.window.showErrorMessage(`${error} `);
    }
};

const selectFolder = async (files: EasyProjectsJSON, templateName: string | undefined) => {
    if (!templateName || !vscode.workspace.workspaceFolders) { return; }
    if (vscode.workspace.workspaceFolders.length > 1) {
        try {
            const chosen = await vscode.window.showWorkspaceFolderPick();
            if (!chosen) { return; }
            let folder = chosen.uri;
            await downloadTemplate(files, templateName, folder.fsPath);
        } catch (err) {
            vscode.window.showErrorMessage(`C++ Project Creator error: ${err} `);
        }

    } else {
        downloadTemplate(files, templateName, vscode.workspace.workspaceFolders[0].uri.fsPath);
    }
};

const downloadTemplate = async (files: EasyProjectsJSON, templateName: string, folder: string) => {
    if (files.directories) {
        files.directories.forEach((dir: string) => {
            if (!existsSync(`${folder} /${dir}`)) {
                mkdirSync(`${folder}/${dir}`);
            }
        });
    }

    let directories = files.templates[templateName].directories;
    if (directories) {
        directories.forEach((dir: string) => {
            if (!existsSync(`${folder}/${dir}`)) {
                mkdirSync(`${folder}/${dir}`);
            }
        });
    }

    let blankFiles = files.templates[templateName].blankFiles;
    if (blankFiles) {
        blankFiles.forEach((file: string) => {
            if (!existsSync(`${folder}/${file}`)) {
                writeFileSync(`${folder}/${file}`, '');
            }
        });
    }

    let f = files.templates[templateName].files;
    if (f) {
        for (let file in f) {
            try {
                let data = readFileSync(`${__dirname}/templates/project/${file}`).toString();
                writeFileSync(`${folder}/${f[file]}`, data);
            } catch (error) {
                vscode.window.showErrorMessage(`C++ Project Creator: Could not load '${file}' locally.\nError: ${error}`);
            }
        }
    }

    let openFiles = files.templates[templateName].openFiles;
    if (openFiles) {
        for (let file of openFiles) {
            if (existsSync(`${folder}/${file}`)) {
                vscode.workspace.openTextDocument(`${folder}/${file}`)
                    .then(doc => vscode.window.showTextDocument(doc, { preview: false }));
            }
        }
    }

    if (!existsSync(`${folder}/.vscode`)) {
        mkdirSync(`${folder}/.vscode`);
    }
    writeFileSync(`${folder}/.vscode/.dontdelete`, '');
};