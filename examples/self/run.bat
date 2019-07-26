@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --mode file --name "TypeDoc Documentation" --tsconfig ../../tsconfig.json --readme ../../README.md --out doc\ ..\..\src\lib\

chdir /D "%curr_dir%"
