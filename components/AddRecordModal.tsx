'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { PerformanceRecord } from '@/types'

interface Props {
  year: number
  quarter: number
  onClose: () => void
  onSave: (record: Omit<PerformanceRecord, 'id' | 'created_at' | 'updated_at'>) => void
}

const DIVISIONS = ['모빌리티IT', 'ITO', '스마트팩토리', '글로벌', '공공/금융']
const METRICS = ['매출액', '영업이익', '수주액', '고객만족도', '직원수']
const UNITS = ['억원', '%', '건', '명', '점']

export default function AddRecordModal({ year, quarter, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    division: DIVISIONS[0],
    metric: METRICS[0],
    target: '',
    actual: '',
    unit: UNITS[0],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ year, quarter, division: form.division, metric: form.metric, target: Number(form.target), actual: Number(form.actual), unit: form.unit })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">실적 데이터 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">사업부문</label>
              <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]">
                {DIVISIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">지표명</label>
              <select value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]">
                {METRICS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">목표</label>
              <input type="number" required value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">실적</label>
              <input type="number" required value={form.actual} onChange={e => setForm(f => ({ ...f, actual: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">단위</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002C5F]">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50">
              취소
            </button>
            <button type="submit"
              className="flex-1 bg-[#002C5F] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#003d80] transition-colors">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
