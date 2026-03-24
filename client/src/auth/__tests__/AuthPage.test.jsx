/* global global */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from '../AuthPage';

// Mock useAuth
const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock(
  '../../../client/src/context/useAuth',
  () => ({
    default: () => ({ login: mockLogin, logout: mockLogout, user: null, loading: false }),
  }),
  { virtual: true }
);

// However module resolution in tests expects relative path; instead mock the project's useAuth
vi.mock('../../context/useAuth', () => ({
  default: () => ({ login: mockLogin, logout: mockLogout, user: null, loading: false }),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset fetch mock
    global.fetch = vi.fn();
  });

  it('shows success message on signup', async () => {
    // mock successful register response
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    // switch to signup panel - pick the primary sign up button
    const signUpButton = screen
      .getAllByText(/Sign Up/i)
      .find(el => el.className && el.className.includes('primary-btn'));
    // Fill signup inputs
    const nameInput = screen.getByPlaceholderText('Kumara Sangakkara');
    const emailInput = screen.getAllByPlaceholderText('you@example.com')[0];
    const passwordInput = screen.getAllByPlaceholderText('••••••••')[0];

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });

  it('calls login on successful signin', async () => {
    const fakeToken = 't1';
    const fakeUser = { id: 'u1', email: 'u@u.com', role: 'user' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { token: fakeToken, user: fakeUser } }),
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    // signin inputs
    const emailInput = screen.getAllByPlaceholderText('you@example.com')[1];
    const passwordInput = screen.getAllByPlaceholderText('••••••••')[1];
    const loginButton = screen.getAllByText(/Login/i)[0];

    fireEvent.change(emailInput, { target: { value: 'u@u.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(fakeToken, fakeUser);
      expect(screen.getByText(/Login successful/i)).toBeInTheDocument();
    });
  });
});
