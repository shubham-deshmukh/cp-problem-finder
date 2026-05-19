#!/bin/bash
# Script to organize components into directories

# Create component directories
mkdir -p src/components/Header
mkdir -p src/components/SearchBar
mkdir -p src/components/Tag
mkdir -p src/components/ProblemTable
mkdir -p src/components/FAB

# Move Header files
mv src/Header.tsx src/components/Header/Header.tsx 2>/dev/null
mv src/Header.css src/components/Header/Header.css 2>/dev/null

# Move SearchBar files
mv src/SearchBar.tsx src/components/SearchBar/SearchBar.tsx 2>/dev/null
mv src/SearchBar.css src/components/SearchBar/SearchBar.css 2>/dev/null

# Move Tag files
mv src/Tag.tsx src/components/Tag/Tag.tsx 2>/dev/null
mv src/Tag.css src/components/Tag/Tag.css 2>/dev/null

# Move ProblemTable files
mv src/ProblemTable.tsx src/components/ProblemTable/ProblemTable.tsx 2>/dev/null
mv src/ProblemTable.css src/components/ProblemTable/ProblemTable.css 2>/dev/null

# Move FAB files
mv src/FAB.tsx src/components/FAB/FAB.tsx 2>/dev/null
mv src/FAB.css src/components/FAB/FAB.css 2>/dev/null

echo "Components organized successfully!"
