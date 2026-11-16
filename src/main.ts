import { Country } from './types';

const API_ENDPOINT = import.meta.env.VITE_RS_ENPOINT;

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

export async function searchCountries(query: string, signal?: AbortSignal): Promise<Country[]> {
  const url = `${API_ENDPOINT}/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Failed to fetch countries: ${response.status} ${response.statusText}`
    );
  }

  const data: Country[] = await response.json();
  return data;
}

export function mapCountryResponse(raw: unknown): Country {
  throw new Error('Not implemented');
}
