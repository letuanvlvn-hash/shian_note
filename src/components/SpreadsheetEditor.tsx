import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpreadsheetEditorProps {
  data: string[][];
  onChange: (newData: string[][]) => void;
}

export default function SpreadsheetEditor({ data, onChange }: SpreadsheetEditorProps) {
  const [grid, setGrid] = useState<string[][]>(data || [['', '', ''], ['', '', ''], ['', '', '']]);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

  useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(grid)) {
      setGrid(data);
    }
  }, [data]);

  const updateCell = (r: number, c: number, value: string) => {
    const newGrid = [...grid];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c] = value;
    setGrid(newGrid);
    onChange(newGrid);
  };

  const addRow = () => {
    const newRow = new Array(grid[0]?.length || 3).fill('');
    const newGrid = [...grid, newRow];
    setGrid(newGrid);
    onChange(newGrid);
  };

  const addColumn = () => {
    const newGrid = grid.map(row => [...row, '']);
    setGrid(newGrid);
    onChange(newGrid);
  };

  const removeRow = (index: number) => {
    if (grid.length <= 1) return;
    const newGrid = grid.filter((_, i) => i !== index);
    setGrid(newGrid);
    onChange(newGrid);
  };

  const removeColumn = (index: number) => {
    if (grid[0]?.length <= 1) return;
    const newGrid = grid.map(row => row.filter((_, i) => i !== index));
    setGrid(newGrid);
    onChange(newGrid);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 rounded-xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between p-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white" onClick={addRow} title="Thêm dòng">
            <Plus size={14} className="rotate-0" />
            <span className="sr-only">Thêm dòng</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white" onClick={addColumn} title="Thêm cột">
            <Plus size={14} className="rotate-0" />
            <span className="sr-only">Thêm cột</span>
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          {grid.length} hàng x {grid[0]?.length || 0} cột
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-1 custom-scrollbar">
        <table className="border-collapse w-max">
          <thead>
            <tr>
              <th className="w-8 h-8 bg-zinc-800 border border-white/10 text-[8px] text-muted-foreground"></th>
              {grid[0]?.map((_, c) => (
                <th key={c} className="w-24 h-8 bg-zinc-800 border border-white/10 text-[10px] font-bold text-center group relative">
                  {String.fromCharCode(65 + c)}
                  <button 
                    onClick={() => removeColumn(c)}
                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <Trash2 size={8} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                <td className="w-8 h-8 bg-zinc-800 border border-white/10 text-[10px] font-bold text-center group relative">
                  {r + 1}
                  <button 
                    onClick={() => removeRow(r)}
                    className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <Trash2 size={8} />
                  </button>
                </td>
                {row.map((cell, c) => (
                  <td key={c} className="p-0 border border-white/10">
                    <input
                      type="text"
                      className={cn(
                        "w-24 h-8 bg-transparent px-2 text-xs focus:bg-white/5 focus:outline-none transition-colors border-none",
                        selectedCell?.r === r && selectedCell?.c === c ? "bg-primary/10" : ""
                      )}
                      value={cell}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      onFocus={() => setSelectedCell({ r, c })}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
