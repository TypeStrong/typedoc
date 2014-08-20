@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --module commonjs --theme minimal --out doc\ src\

chdir /D "%curr_dir%"