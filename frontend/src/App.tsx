import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { NotesDrawer } from './components/NotesDrawer';
import { DemoTour, type TourProgress } from './components/DemoTour';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [selectedNotesProblem, setSelectedNotesProblem] = useState<Problem | null>(null);

  // Access the QueryClient to invalidate cache after mutations
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkingAuth = useAuthStore((state) => state.checkingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const isGuest = user?.email === 'guest@example.com';

  const initialTourState: TourProgress = {
    search: false,
    theme: false,
    add: false,
    notes: false,
  };

  const [tourProgress, setTourProgress] = useState<TourProgress>(() => {
    const saved = sessionStorage.getItem('guest_tour_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialTourState;
      }
    }
    return initialTourState;
  });

  const completeStep = (step: keyof TourProgress) => {
    setTourProgress((prev) => {
      if (prev[step]) return prev;
      const next = { ...prev, [step]: true };
      sessionStorage.setItem('guest_tour_progress', JSON.stringify(next));
      return next;
    });
  };

  // Perform initial authentication status check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
      const response = await fetch(`${API_URL}/search?q=${encodedQuery}&limit=8&offset=0`, { 
        signal,
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().handleSessionExpired();
        }
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      return data || [];
    },
    enabled: isAuthenticated,
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isGuest) {
      completeStep('theme');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // Mutation for adding a problem
  const addMutation = useMutation({
    mutationFn: async (problemData: ProblemData) => {
        const response = await fetch(`${API_URL}/problems`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(problemData),
          credentials: 'include'
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            useAuthStore.getState().handleSessionExpired();
          }
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
          } catch {
            // Error is ignored
          }
          throw new Error(errorMessage);
        }
        return response.json();
    },
    onSuccess: (newProblem) => {
        // Instantly update UI cache
        queryClient.setQueryData(['problems', debouncedSearchValue], (old: Problem[] | undefined) => {
            return old ? [newProblem, ...old] : [newProblem];
        });
        // We invalidate the cache to ensure all query keys refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['problems'] });
        setIsAddProblemModalOpen(false);
        if (isGuest) {
          completeStep('add');
        }
        toast.success('Problem added successfully!');
    },
    onError: (error) => {
        console.error('Error adding problem:', error);
        toast.error(error.message);
    }
  });

  // Mutation for updating an existing problem
  const updateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ id, updatedData }: { id: number, updatedData: any }) => {
        const response = await fetch(`${API_URL}/problems/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
              useAuthStore.getState().handleSessionExpired();
            }
            let errorMessage = 'Failed to update problem. Please try again.';
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail;
                }
            } catch {
              // Error is ignored
            }
            throw new Error(errorMessage);
        }
        return response.json();
    },
    onSuccess: (updatedProblem, variables) => {
        // Instantly update UI cache
        queryClient.setQueryData(['problems', debouncedSearchValue], (old: Problem[] | undefined) => {
            return old ? old.map(p => p.id === updatedProblem.id ? updatedProblem : p) : [];
        });
        // We invalidate the cache to ensure all query keys refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['problems'] });
        setEditingProblem(null);
        
        // Sync selected notes problem if it's currently open
        setSelectedNotesProblem((current) => {
          if (current && current.id === updatedProblem.id) {
            return updatedProblem;
          }
          return current;
        });

        if (isGuest && variables?.updatedData && 'notes' in variables.updatedData) {
          completeStep('notes');
        }

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
        const response = await fetch(`${API_URL}/problems/${id}`, { 
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) {
            if (response.status === 401) {
              useAuthStore.getState().handleSessionExpired();
            }
            let errorMessage = 'Failed to delete problem. Please try again.';
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail;
                }
            } catch {
              // Error is ignored
            }
            throw new Error(errorMessage);
        }
        return id;
    },
    onSuccess: (deletedId) => {
        // Instantly update UI cache
        queryClient.setQueryData(['problems', debouncedSearchValue], (old: Problem[] | undefined) => {
            return old ? old.filter(p => p.id !== deletedId) : [];
        });
        // We invalidate the cache to ensure all query keys refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['problems'] });
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

  if (checkingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        background: isDarkMode ? '#1e1e1e' : '#f9f9f9',
        color: isDarkMode ? '#fff' : '#333'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Checking session status...</div>
      </div>
    );
  }

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
        <div className="min-h-screen bg-background text-foreground flex flex-col font-geist">
          <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
          <div className="flex-1 flex flex-col p-4 md:p-6 gap-5 max-w-7xl mx-auto w-full">
            {isGuest && <DemoTour progress={tourProgress} />}
            <SearchBar 
              searchValue={searchValue} 
              onSearchChange={(value) => {
                setSearchValue(value);
                if (isGuest && value.trim().length > 0 && !tourProgress.search) {
                  completeStep('search');
                }
              }} 
            />
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading problems...</div>
            ) : (
              <ProblemTable 
                problems={problems} 
                onEdit={setEditingProblem} 
                onDelete={handleDeleteProblem} 
                onShowNotes={setSelectedNotesProblem}
                isAdmin={isAdmin} 
              />
            )}
          </div>
          {isAdmin && <FAB onClick={() => setIsAddProblemModalOpen(true)} />}
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
          <NotesDrawer
            isOpen={!!selectedNotesProblem}
            problem={selectedNotesProblem}
            onClose={() => setSelectedNotesProblem(null)}
            isAdmin={isAdmin}
            isSaving={updateMutation.isPending}
            onSave={(id, notes) => updateMutation.mutate({ id, updatedData: { notes } })}
          />
        </div>
      )}
    </>
  );
}

export default App;
