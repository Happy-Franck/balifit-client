// Configuration des URLs de base pour l'application
export const APP_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  API_BASE_URL: 'http://127.0.0.1:8000/api',
  STORAGE_BASE_URL: 'http://localhost:8000/storage',
  ASSETS_BASE_URL: 'http://localhost:3000'
}

// Helper pour construire les URLs d'API
export const getApiUrl = (endpoint: string): string => {
  return `${APP_CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

// Helper pour construire les URLs d'assets
export const getAssetUrl = (path: string): string => {
  return `${APP_CONFIG.ASSETS_BASE_URL}/${path}`
}

// Helper pour construire les URLs de storage (avatars, images, etc.)
export const getStorageUrl = (path: string): string => {
  return `${APP_CONFIG.STORAGE_BASE_URL}/${path}`
}

// Helper spécialisé pour les avatars
export const getAvatarUrl = (avatarPath: string): string => {
  if (!avatarPath) return '';
  return getStorageUrl(avatarPath);
}

// Helper spécialisé pour les avatars de coach
export const getCoachAvatarUrl = (avatarPath: string): string => {
  if (!avatarPath) return '';
  return getStorageUrl(`avatars/${avatarPath}`);
} 