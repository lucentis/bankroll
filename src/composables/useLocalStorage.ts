const PREFIX = 'bankroll:'

export function useStorage() {
  const get = <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  const set = <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      console.error(`useStorage: failed to write key "${key}"`)
    }
  }

  const remove = (key: string): void => {
    localStorage.removeItem(PREFIX + key)
  }

  return { get, set, remove }
}