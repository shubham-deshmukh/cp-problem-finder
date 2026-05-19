@echo off
REM Script to organize components into directories

REM Create component directories
if not exist "src\components\Header" mkdir src\components\Header
if not exist "src\components\SearchBar" mkdir src\components\SearchBar
if not exist "src\components\Tag" mkdir src\components\Tag
if not exist "src\components\ProblemTable" mkdir src\components\ProblemTable
if not exist "src\components\FAB" mkdir src\components\FAB

REM Move Header files
if exist "src\Header.tsx" move /Y "src\Header.tsx" "src\components\Header\Header.tsx"
if exist "src\Header.css" move /Y "src\Header.css" "src\components\Header\Header.css"

REM Move SearchBar files
if exist "src\SearchBar.tsx" move /Y "src\SearchBar.tsx" "src\components\SearchBar\SearchBar.tsx"
if exist "src\SearchBar.css" move /Y "src\SearchBar.css" "src\components\SearchBar\SearchBar.css"

REM Move Tag files
if exist "src\Tag.tsx" move /Y "src\Tag.tsx" "src\components\Tag\Tag.tsx"
if exist "src\Tag.css" move /Y "src\Tag.css" "src\components\Tag\Tag.css"

REM Move ProblemTable files
if exist "src\ProblemTable.tsx" move /Y "src\ProblemTable.tsx" "src\components\ProblemTable\ProblemTable.tsx"
if exist "src\ProblemTable.css" move /Y "src\ProblemTable.css" "src\components\ProblemTable\ProblemTable.css"

REM Move FAB files
if exist "src\FAB.tsx" move /Y "src\FAB.tsx" "src\components\FAB\FAB.tsx"
if exist "src\FAB.css" move /Y "src\FAB.css" "src\components\FAB\FAB.css"

echo Components organized successfully!
pause
