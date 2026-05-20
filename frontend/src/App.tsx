import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FAB } from './components/FAB';
import { ProblemTable } from './components/ProblemTable';
import AddProblemModal from './components/AddProblemModal';
import { type Problem } from './types';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/search?limit=8&offset=0');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        // The search endpoint returns an object with a 'hits' property
        setProblems(data.hits || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.colorScheme = 'dark';
    }
  };

  const filteredProblems = problems.filter((problem) => {
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
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading problems...</div>
        ) : (
          <ProblemTable problems={filteredProblems} />
        )}
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
