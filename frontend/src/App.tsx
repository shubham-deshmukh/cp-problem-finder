import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FAB } from './components/FAB';
import { ProblemTable } from './components/ProblemTable';
import AddProblemModal from './components/AddProblemModal';
import { type Problem, type ProblemData } from './types';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const encodedQuery = encodeURIComponent(searchValue);
        const response = await fetch(`http://127.0.0.1:8000/search?q=${encodedQuery}&limit=8&offset=0`, { signal });
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setProblems(data || []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching problems:', error);
          setProblems([]); // Clear results on error
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [searchValue]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.colorScheme = 'dark';
    }
  };

  const handleAddProblem = async (problemData: ProblemData) => {
    setIsAnalyzing(true);
    try {
      // Note: Update this URL to match your actual backend API endpoint for adding problems
      const response = await fetch('http://127.0.0.1:8000/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add problem. Please try again.';
        try {
          const errorData = await response.json();
          // Handle FastAPI 422 Unprocessable Entity errors specifically
          if (response.status === 422 && errorData.detail) {
            if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
              // Extract the main message from the first validation error
              errorMessage = errorData.detail[0].msg;
            } else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            }
          } else if (errorData.detail) { // Handle other generic errors with a 'detail' key
            errorMessage = errorData.detail;
          }
        } catch (e) { /* Response may not have a JSON body, fall back to default message */ }
        throw new Error(errorMessage);
      }

      const newProblem: Problem = await response.json();
      // Add the new problem to the top of the list
      setProblems(prevProblems => [newProblem, ...prevProblems]);
      setIsAddProblemModalOpen(false);
      toast.success('Problem added successfully!');
    } catch (error) {
      console.error('Error adding problem:', error);
      toast.error((error as Error).message); 
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          // Automatically adjust toast colors based on your current theme
          style: { background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#333' }
        }} 
      />
      <Header onThemeToggle={toggleTheme} />
      <div className="main-content">
        <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading problems...</div>
        ) : (
          <ProblemTable problems={problems} />
        )}
      </div>
      <FAB onClick={() => setIsAddProblemModalOpen(true)} />
      <AddProblemModal
        isOpen={isAddProblemModalOpen}
        isLoading={isAnalyzing}
        onClose={() => !isAnalyzing && setIsAddProblemModalOpen(false)}
        onSubmit={handleAddProblem}
      />
    </div>
  );
}

export default App;
