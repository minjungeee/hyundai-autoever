'use client'
import { useState } from 'react'
import { PerformanceRecord } from '@/types'
import { Pencil, Trash2, Check, X } from 'lucide-react'

interface Props {
  records: PerformanceRecord[]
  onUpdate: (record: PerformanceRecord) => void
  onDelete: (id: string) => void
}

export default function DataTable({ records, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PerformanceRecord>>({})

  function startEdit(r: PerformanceRecord) {
    setEditingId(r.id)
    setEditValues({ target: r.target, actual: r.actual })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValues({})
  }

  function saveEdit(r: PerformanceRecord) {
    onUpdate({ ...r, ...editValues })
    setEditingId(null)
    setEditValues({})
  }

  return (
    <div className="overflow-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[#002C5F] text-white">
            {['사업부문', '지표명', '목표', '실적', '단위', '달성률', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-sm">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {records.length === 0 && (
            <tr><td colSpan={7} className="text-center py-12 text-gray-400">데이터가 없습니다</td></tr>
          )}
          {records.map((r, i) => {
            const isEditing = editingId === r.id
            const achievement = r.target > 0 ? (r.actual / r.target) * 100 : 0
            const achColor = achievement >= 100 ? 'text-emerald-600' : achievement < 80 ? 'text-red-500' : 'text-amber-500'

            return (
              <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-3 font-medium text-gray-800">{r.division}</td>
                <td className="px-4 py-3 text-gray-600">{r.metric}</td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.target ?? r.target}
                      onChange={e => setEditValues(v => ({ ...v, target: Number(e.target.value) }))}
                      className="w-24 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]"
                    />
                  ) : (
                    <span className="text-gray-700">{r.target.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.actual ?? r.actual}
                      onChange={e => setEditValues(v => ({ ...v, actual: Number(e.target.value) }))}
                      className="w-24 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]"
                    />
                  ) : (
                    <span className="text-gray-700">{r.actual.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{r.unit}</td>
                <td className={`px-4 py-3 font-semibold ${achColor}`}>
                  {achievement.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(r)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
                          <Check size={15} />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => onDelete(r.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
