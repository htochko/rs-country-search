import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, searchCountries, HttpError, mapCountryResponse } from '../src/main';
import { Country } from '../src/types';

const DELAY_TIME = 300;
const TIME_EDGE = 2000;

describe('Initial Setup', () => {
  it('should pass initial test', () => {
    expect(true).toBe(true);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should delay function execution by the specified delay', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, DELAY_TIME);

    debouncedFn();
    // debounced function shouldn't be called at once
    expect(callback).not.toHaveBeenCalled();

    // check time slowly less than param applied
    vi.advanceTimersByTime(DELAY_TIME - 1);
    expect(callback).not.toHaveBeenCalled();

    // add 1ms that left
    vi.advanceTimersByTime(1);
    // S (Self-validating): check result
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset the delay timer if invoked again within the window', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, DELAY_TIME);

    debouncedFn('first');
    vi.advanceTimersByTime(DELAY_TIME / 2);

    // renewed call shold reset
    debouncedFn('second');
    vi.advanceTimersByTime(DELAY_TIME / 2);
    expect(callback).not.toHaveBeenCalled();

    // wait for second call
    vi.advanceTimersByTime(DELAY_TIME / 2);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('should handle multiple rapid calls correctly, executing only the last one', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, DELAY_TIME - 100);

    debouncedFn(1);
    debouncedFn(2);
    debouncedFn(3);

    vi.advanceTimersByTime(199);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(3);
  });
});

describe('searchCountries function (FIRST principles)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    // F (Fast) & R (Repeatable): Replace fetch with mock
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    // I (Isolated): clear mocks
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should successfully fetch and return countries data on ok response', async () => {
    const mockCountries = [{ name: 'Poland', capital: 'Warsaw' }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries,
    });

    const controller = new AbortController();
    const result = await searchCountries('Poland', controller.signal);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('Poland'),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
    expect(result).toEqual(mockCountries);
  });

  it('should throw HttpError when response.ok is false (e.g. 404 or 500)', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const controller = new AbortController();

    // HttpError theown for invalid country input
    await expect(searchCountries('Unknown', controller.signal)).rejects.toThrow(HttpError);

    try {
      await searchCountries('Unknown', controller.signal);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(404);
    }
  });

  it('should correctly pass AbortSignal to fetch options', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const controller = new AbortController();
    await searchCountries('test', controller.signal);

    const callArgs = mockFetch.mock.calls[0];
    const options = callArgs[1];

    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it('should throw TimeoutError when request takes too long', async () => {
    // long respponse
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          // request longer than timeout
          setTimeout(resolve, TIME_EDGE);
        })
    );

    // too short timeout
    const timeoutSignal = AbortSignal.timeout(TIME_EDGE / 10);

    await expect(searchCountries('Poland', timeoutSignal)).rejects.toThrow();
  });

  it('should handle user AbortError correctly when signal is aborted', async () => {
    const controller = new AbortController();

    controller.abort();

    mockFetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));

    const promise = searchCountries('Poland', controller.signal);

    await expect(promise).rejects.toThrow();
  });
});

describe('mapCountryResponse function (FIRST principles)', () => {
  it('should correctly map raw CountryDto to clean domain model', () => {
    const rawDto: Partial<Country> = {
      name: 'Poland',
      capital: ['Warsaw'],
      flags: { svg: 'https://flagcdn.com/pl.svg', png: 'https://flagcdn.com/w320/pl.png' },
      population: 37950000,
    };

    const result = mapCountryResponse(rawDto);

    // S (Self-validating): proprty map match
    expect(result).toEqual({
      name: 'Poland',
      capital: 'Warsaw',
      flagUrl: 'https://flagcdn.com/pl.svg',
      population: 37950000,
    });
  });

  it('should handle missing optional fields gracefully (e.g. no capital)', () => {
    const rawDtoWithoutCapital: Partial<Country> = {
      name: 'Antarctica',
      // capital absent
      flags: { svg: 'https://flagcdn.com/aq.svg', png: 'https://flagcdn.com/w320/aq.png' },
      population: 0,
    };

    const result = mapCountryResponse(rawDtoWithoutCapital);

    expect(result).toEqual({
      name: 'Antarctica',
      capital: 'N/A',
      flagUrl: 'https://flagcdn.com/aq.svg',
      population: 0,
    });
  });
});
