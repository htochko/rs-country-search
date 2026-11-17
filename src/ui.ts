import { CountryOutput } from './types';

// Renders the list of countries or corresponding state (loading, error, empty)
export function renderCountries(
  container: HTMLElement,
  countries: CountryOutput[],
  isLoading: boolean,
  error: string | null
): void {
  // Clear previous content
  container.innerHTML = '';

  // Render loading state
  if (isLoading) {
    container.innerHTML = '<div class="loader" role="status">Loading countries...</div>';
    return;
  }

  // Render error state with retry option
  if (error) {
    container.innerHTML = `
      <div class="error-state" role="alert">
        <p class="error-message">${error}</p>
        <button id="retry-btn" class="btn-retry" type="button">Retry</button>
      </div>
    `;
    return;
  }

  // Render empty state if search returned no results
  if (countries.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No countries found matching your request.</div>';
    return;
  }

  // Render successful results list
  const listElement = document.createElement('ul');
  listElement.className = 'country-list';

  countries.forEach((country) => {
    const itemElement = document.createElement('li');
    itemElement.className = 'country-card';
    itemElement.setAttribute('data-country-name', country.name);

    itemElement.innerHTML = `
      <img class="country-flag" src="${country.flagUrl}" alt="Flag of ${country.name}" width="40" loading="lazy" />
      <div class="country-info">
        <span class="country-name">${country.name}</span>
        <span class="country-capital">Capital: ${country.capital}</span>
      </div>
    `;

    listElement.appendChild(itemElement);
  });

  container.appendChild(listElement);
}

// Opens the detail modal window with country information
export function openCountryModal(country: CountryOutput): void {
  const modal = document.getElementById('country-modal') as HTMLDialogElement;
  if (!modal) return;

  const modalName = document.getElementById('modal-name');
  const modalCapital = document.getElementById('modal-capital');
  const modalPopulation = document.getElementById('modal-population');
  const modalFlag = document.getElementById('modal-flag') as HTMLImageElement;

  if (modalName) modalName.textContent = country.name;
  if (modalCapital) modalCapital.textContent = country.capital;
  if (modalPopulation) modalPopulation.textContent = country.population.toLocaleString();
  if (modalFlag) {
    modalFlag.src = country.flagUrl;
    modalFlag.alt = `Flag of ${country.name}`;
  }

  modal.showModal();
}

// Sets up close event listeners for the modal dialog
export function setupModalListeners(): void {
  const modal = document.getElementById('country-modal') as HTMLDialogElement;
  const closeBtn = document.getElementById('close-modal');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  // Close modal on backdrop click
  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.bottom &&
      rect.left <= event.clientX &&
      event.clientX <= rect.right;

    if (!isInDialog) {
      modal.close();
    }
  });
}
