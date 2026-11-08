import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// Default dark (gaya Threads) kalau belum pernah dipilih.
const saved = readSaved()
const isDark = ref(saved ? saved === 'dark' : true)

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

applyTheme()

watch(isDark, () => {
  try {
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  } catch {
    // Penyimpanan diblokir; tema tetap berlaku untuk sesi ini.
  }
  applyTheme()
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
