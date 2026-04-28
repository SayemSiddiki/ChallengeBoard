import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { HomePage } from './screens/HomePage'
import { BoardPage } from './screens/BoardPage'
import { HistoryPage } from './screens/HistoryPage'
import { SettingsPage } from './screens/SettingsPage'
import { AuthPage } from './screens/AuthPage'
import { RulesPage } from './screens/RulesPage'
import { AuthCallbackPage } from './screens/AuthCallbackPage'
import { PrivacyPage } from './screens/PrivacyPage'
import { TermsPage } from './screens/TermsPage'
import { ContactPage } from './screens/ContactPage'
import { BudgetPage } from './screens/BudgetPage'
import { BudgetChallengePage } from './screens/BudgetChallengePage'

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/home', element: <HomePage /> },
      { path: '/rules', element: <RulesPage /> },
      { path: '/board', element: <BoardPage /> },
      { path: '/budget', element: <BudgetPage /> },
      { path: '/budget/challenge', element: <BudgetChallengePage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/contact', element: <ContactPage /> },
    ],
  },
])

