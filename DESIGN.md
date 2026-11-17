# Design & Architecture

Key architectural decisions, algorithmic complexity, and clean code principles description

## 1. Rationale for Cancellation Mechanism and Debounce Delay Selection

### Request Cancellation Mechanism

To prevent race conditions and optimize network resources, a combination of `AbortController` and `AbortSignal.any([...])` is used.

- **Composite Signal:** The `searchCountries` function accepts an external `AbortSignal` (e.g., from previous user input) and combines it with an internal timeout signal using `AbortSignal.any([customSignal, AbortSignal.timeout(ms)])`.
- **Error Separation:** The architecture explicitly distinguishes between user-initiated cancellation (`AbortError`, triggered on new input) and timeout expiration (`TimeoutError`). Previous outdated requests are aborted instantly at the network level, preventing outdated data from appearing in the UI.

### Debounce Delay Selection (300ms used to be sure user finished typing)

- **Typing Speed Threshold:** The 300ms interval is chosen to delay request - short enough for the interface to feel instant, yet long to prevent redundant HTTP requests for every single keystroke.

## 2. Big O for `mapCountryResponse`

### Mapping Function (`mapCountryResponse`)

- **Time Complexity:** $O(1)$
  - _Rationale:_ Mapping a single country object performs a fixed number of property access operations and primitive transformations (type checking, extracting the zero index of capital arrays, selecting the SVG flag URL). Limited number of fields mapped to API response.
- **Space Complexity:** $O(1)$
  - _Rationale:_ The function creates and returns a new flat object of fixed structure (`CountryOutput`), requiring a constant amount of memory.

### Caching (`localStorage` / In-Memory Cache) — Bonus

- **Read / Write Time Complexity:** $O(1)$ (on average for hash tables / `localStorage` keys)
  - _Rationale:_ Searching or writing a saved result by search query key (e.g., `"poland"`) is done in constant time via key-value mechanisms. (Note: JSON serialization/deserialization for a string of length $M$ takes $O(M)$, but since the search query and response length are small, complexity is effectively treated as constant).
- **Space Complexity:** $O(K \times M)$
  - _Rationale:_ Where $K$ is the number of saved unique search queries in the cache, and $M$ is the average size of the JSON string with results for a single query. Caching prevents memory leaks.

## 3. Clean Code Principles and Their Application

The codebase strictly adheres to SOLID, KISS, and DRY principles:

1. **Single Responsibility Principle:**
   - _Where applied:_ Modular separation of concerns. Network requests are encapsulated in `searchCountries`, raw data transformation into the domain model is extracted into a pure function `mapCountryResponse`, and UI state/`localStorage` management is handled in client application part.
2. **FIRST Principles in Unit Tests:**
   - _Where applied:_ Tests (Vitest) are written in isolation: they are Fast, Isolated, Repeatable, Self-validating, and cover edge cases (Timers, Abort, HTTP 404/5**).
