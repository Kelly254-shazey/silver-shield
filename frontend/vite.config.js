import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  // Use root-relative asset URLs for the production root-domain deployment.
  base: '/',
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
            './src/pages/StoriesPage.jsx',
            './src/pages/StoryDetailsPage.jsx',
            './src/pages/BlogPage.jsx',
            './src/pages/BlogDetailsPage.jsx',
            './src/pages/DonatePage.jsx',
            './src/pages/ContactPage.jsx',
            './src/pages/AboutPage.jsx',
            './src/pages/EventsPage.jsx',
            './src/pages/TeamPage.jsx',
            './src/pages/VolunteerPage.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
