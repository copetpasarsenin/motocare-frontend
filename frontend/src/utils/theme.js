const THEME_KEY = 'motocare_theme'
const DARK_THEME = 'dark'
const LIGHT_THEME = 'light'

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || LIGHT_THEME
}

export function applyTheme(theme) {
  const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME
  document.documentElement.dataset.theme = nextTheme
  document.body.dataset.theme = nextTheme
  document.documentElement.style.colorScheme = nextTheme
}

export function saveTheme(theme) {
  const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME
  localStorage.setItem(THEME_KEY, nextTheme)
  applyTheme(nextTheme)
  return nextTheme
}

export function toggleTheme(currentTheme) {
  return saveTheme(currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME)
}
