@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\tsd --module commonjs --out doc\ ..\..\src\

chdir /D "%curr_dir%"