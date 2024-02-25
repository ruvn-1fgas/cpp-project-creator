@echo off
set CXX=g++
set CXX_FLAGS=-std=c++23 -O0 -static-libstdc++ -static-libgcc -g
set LIB_FLAGS=
set BIN=bin
set SRC=src
set INCLUDE=include\
set LIB=lib
@REM place your libraries names here
set LIBS=
set EXECUTABLE=main
set MINGW_DLL_PATH=C:\msys64\mingw64\bin
set SYSTEM_DLL_PATH=C:\Windows\System32

if not exist %BIN% mkdir %BIN%

echo Compiling the C++ program...
for /f "tokens=*" %%i in ('pkg-config --cflags --libs %LIBS%') do set CXX_FLAGS=%CXX_FLAGS% %%i
%CXX% %CXX_FLAGS% -I%INCLUDE% -L%LIB% %SRC%\*.cpp  -o %BIN%\%EXECUTABLE% %LIB_FLAGS%
if %errorlevel% neq 0 (
    echo Compilation failed.
    exit /b %errorlevel%
)
echo Done.

@REM Identify required DLLs
echo Identifying required DLLs...
for /f "tokens=3 delims= " %%i in ('objdump -p %BIN%\%EXECUTABLE%.exe ^| find /i "DLL Name"') do (
    if not "%%i" == "Table:" (
        echo %%i
    )
)
if %errorlevel% neq 0 (
    echo Identifying DLLs failed.
    exit /b %errorlevel%
)
echo Done.

@REM Copy required DLLs
echo Copying required DLLs...
for /f "tokens=3 delims= " %%i in ('objdump -p %BIN%\%EXECUTABLE%.exe ^| findstr "DLL Name"') do (
    if "%%~xi"==".dll" (
        xcopy /y %MINGW_DLL_PATH%\%%i %BIN%\ 2>nul > nul
        if errorlevel 1 (
            xcopy /y %SYSTEM_DLL_PATH%\%%i %BIN%\ 2>nul > nul
            if errorlevel 1 (
                echo Copying %%i failed.
            )
        )
    )
)
echo Done.