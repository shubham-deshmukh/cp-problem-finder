import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

// Files to remove from src root (since they're now organized)
const filesToRemove = [
  'Header.tsx',
  'Header.css',
  'SearchBar.tsx',
  'SearchBar.css',
  'Tag.tsx',
  'Tag.css',
  'ProblemTable.tsx',
  'ProblemTable.css',
  'FAB.tsx',
  'FAB.css',
  'types.ts',
];

filesToRemove.forEach((file) => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✓ Removed old file: ${file}`);
  }
});

console.log('\n✅ Cleanup complete!');
console.log('All component files have been organized into component directories.');
