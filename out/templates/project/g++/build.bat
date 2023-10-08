@echo off
set CXX=g++
set CXX_FLAGS=-std=c++23 -Ofast -static-libstdc++ -static-libgcc
set BIN=bin
set SRC=src
set INCLUDE=include\
set LIB=
set EXECUTABLE=main

if not exist %BIN% mkdir %BIN%

echo Compiling the C++ program...
%CXX% %CXX_FLAGS% -I%INCLUDE% %SRC%\*.cpp -o %BIN%\%EXECUTABLE% %LIB%
echo Done.