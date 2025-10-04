const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_TEMPLATE_DIR = path.join(ROOT, 'previewer/public/template');
const KITS_DIR = path.join(ROOT, 'kits');

const JQUERY_PLUGINS = ['scrolly', 'scrollex', 'dropotron'];

async function generate({ slug, variant, out }) {
  console.log(chalk.blue('→ Generating MERN kit...'));

  const sourceDir = path.join(PUBLIC_TEMPLATE_DIR, slug, variant);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Template variant not found: ${slug}/${variant}`);
  }

  const kitDir = path.join(KITS_DIR, out);
  await fs.remove(kitDir);
  await fs.ensureDir(kitDir);

  // Generate server
  await generateServer(kitDir, out);

  // Generate client
  await generateClient(kitDir, out, slug, variant, sourceDir);

  console.log(chalk.green(`  ✓ Kit created at kits/${out}/`));
}

async function generateServer(kitDir, kitName) {
  const serverDir = path.join(kitDir, 'server');
  await fs.ensureDir(serverDir);

  const packageJson = {
    name: `${kitName}-server`,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'node server.js'
    },
    dependencies: {
      express: '^4.21.2',
      cors: '^2.8.5'
    }
  };

  const serverJs = `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: '${kitName}',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: '${kitName} API server' });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(\`✓ Server running on http://localhost:\${PORT}\`);
});
`;

  await fs.writeFile(path.join(serverDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  await fs.writeFile(path.join(serverDir, 'server.js'), serverJs);

  console.log(chalk.dim('  Generated server/'));
}

async function generateClient(kitDir, kitName, slug, variant, sourceDir) {
  const clientDir = path.join(kitDir, 'client');
  await fs.ensureDir(clientDir);

  const packageJson = {
    name: `${kitName}-client`,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      axios: '^1.7.9'
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.3.4',
      vite: '^6.0.3',
      tailwindcss: '^3.4.17',
      postcss: '^8.4.49',
      autoprefixer: '^10.4.20'
    }
  };

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true
      }
    }
  }
});
`;

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${kitName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

  const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const appJsx = `import Home from './pages/Home';

function App() {
  return <Home />;
}

export default App;
`;

  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
`;

  const homeJsx = `import { useEffect, useState } from 'react';
import { apiClient } from '../api';

function Home() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    apiClient.get('/health')
      .then(res => setHealth(res.data))
      .catch(err => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">${kitName}</h1>
        {health && (
          <p className="text-sm text-green-600 mt-1">
            ✓ API Connected: {health.service} at {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        )}
      </header>
      <main className="p-4">
        <iframe
          src="/${slug}/${variant}/index.html"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 120px)' }}
          title="Template Preview"
        />
      </main>
    </div>
  );
}

export default Home;
`;

  const apiJs = `import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api'
});
`;

  await fs.writeFile(path.join(clientDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  await fs.writeFile(path.join(clientDir, 'vite.config.js'), viteConfig);
  await fs.writeFile(path.join(clientDir, 'tailwind.config.js'), tailwindConfig);
  await fs.writeFile(path.join(clientDir, 'postcss.config.js'), postcssConfig);
  await fs.writeFile(path.join(clientDir, 'index.html'), indexHtml);

  const srcDir = path.join(clientDir, 'src');
  await fs.ensureDir(srcDir);
  await fs.writeFile(path.join(srcDir, 'main.jsx'), mainJsx);
  await fs.writeFile(path.join(srcDir, 'App.jsx'), appJsx);
  await fs.writeFile(path.join(srcDir, 'index.css'), indexCss);
  await fs.writeFile(path.join(srcDir, 'api.js'), apiJs);

  const pagesDir = path.join(srcDir, 'pages');
  await fs.ensureDir(pagesDir);
  await fs.writeFile(path.join(pagesDir, 'Home.jsx'), homeJsx);

  // Copy template files to public/<slug>/<variant>/
  const publicDir = path.join(clientDir, 'public', slug, variant);
  await fs.ensureDir(publicDir);
  await fs.copy(sourceDir, publicDir);

  // Auto-stub jQuery plugins
  await stubJQueryPlugins(publicDir);

  // Ensure $ shim in HTML files
  await ensureDollarShim(publicDir);

  console.log(chalk.dim('  Generated client/'));
}

async function stubJQueryPlugins(publicDir) {
  const assetsJsDir = path.join(publicDir, 'assets/js');
  if (!fs.existsSync(assetsJsDir)) return;

  for (const plugin of JQUERY_PLUGINS) {
    const pluginFile = path.join(assetsJsDir, `jquery.${plugin}.min.js`);
    const pluginFileAlt = path.join(assetsJsDir, `jquery.${plugin}.js`);
    
    const targetFile = fs.existsSync(pluginFile) ? pluginFile : pluginFileAlt;
    
    if (!fs.existsSync(targetFile)) {
      const stub = `// ${plugin} stub\n!function($){$.fn.${plugin}=function(){return this}}(window.jQuery||window.$);\n`;
      await fs.writeFile(pluginFile, stub);
      console.log(chalk.dim(`    Stubbed jquery.${plugin}.min.js`));
    }
  }
}

async function ensureDollarShim(publicDir) {
  const htmlFiles = await fs.readdir(publicDir);
  
  for (const file of htmlFiles) {
    if (!file.endsWith('.html')) continue;
    
    const htmlPath = path.join(publicDir, file);
    let html = await fs.readFile(htmlPath, 'utf8');
    
    // Check if already has $ shim
    if (html.includes('window.$ = window.$ || window.jQuery')) continue;
    
    // Find jQuery script tag and inject $ shim after it
    const jqueryRegex = /(<script[^>]*src=["'][^"']*jquery\.min\.js["'][^>]*><\/script>)/i;
    const match = html.match(jqueryRegex);
    
    if (match) {
      const shim = '\n\t\t<script>window.$ = window.$ || window.jQuery;</script>';
      html = html.replace(jqueryRegex, `$1${shim}`);
      await fs.writeFile(htmlPath, html);
      console.log(chalk.dim(`    Added $ shim to ${file}`));
    }
  }
}

module.exports = generate;