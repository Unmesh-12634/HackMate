import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./app/App.tsx";
import "./styles/index.css";

// Automatically update the service worker
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
