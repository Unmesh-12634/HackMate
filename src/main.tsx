import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./app/App.tsx";
import "./styles/index.css";

import { Component, ReactNode, ErrorInfo } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
    componentDidCatch(error: Error, info: ErrorInfo) { console.error("Global Error:", error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, background: '#1e0f0f', color: '#ffb3b3', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h2>App Crashed!</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(this.state.error)}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// Automatically update the service worker
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
