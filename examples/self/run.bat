@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --module commonjs --includeDeclarations --externalPattern **/lib/** --verbose --name "TypeDoc Documentation" --out doc\ ..\..\src\@init.ts ..\..\src\td\Application.ts

chdir /D "%curr_dir%"