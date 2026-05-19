import { useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { mockProblems } from './data';
import { FAB } from './components/FAB';
import { ProblemTable } from './components/ProblemTable';
import AddProblemModal from './components/AddProblemModal';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.colorScheme = 'dark';
    }
  };

  const filteredProblems = mockProblems.filter((problem) => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      problem.title.toLowerCase().includes(search) ||
      problem.tags.some(tag => tag.toLowerCase().includes(search))
    );
  });

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <Header onThemeToggle={toggleTheme} />
      <div className="main-content">
        <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
        <ProblemTable problems={filteredProblems} />
      </div>
      <FAB onClick={() => setIsAddProblemModalOpen(true)} />
      <AddProblemModal
        isOpen={isAddProblemModalOpen}
        isLoading={isAnalyzing}
        onClose={() => !isAnalyzing && setIsAddProblemModalOpen(false)}
        onSubmit={(problem) => {
          setIsAnalyzing(true);
          // Simulate backend analysis and ingestion
          setTimeout(() => {
            console.log('Problem analyzed and added:', problem);
            setIsAnalyzing(false);
            setIsAddProblemModalOpen(false);
          }, 2000);
        }}
      />
    </div>
  );
}

export default App;
