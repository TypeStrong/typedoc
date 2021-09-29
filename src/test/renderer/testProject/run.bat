@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\..\..\bin\typedoc --includes inc\ --media media\ --json json.json --out doc\ --entryPointStrategy expand src\

chdir /D "%curr_dir%"