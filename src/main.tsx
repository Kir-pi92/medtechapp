import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './LanguageContext.tsx'
import { TemplateProvider } from './TemplateContext.tsx'
import { AuthProvider } from './AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <TemplateProvider>
          <App />
        </TemplateProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
