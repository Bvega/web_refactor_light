import { useEffect, useState } from 'react';
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
        <h1 className="text-2xl font-bold text-gray-800">pex-helio-cyan</h1>
        {health && (
          <p className="text-sm text-green-600 mt-1">
            ✓ API Connected: {health.service} at {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        )}
      </header>
      <main className="p-4">
        <iframe
          src="/px-helios-html/cyan/index.html"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 120px)' }}
          title="Template Preview"
        />
      </main>
    </div>
  );
}

export default Home;
