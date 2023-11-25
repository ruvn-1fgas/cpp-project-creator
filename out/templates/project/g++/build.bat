@echo off
set CXX=g++
set CXX_FLAGS=-std=c++23 -Ofast -static-libstdc++ -static-libgcc
set LIB_FLAGS=
set BIN=bin
set SRC=src
set INCLUDE=include\
set LIB=lib
@REM place your libraries names here
set LIBS=
set EXECUTABLE=main

if not exist %BIN% mkdir %BIN%

echo Compiling the C++ program...
for /f "tokens=*" %%i in ('pkg-config --cflags --libs %LIBS%') do set CXX_FLAGS=%CXX_FLAGS% %%i
%CXX% %CXX_FLAGS% -I%INCLUDE% -L%LIB% %SRC%\*.cpp -o %BIN%\%EXECUTABLE% %LIB_FLAGS%
if %errorlevel% neq 0 (
    echo Compilation failed.
    exit /b %errorlevel%
)
echo Done.