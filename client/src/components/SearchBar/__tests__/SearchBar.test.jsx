import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import SearchBar from '../SearchBar';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock FilterDropdown
vi.mock('../FilterDropdown', () => ({
  default: () => <div>FilterDropdown Component</div>,
}));

// test rendering of search input and filter dropdown
it('updates input value when typing', () => {
  render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );

  const input = screen.getByPlaceholderText('Search by city, zip code, or address...');

  fireEvent.change(input, { target: { value: 'Colombo' } });

  expect(input.value).toBe('Colombo');
});

//submitting query test - navigate with correct query params
it('navigates with correct query params on submit', () => {
  render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );

  const input = screen.getByPlaceholderText('Search by city, zip code, or address...');
  const button = screen.getByText('Search Stations');

  fireEvent.change(input, { target: { value: 'Colombo' } });
  fireEvent.click(button);

  expect(mockNavigate).toHaveBeenCalledWith(
    '/search?search=Colombo&district=&status=&connectorType='
  );
});

// test filter dropdown toggle
it('shows FilterDropdown when filter button is clicked', () => {
  render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );

  const filterBtn = screen.getByRole('button', { name: '' });
  fireEvent.click(filterBtn);

  expect(screen.getByText('FilterDropdown Component')).toBeInTheDocument();
});

// popular tag query test
it('sets query when popular tag is clicked', () => {
  render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );

  const tag = screen.getByText('Colombo');
  const input = screen.getByPlaceholderText('Search by city, zip code, or address...');

  fireEvent.click(tag);

  expect(input.value).toBe('Colombo');
});
