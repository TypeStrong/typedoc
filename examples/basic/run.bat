@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --module commonjs --target ES5 --theme minimal --json data.json --out doc\ src\

chdir /D "%curr_dir%"