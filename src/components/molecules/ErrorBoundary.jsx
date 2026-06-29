import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary-card">
          <div className="error-boundary-icon" aria-hidden="true">
            <AlertTriangle size={28} />
          </div>
          <h2>Something went wrong</h2>
          <p>Terjadi kesalahan yang tidak terduga. Tim kami sudah mencatat masalah ini.</p>
          {this.state.error?.message ? (
            <pre className="error-boundary-detail">{this.state.error.message}</pre>
          ) : null}
          <button className="primary-button" type="button" onClick={this.handleReset}>
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
