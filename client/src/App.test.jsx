import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    
    // Check for the main heading
    expect(screen.getByRole('heading', { name: /SolarCharge Finder/i, level: 1 })).toBeInTheDocument();
    
    // Check for the description
    expect(screen.getByText(/Find solar charging stations near you/i)).toBeInTheDocument();
  });
});
