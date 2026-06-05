import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
          <div className="bg-[#111118] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="font-display font-bold text-white text-xl mb-2">Something went wrong</h2>
            <p className="text-white/40 text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-left">
              <p className="text-red-400 text-xs font-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)' }}>
                🔄 Refresh Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard' }}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
