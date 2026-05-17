// Fix for Node.js v22+ global localStorage without --localstorage-file
// This patches localStorage on the server side to prevent "localStorage.getItem is not a function" errors
export function register() {
  if (typeof localStorage !== 'undefined' && typeof localStorage.getItem !== 'function') {
    const store = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value) },
        removeItem: (key: string) => { store.delete(key) },
        clear: () => { store.clear() },
        get length() { return store.size },
        key: (index: number) => [...store.keys()][index] ?? null,
      },
      writable: true,
      configurable: true,
    })
  }
}
