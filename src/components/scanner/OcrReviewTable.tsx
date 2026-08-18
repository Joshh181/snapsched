import React, { useState } from 'react';
import { Trash2, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Clock, MapPin, Tag } from 'lucide-react';
import { OcrParsedClass, DAYS_OF_WEEK, CategoryItem } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';
import { storageService } from '../../services/storageService';

interface OcrReviewTableProps {
  items: OcrParsedClass[];
  activeCategory?: string;
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updated: Partial<OcrParsedClass>) => void;
  onConfirmImport: (replace: boolean) => void;
  onReset: () => void;
}

export const OcrReviewTable: React.FC<OcrReviewTableProps> = ({
  items,
  activeCategory,
  onToggleSelect,
  onSelectAll,
  onDeleteItem,
  onUpdateItem,
  onConfirmImport,
  onReset,
}) => {
  const [categories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [selectedTargetCategory, setSelectedTargetCategory] = useState<string>(() => {
    return items.find((i) => i.category)?.category || activeCategory || categories[0]?.name || 'School';
  });

  const selectedCount = items.filter((i) => i.selected).length;
  const totalUnits = items.filter((i) => i.selected).reduce((sum, i) => sum + (i.units || 0), 0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  const handleApplyCategoryToAll = (categoryName: string) => {
    setSelectedTargetCategory(categoryName);
    items.forEach((item) => {
      onUpdateItem(item.id, { category: categoryName });
    });
  };

  const handleExecuteImport = () => {
    // Statically ensure all items have the chosen category before triggering import
    items.forEach((item) => {
      if (!item.category) {
        onUpdateItem(item.id, { category: selectedTargetCategory });
      }
    });
    onConfirmImport(false);
  };

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* Summary header */}
      <div
        className="p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', color: 'var(--status-success)' }}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
              Extraction Complete
            </h3>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              <strong>{items.length} items</strong> found · <strong>{totalUnits} units</strong>. Select items to import.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            Scan Another
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={selectedCount === 0}
            className="px-4 py-2 rounded-lg font-medium text-[13px] text-white transition-colors flex items-center gap-1.5 disabled:opacity-40"
            style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
          >
            Import {selectedCount} to {selectedTargetCategory}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Category Selector Bar */}
      <div
        className="p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Import Category Destination:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => {
            const isSelected = selectedTargetCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleApplyCategoryToAll(cat.name)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all"
                style={{
                  background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                  color: isSelected ? 'var(--brand-800)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Select All Banner */}
      <div
        className="px-4 py-2.5 rounded-lg flex items-center justify-between"
        style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={selectedCount === items.length && items.length > 0}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-[var(--brand-600)]"
          />
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Select All ({selectedCount}/{items.length})
          </span>
        </div>
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {selectedCount} selected
        </span>
      </div>

      {/* MOBILE: Adaptive Card List (< 768px) */}
      <div className="space-y-2.5 md:hidden">
        {items.map((item) => {
          const isExpanded = expandedCardId === item.id;
          const itemCat = item.category || selectedTargetCategory;

          return (
            <div
              key={item.id}
              className="p-3 rounded-lg transition-all"
              style={{
                background: 'var(--surface-primary)',
                border: item.selected ? '1px solid var(--brand-200)' : '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xs)',
                opacity: item.selected ? 1 : 0.6,
              }}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 rounded mt-0.5 cursor-pointer accent-[var(--brand-600)] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                        {item.code}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                        style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                      >
                        {itemCat}
                      </span>
                      {item.room && (
                        <span className="text-[11px] px-1.5 py-0.2 rounded" style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                          {item.room}
                        </span>
                      )}
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {item.units || 3} units
                      </span>
                    </div>
                    <p className="text-[12px] mt-0.5 font-medium line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {item.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="p-1 rounded transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 rounded transition-colors hover:bg-red-50"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time and Days summary */}
              <div className="mt-2 pt-2 flex items-center justify-between text-[12px]" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <span
                      key={d.key}
                      className="px-1 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: item.days.includes(d.key) ? 'var(--brand-100)' : 'transparent',
                        color: item.days.includes(d.key) ? 'var(--brand-800)' : 'var(--text-muted)',
                      }}
                    >
                      {d.short}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3 h-3 text-slate-400" />
                  {format12Hour(item.startTime)} – {format12Hour(item.endTime)}
                </div>
              </div>

              {/* Expandable Editable Form */}
              {isExpanded && (
                <div className="mt-3 pt-3 space-y-2.5" style={{ borderTop: '1px dashed var(--border-subtle)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Code</label>
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => onUpdateItem(item.id, { code: e.target.value })}
                        className="w-full text-[12px] p-1.5 rounded border mt-0.5"
                        style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Category</label>
                      <select
                        value={item.category || selectedTargetCategory}
                        onChange={(e) => onUpdateItem(item.id, { category: e.target.value })}
                        className="w-full text-[12px] p-1.5 rounded border mt-0.5"
                        style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Subject Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                      className="w-full text-[12px] p-1.5 rounded border mt-0.5"
                      style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Location / Room</label>
                      <input
                        type="text"
                        value={item.room}
                        onChange={(e) => onUpdateItem(item.id, { room: e.target.value })}
                        className="w-full text-[12px] p-1.5 rounded border mt-0.5"
                        style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Units</label>
                      <input
                        type="number"
                        value={item.units || 3}
                        onChange={(e) => onUpdateItem(item.id, { units: Number(e.target.value) })}
                        className="w-full text-[12px] p-1.5 rounded border mt-0.5"
                        style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP: Full Table (>= 768px) */}
      <div
        className="hidden md:block rounded-lg overflow-hidden"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead style={{ background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-default)' }}>
              <tr>
                <th className="p-3 w-8 text-center" />
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Code</th>
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Category</th>
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Subject</th>
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Days</th>
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Time</th>
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Room</th>
                <th className="p-3 text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Units</th>
                <th className="p-3 text-right text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    opacity: item.selected ? 1 : 0.4,
                  }}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox" checked={item.selected}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-4 h-4 rounded cursor-pointer accent-[var(--brand-600)]"
                    />
                  </td>
                  <td className="p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <input
                      type="text" value={item.code}
                      onChange={(e) => onUpdateItem(item.id, { code: e.target.value })}
                      className="bg-transparent border-b border-transparent focus:border-[var(--brand-500)] px-1 py-0.5 rounded text-[13px] w-20"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={item.category || selectedTargetCategory}
                      onChange={(e) => onUpdateItem(item.id, { category: e.target.value })}
                      className="text-[12px] px-2 py-1 rounded border focus:outline-none"
                      style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>
                    <input
                      type="text" value={item.name}
                      onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                      className="bg-transparent border-b border-transparent focus:border-[var(--brand-500)] px-1 py-0.5 rounded text-[13px] w-full min-w-[200px]"
                      style={{ color: 'var(--text-secondary)' }}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-0.5">
                      {DAYS_OF_WEEK.map((d) => (
                        <span
                          key={d.key}
                          className="px-1 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: item.days.includes(d.key) ? 'var(--brand-100)' : 'transparent',
                            color: item.days.includes(d.key) ? 'var(--brand-800)' : 'var(--text-muted)',
                          }}
                        >
                          {d.short}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-[12px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {format12Hour(item.startTime)} – {format12Hour(item.endTime)}
                  </td>
                  <td className="p-3">
                    <input
                      type="text" value={item.room}
                      onChange={(e) => onUpdateItem(item.id, { room: e.target.value })}
                      className="px-2 py-1 rounded-md text-[13px] w-20"
                      style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </td>
                  <td className="p-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {item.units || 3}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                      title="Remove"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 className="w-4 h-4" />
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
