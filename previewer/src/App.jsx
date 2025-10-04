import { useState, useEffect } from 'react';

function App() {
  const [manifest, setManifest] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    fetch('/template/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        if (data.templates.length > 0) {
          const first = data.templates[0];
          setSelectedTemplate(first.slug);
          setSelectedVariant(first.variants[0] || 'default');
          setSelectedPage(first.pages[0] || 'index.html');
        }
      })
      .catch(() => setManifest({ templates: [] }));
  }, []);

  if (!manifest) {
    return <div style={{ padding: '20px' }}>Loading manifest...</div>;
  }

  const currentTemplate = manifest.templates.find(t => t.slug === selectedTemplate);
  const variants = currentTemplate?.variants || [];
  const pages = currentTemplate?.pages || [];

  const handleTemplateChange = (slug) => {
    const tmpl = manifest.templates.find(t => t.slug === slug);
    setSelectedTemplate(slug);
    setSelectedVariant(tmpl?.variants[0] || 'default');
    setSelectedPage(tmpl?.pages[0] || 'index.html');
    setIframeKey(k => k + 1);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setIframeKey(k => k + 1);
  };

  const handlePageChange = (page) => {
    setSelectedPage(page);
    setIframeKey(k => k + 1);
  };

  const iframeSrc = selectedTemplate && selectedVariant && selectedPage
    ? `/template/${selectedTemplate}/${selectedVariant}/${selectedPage}`
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #ddd', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <strong>Template:</strong>
          <select value={selectedTemplate} onChange={(e) => handleTemplateChange(e.target.value)} style={{ padding: '6px 10px', fontSize: '14px' }}>
            {manifest.templates.map(t => (
              <option key={t.slug} value={t.slug}>{t.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <strong>Variant:</strong>
          <select value={selectedVariant} onChange={(e) => handleVariantChange(e.target.value)} style={{ padding: '6px 10px', fontSize: '14px' }}>
            {variants.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <strong>Page:</strong>
          <select value={selectedPage} onChange={(e) => handlePageChange(e.target.value)} style={{ padding: '6px 10px', fontSize: '14px' }}>
            {pages.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        {iframeSrc ? (
          <iframe
            key={iframeKey}
            src={iframeSrc}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Template Preview"
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No templates available. Use <code>refactor-cli ingest</code> to add templates.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
