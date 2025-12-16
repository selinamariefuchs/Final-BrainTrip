# Create Directories
New-Item -ItemType Directory -Force -Path "components"
New-Item -ItemType Directory -Force -Path "services"

# Package.json
$packageJson = @'
{
  "name": "braintrip",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "cap": "cap"
  },
  "dependencies": {
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "@google/genai": "^1.31.0",
    "firebase": "^10.8.0",
    "lucide-react": "^0.556.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
'@
Set-Content -Path "package.json" -Value $packageJson

# TSConfig
$tsConfig = @'
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  },
  "include": ["."]
}
'@
Set-Content -Path "tsconfig.json" -Value $tsConfig

# Vite Config
$viteConfig = @'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});
'@
Set-Content -Path "vite.config.ts" -Value $viteConfig

# Capacitor Config
$capConfig = @'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.braintrip.app',
  appName: 'BrainTrip',
  webDir: 'dist'
};

export default config;
'@
Set-Content -Path "capacitor.config.ts" -Value $capConfig

# Git Ignore
$gitIgnore = @'
node_modules
dist
build
.DS_Store
.env
'@
Set-Content -Path ".gitignore" -Value $gitIgnore

# Index HTML
$indexHtml = @'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>BrainTrip</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      @keyframes particle { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
      @keyframes fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
      .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    </style>
  </head>
  <body class="bg-slate-50 text-slate-900 h-screen w-screen overflow-hidden">
    <div id="root" class="h-full w-full"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
'@
Set-Content -Path "index.html" -Value $indexHtml

# Index TSX
$indexTsx = @'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
'@
Set-Content -Path "index.tsx" -Value $indexTsx

Write-Host "Files created successfully!"