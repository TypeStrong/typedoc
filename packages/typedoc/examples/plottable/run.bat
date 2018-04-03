@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node ..\..\bin\typedoc --mode file --includeDeclarations src/typings/d3/d3.d.ts src/plottable.d.ts --out doc/

chdir /D "%curr_dir%"