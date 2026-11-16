import { Country, CountryOutput } from './types';

const API_ENDPOINT = import.meta.env.VITE_RS_ENPOINT;
const RESPONSE_TIME = 2000;

export class HttpError extends Error {
  public status: number;

  constructor(status: number, message: string = `HTTP Error: ${status}`) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export async function searchCountries(
  query: string,
  customSignal?: AbortSignal
): Promise<Country[]> {
  const url = `${API_ENDPOINT}/name/${encodeURIComponent(query)}`;

  const timeoutSignal = AbortSignal.timeout(RESPONSE_TIME);
  const signal = customSignal ? AbortSignal.any([customSignal, timeoutSignal]) : timeoutSignal;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new HttpError(
        response.status,
        `Failed to fetch countries: ${response.status} ${response.statusText}`
      );
    }

    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out');
      }
      if (error.name === 'AbortError') {
        throw error;
      }
    }
    throw error;
  }
}

export function mapCountryResponse(raw: Partial<Country>): CountryOutput {
  return {
    name: raw.name as unknown as string,
    capital: raw.capital && raw.capital.length > 0 ? raw.capital[0] : 'N/A',
    flagUrl: raw.flags?.svg || (raw.flags?.png as unknown as string),
    population: raw.population as unknown as number,
  };
}
