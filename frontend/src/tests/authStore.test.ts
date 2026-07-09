import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';

// Reset the Zustand store before each test to ensure test isolation
beforeEach(() => {
  useAuthStore.setState({
    isAuthenticated: false,
    user: null,
    checkingAuth: true,
  });
  vi.restoreAllMocks();
});

describe('Zustand Auth Store (useAuthStore)', () => {
  test('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.checkingAuth).toBe(true);
  });

  test('login() should update isAuthenticated and user state', () => {
    const mockUser = { name: 'Admin User', email: 'admin@example.com', role: 'admin' };
    
    useAuthStore.getState().login(mockUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  test('logout() should make POST request and clear auth state', async () => {
    // Stub fetch globally
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Logged out successfully' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    // Seed state as authenticated
    const mockUser = { name: 'Guest Admin', email: 'guest@example.com', role: 'admin' };
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });

    await useAuthStore.getState().logout();

    // Verify fetch call
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    });

    // Verify state cleanup
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  test('checkAuth() should set auth state on successful API response', async () => {
    const mockUser = { name: 'Test User', email: 'test@example.com', role: 'user' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });
    vi.stubGlobal('fetch', fetchMock);

    await useAuthStore.getState().checkAuth();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/me'), {
      credentials: 'include',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.checkingAuth).toBe(false);
  });

  test('checkAuth() should clear auth state on failed API response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });
    vi.stubGlobal('fetch', fetchMock);

    // Start with authenticated state
    useAuthStore.setState({ isAuthenticated: true, user: { name: 'Old User', email: 'old@example.com' } });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.checkingAuth).toBe(false);
  });

  test('handleSessionExpired() should alert and clear auth state if user was authenticated', () => {
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);

    // Case 1: User is authenticated
    useAuthStore.setState({ isAuthenticated: true, user: { name: 'Old User', email: 'old@example.com' } });

    useAuthStore.getState().handleSessionExpired();

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('session has expired'));
    
    let state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();

    // Case 2: User is not authenticated (should not alert again)
    alertMock.mockClear();
    useAuthStore.getState().handleSessionExpired();
    expect(alertMock).not.toHaveBeenCalled();
  });
});
