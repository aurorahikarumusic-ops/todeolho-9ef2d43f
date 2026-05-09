import React from 'react';

const Index = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'fixed', inset: 0 }}>
      <iframe 
        src="/index.html" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Flora 40+ Dashboard"
      />
    </div>
  );
};

export default Index;
