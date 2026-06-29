import ErrorBoundary from './components/molecules/ErrorBoundary'
import AppRoutes from './routes/AppRoutes'
import './App.css'
import './ui-fixes.css'
import './styles/typography.css'

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App

