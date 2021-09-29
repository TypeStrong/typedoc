@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\..\..\bin\typedoc --name "TypeDoc Documentation" --tsconfig ../../../../tsconfig.json --readme ../../../../README.md --out doc\ --entryPointStrategy expand ..\..\..\..\src\lib\

chdir /D "%curr_dir%"
