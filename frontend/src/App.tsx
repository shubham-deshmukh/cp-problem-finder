import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './App.module.css';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FAB } from './components/FAB';
import { ProblemTable } from './components/ProblemTable';
import AddProblemModal from './components/AddProblemModal';
import { type Problem, type ProblemData } from './types';
import EditProblemModal from './components/EditProblemModal';
import toast, { Toaster } from 'react-hot-toast';
import { LoginPage } from './components/Login';
import { useAuthStore } from './stores/authStore';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  // Access the QueryClient to invalidate cache after mutations
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  // Intercept OAuth token from URL parameters when backend redirects back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      login(token);
      // Clean up the URL to remove the token so it isn't visible/bookmarked
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [login]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Fetch problems automatically based on query parameters
  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['problems', debouncedSearchValue],
    queryFn: async ({ signal }) => {
      const encodedQuery = encodeURIComponent(debouncedSearchValue);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/search?q=${encodedQuery}&limit=8&offset=0`, { 
        signal,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      return data || [];
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.colorScheme = 'dark';
    }
  };

  // Mutation for adding a problem
  const addMutation = useMutation({
    mutationFn: async (problemData: ProblemData) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://127.0.0.1:8000/problems', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(problemData),
        });
  
        if (!response.ok) {
          let errorMessage = 'Failed to add problem. Please try again.';
          try {
            const errorData = await response.json();
            if (response.status === 422 && errorData.detail) {
              if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                errorMessage = errorData.detail[0].msg;
              } else if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
              }
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            }
          } catch (e) {}
          throw new Error(errorMessage);
        }
        return response.json();
    },
    onSuccess: (newProblem) => {
        // Instantly update UI cache
        queryClient.setQueryData(['problems', debouncedSearchValue], (old: Problem[] | undefined) => {
            return old ? [newProblem, ...old] : [newProblem];
        });
        // We comment out immediate invalidation to prevent fetching stale data before the search engine indexes
        // queryClient.invalidateQueries({ queryKey: ['problems'] });
        setIsAddProblemModalOpen(false);
        toast.success('Problem added successfully!');
    },
    onError: (error) => {
        console.error('Error adding problem:', error);
        toast.error(error.message);
    }
  });

  // Mutation for updating an existing problem
  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedData }: { id: number, updatedData: any }) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://127.0.0.1:8000/problems/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(updatedData),
        });
        
        if (!response.ok) {
            let errorMessage = 'Failed to update problem. Please try again.';
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail;
                }
            } catch (e) {}
            throw new Error(errorMessage);
        }
        return response.json();
    },
    onSuccess: (updatedProblem) => {
        // Instantly update UI cache
        queryClient.setQueryData(['problems', debouncedSearchValue], (old: Problem[] | undefined) => {
            return old ? old.map(p => p.id === updatedProblem.id ? updatedProblem : p) : [];
        });
        // We comment out immediate invalidation to prevent fetching stale data before the search engine indexes
        // queryClient.invalidateQueries({ queryKey: ['problems'] });
        setEditingProblem(null);
        toast.success('Problem updated successfully!');
    },
    onError: (error) => {
        console.error('Error updating problem:', error);
        toast.error(error.message);
    }
  });

  // Mutation for deleting a problem
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://127.0.0.1:8000/problems/${id}`, { 
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) {
            let errorMessage = 'Failed to delete problem. Please try again.';
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail;
                }
            } catch (e) {}
            throw new Error(errorMessage);
        }
        return id;
    },
    onSuccess: (deletedId) => {
        // Instantly update UI cache
        queryClient.setQueryData(['problems', debouncedSearchValue], (old: Problem[] | undefined) => {
            return old ? old.filter(p => p.id !== deletedId) : [];
        });
        // We comment out immediate invalidation to prevent fetching stale data before the search engine indexes
        // queryClient.invalidateQueries({ queryKey: ['problems'] });
        toast.success('Problem deleted successfully!');
    },
    onError: (error) => {
        console.error('Error deleting problem:', error);
        toast.error(error.message);
    }
  });

  const handleDeleteProblem = (id: number) => {
      if (window.confirm('Are you sure you want to delete this problem?')) {
          deleteMutation.mutate(id);
      }
  };

  return (
    <>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: { background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#333' }
        }} 
      />
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <div className={`${styles.app} ${isDarkMode ? 'dark-mode' : ''}`}>
          <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
          <div className={styles['main-content']}>
            <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading problems...</div>
            ) : (
              <ProblemTable problems={problems} onEdit={setEditingProblem} onDelete={handleDeleteProblem} />
            )}
          </div>
          <FAB onClick={() => setIsAddProblemModalOpen(true)} />
          <AddProblemModal
            isOpen={isAddProblemModalOpen}
            isLoading={addMutation.isPending}
            onClose={() => !addMutation.isPending && setIsAddProblemModalOpen(false)}
            onSubmit={(data) => addMutation.mutate(data)}
          />
          <EditProblemModal
            isOpen={!!editingProblem}
            problem={editingProblem}
            isLoading={updateMutation.isPending}
            onClose={() => !updateMutation.isPending && setEditingProblem(null)}
            onSubmit={(id, data) => updateMutation.mutate({ id, updatedData: data })}
          />
        </div>
      )}
    </>
  );
}

export default App;
