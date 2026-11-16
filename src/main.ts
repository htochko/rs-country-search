import { Country } from './types'

export class HttpError extends Error {

}

export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number
): (...args: Parameters<F>) => void {
    throw new Error('Not implemented');
}

export function searchCountries(query: URLSearchParams, signal?: Promise<Country[]>) {
    throw new Error('Not implemented');
}

export function mapCountryResponse(raw: unknown): Country {
    throw new Error('Not implemented');
}