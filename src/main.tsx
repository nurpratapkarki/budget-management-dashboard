
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add a script to prevent flashing in dark mode
const themeScript = document.createElement("script");
themeScript.innerHTML = `
  const currentTheme = localStorage.getItem('theme') || 'system';
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (currentTheme === 'dark' || (currentTheme === 'system' && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
`;
themeScript.setAttribute("type", "text/javascript");
document.head.prepend(themeScript);

createRoot(document.getElementById("root")!).render(<App />);
