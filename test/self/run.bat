@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --module commonjs --name "TypeDoc Doumentation" --out doc\ ..\..\src\

chdir /D "%curr_dir%"