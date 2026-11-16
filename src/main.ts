import { Country } from './types';

export class HttpError extends Error {}

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

export function searchCountries(query: URLSearchParams, signal?: Promise<Country[]>) {
  throw new Error('Not implemented');
}

export function mapCountryResponse(raw: unknown): Country {
  throw new Error('Not implemented');
}
