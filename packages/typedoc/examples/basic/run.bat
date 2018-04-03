@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --module commonjs --includes inc\ --media media\ --target ES5 --noLib --out doc\ src\

chdir /D "%curr_dir%"