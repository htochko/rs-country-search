// main.ts — Application entry point

import { searchCountries } from './api';
import { renderCountries, openCountryModal, setupModalListeners } from './ui';
import { CountryOutput } from './types';

const appContainer = document.createElement('div');
appContainer.id = 'app-root';

const searchInput = document.createElement('input');
searchInput.id = 'search-input';
searchInput.type = 'text';
searchInput.placeholder = 'Search for a country...';

const countriesContainer = document.createElement('div');
countriesContainer.id = 'countries-container';

appContainer.appendChild(searchInput);
appContainer.appendChild(countriesContainer);
document.body.appendChild(appContainer);

console.log('test');

let currentAbortController: AbortController | null = null;
let lastQuery = '';
let cachedCountries: CountryOutput[] = [];

// Initialize modal listeners on app startup
setupModalListeners();

// Main search execution handler
async function executeSearch(query: string): Promise<void> {
  lastQuery = query;

  // Clear results if input is empty
  if (!query.trim()) {
    renderCountries(countriesContainer, [], false, null);
    return;
  }

  // Abort previous ongoing request before starting a new one
  if (currentAbortController) {
    currentAbortController.abort();
  }

  currentAbortController = new AbortController();

  // Show loading state
  renderCountries(countriesContainer, [], true, null);

  try {
    const results = await searchCountries(query, currentAbortController.signal);
    cachedCountries = results;
    // Render successful results
    renderCountries(countriesContainer, results, false, null);
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      renderCountries(countriesContainer, [], false, 'An unknown error occurred.');
      return;
    }
    // Ignore user-initiated abort errors
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }
    // Render error state with message
    renderCountries(countriesContainer, [], false, err.message || 'Failed to fetch countries.');
  }
}

// Event listener for user typing (search input)
searchInput.addEventListener('input', (event) => {
  const query = (event.target as HTMLInputElement).value;
  executeSearch(query);
});

// Event delegation for dynamic elements inside container (Retry button & Country cards)
countriesContainer.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  // Handle click on "Retry" button
  if (target.id === 'retry-btn') {
    if (lastQuery) {
      executeSearch(lastQuery);
    }
    return;
  }

  // Handle click on country card to open modal detail view
  const card = target.closest('.country-card');
  if (card) {
    const countryName = card.getAttribute('data-country-name');
    const country = cachedCountries.find((c) => c.name === countryName);
    if (country) {
      openCountryModal(country);
    }
  }
});
