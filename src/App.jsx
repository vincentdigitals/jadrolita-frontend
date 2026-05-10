import React, { useState } from 'react';

function App() {
  const [gridSize, setGridSize] = useState({ width: 10, height: 10 });
  const [start, setStart] = useState({ x: 1, y: 1 });
  const [stones, setStones] = useState([
    { x: 2, y: 3 }, { x: 5, y: 5 }, { x: 9, y: 4 }, { x: 6, y: 5 }
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddStone = () => {
    if (stones.length < 10) setStones([...stones, { x: 1, y: 1 }]);
  };

  const handleRemoveStone = (index) => {
    setStones(stones.filter((_, i) => i !== index));
  };

  const handleStoneChange = (index, field, value) => {
    const newStones = [...stones];
    newStones[index][field] = Number(value);
    setStones(newStones);
  };

  const calculatePath = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://jadrolita.onrender.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, stones })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to calculate');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCells = gridSize.width * gridSize.height;
  const gridCells = Array.from({ length: totalCells }, (_, i) => {
    return { x: (i % gridSize.width) + 1, y: Math.floor(i / gridSize.width) + 1 };
  });

  // Refined visual indicators
  const getCellStyles = (x, y) => {
    if (start.x === x && start.y === y) return 'bg-[#0A2540] shadow-[0_4px_14px_rgba(10,37,64,0.39)] z-10 scale-[1.15] rounded-md';
    if (stones.some(s => s.x === x && s.y === y)) return 'bg-gray-800 rounded-full scale-[0.6] shadow-sm';
    if (result?.visualRoute?.some(node => node.x === x && node.y === y)) return 'bg-indigo-50 border border-indigo-200';
    return 'bg-white hover:bg-gray-50 border border-gray-100 rounded-sm';
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans text-[#1A1F36] selection:bg-indigo-100">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Jadrolita TSP Solver</h1>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">Group 4 • CSC 427</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-semibold text-gray-600">Engine Online</span>
        </div>
      </header>

      {/* Main Responsive Layout */}
      <main className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Controls (Stacks on mobile, fixed width on desktop) */}
          <div className="w-full lg:w-[380px] shrink-0 bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 flex flex-col gap-6">
            
            {/* Origin Setup */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Starting Coordinate
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center bg-[#F6F9FC] border border-gray-200 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <span className="pl-3 pr-2 text-gray-400 text-xs font-mono">X</span>
                  <input type="number" min="1" max={gridSize.width} value={start.x} onChange={(e) => setStart({ ...start, x: Number(e.target.value) })} className="bg-transparent w-full py-2 outline-none text-sm font-medium" />
                </div>
                <div className="flex items-center bg-[#F6F9FC] border border-gray-200 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <span className="pl-3 pr-2 text-gray-400 text-xs font-mono">Y</span>
                  <input type="number" min="1" max={gridSize.height} value={start.y} onChange={(e) => setStart({ ...start, y: Number(e.target.value) })} className="bg-transparent w-full py-2 outline-none text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Target Stones */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  Targets ({stones.length}/10)
                </h3>
                <button onClick={handleAddStone} disabled={stones.length >= 10} className="text-indigo-600 text-xs font-semibold hover:text-indigo-700 disabled:opacity-50 transition-colors">
                  + Add Node
                </button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {stones.map((stone, index) => (
                  <div key={index} className="flex gap-2 items-center group">
                    <span className="text-[10px] font-mono text-gray-400 w-5">{(index + 1).toString().padStart(2, '0')}</span>
                    <input type="number" min="1" max={gridSize.width} value={stone.x} onChange={(e) => handleStoneChange(index, 'x', e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm font-medium outline-none focus:border-indigo-500 transition-all shadow-sm" />
                    <input type="number" min="1" max={gridSize.height} value={stone.y} onChange={(e) => handleStoneChange(index, 'y', e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm font-medium outline-none focus:border-indigo-500 transition-all shadow-sm" />
                    <button onClick={() => handleRemoveStone(index)} className="opacity-100 lg:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Compute Button & Results */}
            <div className="pt-2">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{error}</div>}
              
              {result && (
                <div className="mb-4 p-4 bg-white border border-green-200 rounded-xl shadow-sm flex items-center justify-between relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                  <div>
                    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">Optimal Route Found</p>
                    <p className="text-gray-900 font-bold text-2xl tracking-tight">{result.totalDistance} <span className="text-sm font-medium text-gray-500 tracking-normal">units</span></p>
                  </div>
                </div>
              )}

              <button 
                onClick={calculatePath} 
                disabled={loading} 
                className="w-full bg-[#0A2540] hover:bg-[#1A365D] text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-[0_4px_14px_rgba(10,37,64,0.15)] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Computing...
                  </span>
                ) : 'Run Simulation'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: The Visualizer Grid */}
          <div className="flex-1 w-full bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
            
            {/* Grid Header / Legend */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-semibold text-gray-900">Live Simulation Board</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#0A2540] rounded-sm"></div><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Jadrolita</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-800 rounded-full"></div><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Target</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-indigo-50 border border-indigo-200"></div><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Path</span></div>
              </div>
            </div>

            {/* The Actual Grid */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNFMkU4RjAiLz48L3N2Zz4=')]">
              <div 
                className="grid gap-0.5 sm:gap-1 w-full max-w-[600px] aspect-square bg-gray-100/50 p-1 rounded-xl shadow-inner" 
                style={{ gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))` }}
              >
                {gridCells.map(cell => (
                  <div key={`${cell.x}-${cell.y}`} className={`relative transition-all duration-300 ${getCellStyles(cell.x, cell.y)}`}>
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center text-[9px] font-mono text-gray-400 pointer-events-none transition-opacity">
                      {cell.x},{cell.y}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;