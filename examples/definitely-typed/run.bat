@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node run.js --includeDeclarations --module commonjs --name "Definitely Typed" --out doc\ src\

chdir /D "%curr_dir%"