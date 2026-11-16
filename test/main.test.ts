import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/main';

const DELAY_TIME = 300;

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

    // Проматываем время почти до конца
    vi.advanceTimersByTime(DELAY_TIME - 1);
    expect(callback).not.toHaveBeenCalled();

    // Проходим оставшийся 1мс
    vi.advanceTimersByTime(1);
    // S (Self-validating): Четкая проверка результата
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
