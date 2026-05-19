import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');

// Define components to organize
const components = ['Header', 'SearchBar', 'Tag', 'ProblemTable', 'FAB'];

// Create components directory if it doesn't exist
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
  console.log('✓ Created src/components directory');
}

// Move types.ts to components
const typesSrc = path.join(srcDir, 'types.ts');
const typesDest = path.join(componentsDir, 'types.ts');
if (fs.existsSync(typesSrc) && !fs.existsSync(typesDest)) {
  fs.copyFileSync(typesSrc, typesDest);
  console.log('✓ Moved types.ts to components/');
}

// Organize each component
components.forEach((component) => {
  const componentDir = path.join(componentsDir, component);
  
  // Create component directory
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
    console.log(`✓ Created src/components/${component} directory`);
  }

  // Move TSX file
  const tsxSrc = path.join(srcDir, `${component}.tsx`);
  const tsxDest = path.join(componentDir, `${component}.tsx`);
  if (fs.existsSync(tsxSrc) && !fs.existsSync(tsxDest)) {
    fs.copyFileSync(tsxSrc, tsxDest);
    console.log(`✓ Moved ${component}.tsx to components/${component}/`);
  }

  // Move CSS file
  const cssSrc = path.join(srcDir, `${component}.css`);
  const cssDest = path.join(componentDir, `${component}.css`);
  if (fs.existsSync(cssSrc) && !fs.existsSync(cssDest)) {
    fs.copyFileSync(cssSrc, cssDest);
    console.log(`✓ Moved ${component}.css to components/${component}/`);
  }
});

// Create barrel export file (index.ts in components)
const barrelPath = path.join(componentsDir, 'index.ts');
const barrelContent = `// Component barrel exports
export { Header } from './Header/Header';
export { SearchBar } from './SearchBar/SearchBar';
export { Tag } from './Tag/Tag';
export { ProblemTable } from './ProblemTable/ProblemTable';
export { FAB } from './FAB/FAB';
export type { Problem, TagType, DifficultyLevel } from './types';
`;

if (!fs.existsSync(barrelPath)) {
  fs.writeFileSync(barrelPath, barrelContent);
  console.log('✓ Created components/index.ts barrel export');
}

console.log('\n✅ Component organization complete!');
console.log('\n📁 Final Directory Structure:');
console.log('   src/');
console.log('   ├── components/');
console.log('   │   ├── Header/');
console.log('   │   │   ├── Header.tsx');
console.log('   │   │   └── Header.css');
console.log('   │   ├── SearchBar/');
console.log('   │   │   ├── SearchBar.tsx');
console.log('   │   │   └── SearchBar.css');
console.log('   │   ├── Tag/');
console.log('   │   │   ├── Tag.tsx');
console.log('   │   │   └── Tag.css');
console.log('   │   ├── ProblemTable/');
console.log('   │   │   ├── ProblemTable.tsx');
console.log('   │   │   └── ProblemTable.css');
console.log('   │   ├── FAB/');
console.log('   │   │   ├── FAB.tsx');
console.log('   │   │   └── FAB.css');
console.log('   │   ├── types.ts');
console.log('   │   └── index.ts');
console.log('   ├── App.tsx');
console.log('   ├── App.css');
console.log('   ├── data.ts');
console.log('   ├── index.css');
console.log('   └── main.tsx');

