/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'customLight',
    themes: {
      customLight: {
        dark: false,
        colors: {
          // Couleurs principales de votre thème
          primary: '#5865f2',           // color-1
          'primary-lighten-1': '#737bd7', // color-2
          'primary-darken-1': '#4b5aff',  // color-3
          'primary-darken-2': '#0d1aa4',  // color-4
          
          // Couleurs secondaires basées sur votre palette
          secondary: '#737bd7',         // color-2
          accent: '#4b5aff',           // color-3
          
          // Couleurs de surface et arrière-plan
          surface: '#ffffff',
          'surface-variant': '#e6e8fd', // color-5
          'surface-bright': '#ffffff',
          'surface-light': '#f8f9ff',
          'surface-dark': '#e6e8fd',
          
          // Couleurs d'état
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#2196f3',
          
          // Couleurs de texte
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#1a1a1a',
          'on-surface-variant': '#424242',
          'on-background': '#1a1a1a',
          
          // Arrière-plan
          background: '#fafbff',
          
          // Bordures et dividers
          outline: '#e0e0e0',
          'outline-variant': '#e6e8fd',
        },
      },
      customDark: {
        dark: true,
        colors: {
          // Couleurs principales adaptées pour le mode sombre
          primary: '#737bd7',           // color-2 (plus doux pour le dark)
          'primary-lighten-1': '#8a91e0',
          'primary-darken-1': '#5865f2', // color-1
          'primary-darken-2': '#4b5aff', // color-3
          
          // Couleurs secondaires
          secondary: '#8a91e0',
          accent: '#737bd7',
          
          // Couleurs de surface pour le mode sombre
          surface: '#121212',
          'surface-variant': '#2a2d3a',
          'surface-bright': '#1e1e1e',
          'surface-light': '#1a1a1a',
          'surface-dark': '#0a0a0a',
          
          // Couleurs d'état adaptées
          success: '#66bb6a',
          warning: '#ffb74d',
          error: '#ef5350',
          info: '#42a5f5',
          
          // Couleurs de texte pour le dark
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#ffffff',
          'on-surface-variant': '#b0b0b0',
          'on-background': '#ffffff',
          
          // Arrière-plan sombre
          background: '#0a0a0a',
          
          // Bordures et dividers pour le dark
          outline: '#404040',
          'outline-variant': '#2a2d3a',
        },
      },
      // Thème original conservé pour compatibilité
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})
