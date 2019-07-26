@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --includeDeclarations --mode file --name "TypeDoc Documentation" --out doc\ ..\..\src\lib\

chdir /D "%curr_dir%"
