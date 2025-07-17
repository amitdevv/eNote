

import React from 'react';

export const ExcelDraw: React.FC = () => {
  return (
    <div>
      
       <iframe
  src="https://excalidraw.com/"
  width="100%"
  height="600"
  allow="clipboard-write"
  sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
  className="rounded-lg border"
/>

    </div>
  );
};