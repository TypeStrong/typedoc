@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --includeDeclarations --module commonjs --name "Definitely Typed" --exclude {**/*test*,**/_infrastructure/**} --out doc\ src\

chdir /D "%curr_dir%"