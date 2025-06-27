// Configuration des URLs de base pour l'application
export const APP_CONFIG = {
  BASE_URL: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000',
  API_BASE_URL: 'http://127.0.0.1:8000/api',
  ASSETS_BASE_URL: import.meta.env.VITE_ASSETS_BASE_URL || 'http://localhost:3000'
}

// Helper pour construire les URLs d'assets
export const getAssetUrl = (path: string): string => {
  return `${APP_CONFIG.ASSETS_BASE_URL}/${path}`
} 