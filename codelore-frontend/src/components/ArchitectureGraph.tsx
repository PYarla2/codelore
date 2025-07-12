import React, { useEffect, useRef } from 'react';

interface ArchitectureGraphProps {
  mermaidCode: string;
}

const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ mermaidCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !mermaidCode) return;

      try {
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Import mermaid dynamically
        const mermaid = await import('mermaid');
        
        // Initialize mermaid
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        });

        // Create a unique ID for this diagram
        const id = `mermaid-diagram-${Date.now()}`;
        const element = document.createElement('div');
        element.id = id;
        element.className = 'mermaid';
        element.textContent = mermaidCode;
        
        containerRef.current.appendChild(element);

        // Render the diagram
        await mermaid.default.render(id, mermaidCode);
        
        // Replace the element with the rendered SVG
        const svg = containerRef.current.querySelector('svg');
        if (svg) {
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxWidth = '100%';
        }

      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="text-center py-8">
              <div class="text-red-600 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to Load Architecture Diagram</h3>
              <p class="text-gray-600 mb-4">There was an error rendering the architecture diagram.</p>
              <details class="text-left max-w-2xl mx-auto">
                <summary class="cursor-pointer text-blue-600 hover:text-blue-800">Show Mermaid Code</summary>
                <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">${mermaidCode}</pre>
              </details>
            </div>
          `;
        }
      }
    };

    renderMermaid();
  }, [mermaidCode]);

  if (!mermaidCode) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Architecture Data</h3>
        <p className="text-gray-600">No architecture diagram is available for this project.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Project Architecture</h3>
        <p className="text-sm text-gray-600 mt-1">
          Visual representation of file relationships and dependencies
        </p>
      </div>
      <div className="p-6">
        <div 
          ref={containerRef} 
          className="w-full overflow-x-auto"
          style={{ minHeight: '400px' }}
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureGraph; 