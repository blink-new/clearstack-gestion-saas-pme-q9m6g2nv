import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './layouts/AppLayout'
import { RealisationsPage } from './modules/gamification/pages/RealisationsPage'
import { AdminDashboardPage } from './modules/dashboard/pages/AdminDashboardPage'
import { SoftwareDetailPage } from './modules/software/pages/SoftwareDetailPage'
import { RequestListPage } from './modules/requests/pages/RequestListPage'
import { RequestDetailPage } from './modules/requests/pages/RequestDetailPage'
import { PurchaseProjectPage } from './modules/purchase/pages/PurchaseProjectPage'
import { ImportWizardPage } from './modules/import/pages/ImportWizardPage'
import { NotificationCenterPage } from './modules/notifications/pages/NotificationCenterPage'
import { HelpCenterPage } from './modules/help/pages/HelpCenterPage'
import { BetaFlagsPage } from './modules/admin/pages/BetaFlagsPage'
import { ReferralsPage } from './modules/referrals/pages/ReferralsPage'
import { PrivacyPolicy } from './modules/legal/pages/PrivacyPolicy'
import { TermsOfUse } from './modules/legal/pages/TermsOfUse'
import { HelpBeacon } from './modules/help/components/HelpBeacon'
import { AppTour } from './modules/help/tours/AppTour'
import { useAppTour } from './modules/help/hooks/useAppTour'
import { ReleaseGate } from './components/ReleaseGate'
import { BetaFeedbackWidget } from './components/BetaFeedbackWidget'
import { useAnalytics } from './hooks/useAnalytics'
import { AppBootstrap } from './components/AppBootstrap'
import './App.css'

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Mock user pour la démo
const mockUser = { id: 'user-demo', role: 'USER', email: 'user@demo.co' }

function App() {
  const { isTourVisible, completeTour, skipTour } = useAppTour()
  const { identify } = useAnalytics()
  const [currentPage, setCurrentPage] = React.useState('realisations')

  React.useEffect(() => {
    // Identifier l'utilisateur pour les analytics
    identify(mockUser.id, {
      email: mockUser.email,
      role: mockUser.role
    })
  }, [identify])

  // Garde-fou développement pour neutraliser les overlays
  React.useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      import('./lib/overlayGuard').then(m => m.overlayGuard())
    }
  }, [])

  // Simple routing basé sur l'URL
  React.useEffect(() => {
    const path = window.location.pathname
    if (path === '/confidentialite') {
      setCurrentPage('privacy')
    } else if (path === '/mentions-legales') {
      setCurrentPage('terms')
    } else {
      setCurrentPage('referrals')
    }
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'privacy':
        return <PrivacyPolicy />
      case 'terms':
        return <TermsOfUse />
      case 'dashboard':
        return <AdminDashboardPage />
      case 'realisations':
        return <RealisationsPage />
      case 'software':
        return <SoftwareDetailPage />
      case 'requests':
        return <RequestListPage />
      case 'projects':
        return <PurchaseProjectPage />
      case 'import':
        return <ImportWizardPage />
      case 'notifications':
        return <NotificationCenterPage />
      case 'help':
        return <HelpCenterPage />
      case 'beta-flags':
        return <BetaFlagsPage />
      default:
        return <RealisationsPage />
    }
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppBootstrap />
        {/* ReleaseGate temporairement désactivé pour les tests */}
        <AppLayout>
          {renderCurrentPage()}
          
          {/* Autres pages disponibles pour test : */}
          {/* <AdminDashboardPage /> */}
          {/* <RealisationsPage /> */}
          {/* <SoftwareDetailPage /> */}
          {/* <RequestListPage /> */}
          {/* <RequestDetailPage /> */}
          {/* <PurchaseProjectPage /> */}
          {/* <ImportWizardPage /> */}
          {/* <NotificationCenterPage /> */}
          {/* <HelpCenterPage /> */}
          
          {/* Widget d'aide contextuelle */}
          <HelpBeacon articleSlug="default" />
          
          {/* Widget feedback bêta */}
          <BetaFeedbackWidget page="help-center" role={mockUser.role} />
          
          {/* Tutoriel d'onboarding */}
          <AppTour
            isVisible={isTourVisible}
            onComplete={completeTour}
            onSkip={skipTour}
          />
        </AppLayout>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App