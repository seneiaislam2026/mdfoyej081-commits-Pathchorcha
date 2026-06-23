import { StrictMode, Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Safely register service worker. Force update and reload to ensure users get the latest version.
if ((window as any).addPwaLog) {
  (window as any).addPwaLog('info', 'Registering Service Worker via virtual:pwa-register...');
}
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New update available for PWA. Reloading...");
    if ((window as any).addPwaLog) {
      (window as any).addPwaLog('warn', 'New PWA update available. Triggering refresh...');
    }
    updateSW(true).then(() => {
      window.location.reload();
    });
  },
  onOfflineReady() {
    console.log("PWA is ready to work offline.");
    if ((window as any).addPwaLog) {
      (window as any).addPwaLog('success', 'Service Worker registered! Content cached for offline usage.');
    }
  },
  onRegisterError(error) {
    console.error("SW Registration Error:", error);
    if ((window as any).addPwaLog) {
      (window as any).addPwaLog('error', 'Service Worker registration failed: ' + (error?.message || error));
    }
  }
});

// Request Push Notification permission
if ('Notification' in window) {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    }
  });
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


