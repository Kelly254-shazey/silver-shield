import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Admin pages chunk
          'admin-pages': [
            './src/pages/admin/AdminDashboardPage.jsx',
            './src/pages/admin/AdminEntityPage.jsx',
            './src/pages/admin/AdminInboxPage.jsx',
            './src/pages/admin/AdminDocsPage.jsx',
            './src/pages/admin/AdminDonationsPage.jsx',
            './src/pages/admin/AdminLoginPage.jsx',
          ],
          
          // Public pages chunk
          'public-pages': [
            './src/pages/HomePage.jsx',
            './src/pages/ProgramsPage.jsx',
            './src/pages/ProgramDetailsPage.jsx',
            './src/pages/ImpactPage.jsx',
            './src/pages/StoriesPage.jsx',
            './src/pages/StoryDetailsPage.jsx',
            './src/pages/DonatePage.jsx',
            './src/pages/ContactPage.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
