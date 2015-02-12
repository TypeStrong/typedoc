@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --includeDeclarations --externalPattern **/lib/** --verbose --mode file --name "TypeDoc Documentation" --out doc\ ..\..\src\

chdir /D "%curr_dir%"