import React from 'react';
import { Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { OcrParsedClass, DAYS_OF_WEEK } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';

interface OcrReviewTableProps {
  items: OcrParsedClass[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updated: Partial<OcrParsedClass>) => void;
  onConfirmImport: (replace: boolean) => void;
  onReset: () => void;
}

export const OcrReviewTable: React.FC<OcrReviewTableProps> = ({
  items,
  onToggleSelect,
  onSelectAll,
  onDeleteItem,
  onUpdateItem,
  onConfirmImport,
  onReset,
}) => {
  const selectedCount = items.filter((i) => i.selected).length;
  const totalUnits = items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + (i.units || 0), 0);

  return (
    <div className="space-y-3.5 animate-fade-in select-none">
      {/* Header Summary */}
      <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-zinc-900">
              Extraction Complete
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              <span className="text-zinc-800 font-semibold">{items.length} subjects</span> found •{' '}
              <span className="text-zinc-800 font-semibold">{totalUnits} units</span>. Select classes to import.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors"
          >
            Scan Another
          </button>
          <button
            onClick={() => onConfirmImport(false)}
            disabled={selectedCount === 0}
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Import {selectedCount} Classes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Classes Table */}
      <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={selectedCount === items.length && items.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600 border-zinc-300 cursor-pointer focus:ring-0"
            />
            <span className="text-xs font-medium text-zinc-700 font-mono">
              Select All ({selectedCount}/{items.length})
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Click cells to edit inline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 font-mono border-b border-zinc-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-8 text-center"></th>
                <th className="p-3">Code</th>
                <th className="p-3">Subject Description</th>
                <th className="p-3">Days</th>
                <th className="p-3">Time</th>
                <th className="p-3">Room</th>
                <th className="p-3">Units</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.selected ? 'bg-white hover:bg-zinc-50' : 'opacity-40 hover:opacity-70 bg-zinc-50/50'
                  }`}
                >
                  {/* Checkbox */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-3.5 h-3.5 rounded text-blue-600 border-zinc-300 cursor-pointer focus:ring-0"
                    />
                  </td>

                  {/* Code */}
                  <td className="p-3 font-semibold text-zinc-950 font-mono">
                    <input
                      type="text"
                      value={item.code}
                      onChange={(e) => onUpdateItem(item.id, { code: e.target.value })}
                      className="bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white px-1 py-0.5 rounded text-zinc-950 font-mono text-xs w-20"
                    />
                  </td>

                  {/* Description */}
                  <td className="p-3 text-zinc-800">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                      className="bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white px-1 py-0.5 rounded text-zinc-800 text-xs w-full min-w-[200px]"
                    />
                  </td>

                  {/* Days */}
                  <td className="p-3">
                    <div className="flex items-center gap-0.5">
                      {DAYS_OF_WEEK.map((d) => {
                        const isDay = item.days.includes(d.key);
                        return (
                          <span
                            key={d.key}
                            className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                              isDay
                                ? 'bg-blue-100 text-blue-800 font-semibold'
                                : 'text-zinc-300'
                            }`}
                          >
                            {d.short}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Time */}
                  <td className="p-3 font-mono text-zinc-600 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span>{format12Hour(item.startTime)}</span>
                      <span className="text-zinc-300">–</span>
                      <span>{format12Hour(item.endTime)}</span>
                    </div>
                  </td>

                  {/* Room */}
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.room}
                      onChange={(e) => onUpdateItem(item.id, { room: e.target.value })}
                      className="bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 px-1.5 py-0.5 rounded text-xs text-zinc-800 font-mono w-20"
                    />
                  </td>

                  {/* Units */}
                  <td className="p-3 font-mono text-zinc-600 text-xs">
                    {item.units || 3}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
