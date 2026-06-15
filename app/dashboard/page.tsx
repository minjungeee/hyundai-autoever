'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { PerformanceRecord, HeatmapCell } from '@/types'
import { fetchRecords, upsertRecord, deleteRecord } from '@/lib/data'
import { exportToExcel, parseExcel } from '@/lib/excel'
import KPICard from '@/components/ui/KPICard'
import HeatmapChart from '@/components/charts/HeatmapChart'
import PerformanceChart from '@/components/charts/PerformanceChart'
import DataTable from '@/components/DataTable'
import AddRecordModal from '@/components/AddRecordModal'
import InsightPanel from '@/components/InsightPanel'
import { Plus, Download, Upload, BarChart2, TableIcon, Activity, Sparkles } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]
const QUARTERS = [1, 2, 3, 4] as const

type Tab = 'overview' | 'heatmap' | 'table'

export default function DashboardPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(1)
  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showInsight, setShowInsight] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchRecords(year, quarter)
      setRecords(data)
    } catch {
      // Supabase not configured yet — use demo data
      setRecords(DEMO_RECORDS)
    } finally {
      setLoading(false)
    }
  }, [year, quarter])

  useEffect(() => { load() }, [load])

  async function handleUpdate(r: PerformanceRecord) {
    try {
      const updated = await upsertRecord(r)
      setRecords(prev => prev.map(p => p.id === updated.id ? updated : p))
    } catch {
      alert('저장 실패: Supabase 연결을 확인해 주세요.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await deleteRecord(id)
      setRecords(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('삭제 실패: Supabase 연결을 확인해 주세요.')
    }
  }

  async function handleAdd(record: Omit<PerformanceRecord, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const saved = await upsertRecord(record)
      setRecords(prev => [...prev, saved])
    } catch {
      // demo fallback
      const fake: PerformanceRecord = { ...record, id: crypto.randomUUID(), created_at: '', updated_at: '' }
      setRecords(prev => [...prev, fake])
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const parsed = await parseExcel(file)
      for (const r of parsed) {
        if (r.year && r.quarter && r.division && r.metric) {
          await handleAdd(r as Omit<PerformanceRecord, 'id' | 'created_at' | 'updated_at'>)
        }
      }
      alert(`${parsed.length}건 업로드 완료`)
    } catch {
      alert('파일 파싱 오류')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Aggregate KPI
  const totalRevenue = records.filter(r => r.metric === '매출액').reduce((s, r) => s + r.actual, 0)
  const totalRevenueTarget = records.filter(r => r.metric === '매출액').reduce((s, r) => s + r.target, 0)
  const totalProfit = records.filter(r => r.metric === '영업이익').reduce((s, r) => s + r.actual, 0)
  const totalProfitTarget = records.filter(r => r.metric === '영업이익').reduce((s, r) => s + r.target, 0)
  const totalOrder = records.filter(r => r.metric === '수주액').reduce((s, r) => s + r.actual, 0)
  const totalOrderTarget = records.filter(r => r.metric === '수주액').reduce((s, r) => s + r.target, 0)
  const avgSatisfaction = records.filter(r => r.metric === '고객만족도')
  const satisfaction = avgSatisfaction.length > 0 ? avgSatisfaction.reduce((s, r) => s + r.actual, 0) / avgSatisfaction.length : 0
  const satisfactionTarget = avgSatisfaction.length > 0 ? avgSatisfaction.reduce((s, r) => s + r.target, 0) / avgSatisfaction.length : 0

  const heatmapData: HeatmapCell[] = records
    .filter(r => r.target > 0)
    .map(r => ({ division: r.division, metric: r.metric, achievement: (r.actual / r.target) * 100 }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#002C5F] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-200 font-medium tracking-wider uppercase">Hyundai AutoEver</p>
            <h1 className="text-xl font-bold mt-0.5">경영실적 대시보드</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Year selector */}
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/40">
              {YEARS.map(y => <option key={y} value={y} className="text-gray-900">{y}년</option>)}
            </select>
            {/* Quarter selector */}
            <div className="flex rounded-lg overflow-hidden border border-white/20">
              {QUARTERS.map(q => (
                <button key={q} onClick={() => setQuarter(q)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${quarter === q ? 'bg-white text-[#002C5F]' : 'text-white/80 hover:bg-white/10'}`}>
                  Q{q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard label="매출액" value={totalRevenue} target={totalRevenueTarget} unit="억원" />
          <KPICard label="영업이익" value={totalProfit} target={totalProfitTarget} unit="억원" />
          <KPICard label="수주액" value={totalOrder} target={totalOrderTarget} unit="억원" />
          <KPICard label="고객만족도" value={Number(satisfaction.toFixed(1))} target={Number(satisfactionTarget.toFixed(1))} unit="점" />
        </div>

        {/* Tab bar + actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
            <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={<BarChart2 size={14} />} label="차트" />
            <TabButton active={tab === 'heatmap'} onClick={() => setTab('heatmap')} icon={<Activity size={14} />} label="히트맵" />
            <TabButton active={tab === 'table'} onClick={() => setTab('table')} icon={<TableIcon size={14} />} label="데이터" />
          </div>
          <div className="flex gap-2">
            <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload size={14} />
              {uploading ? '업로드 중...' : 'Excel 업로드'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <button onClick={() => exportToExcel(records, year, quarter)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Excel 다운로드
            </button>
            <button onClick={() => setShowInsight(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#002C5F] to-blue-500 text-white hover:opacity-90 transition-opacity shadow-sm">
              <Sparkles size={14} />
              AI 인사이트
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#002C5F] text-white hover:bg-[#003d80] transition-colors">
              <Plus size={14} />
              데이터 추가
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">불러오는 중...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {tab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 mb-4">사업부문별 목표 대비 실적</h2>
                  <PerformanceChart records={records} type="bar" />
                </div>
              </div>
            )}
            {tab === 'heatmap' && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-4">달성률 히트맵</h2>
                <HeatmapChart data={heatmapData} />
              </div>
            )}
            {tab === 'table' && (
              <DataTable records={records} onUpdate={handleUpdate} onDelete={handleDelete} />
            )}
          </div>
        )}
      </main>

      {showModal && (
        <AddRecordModal year={year} quarter={quarter} onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
      {showInsight && (
        <InsightPanel records={records} year={year} quarter={quarter} onClose={() => setShowInsight(false)} />
      )}
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-[#002C5F] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}>
      {icon}{label}
    </button>
  )
}

// Demo data for when Supabase is not configured
const DEMO_RECORDS: PerformanceRecord[] = [
  { id: '1', year: CURRENT_YEAR, quarter: 1, division: '모빌리티IT', metric: '매출액', target: 3200, actual: 3450, unit: '억원', created_at: '', updated_at: '' },
  { id: '2', year: CURRENT_YEAR, quarter: 1, division: '모빌리티IT', metric: '영업이익', target: 280, actual: 310, unit: '억원', created_at: '', updated_at: '' },
  { id: '3', year: CURRENT_YEAR, quarter: 1, division: '모빌리티IT', metric: '수주액', target: 4000, actual: 3800, unit: '억원', created_at: '', updated_at: '' },
  { id: '4', year: CURRENT_YEAR, quarter: 1, division: '모빌리티IT', metric: '고객만족도', target: 90, actual: 88, unit: '점', created_at: '', updated_at: '' },
  { id: '5', year: CURRENT_YEAR, quarter: 1, division: 'ITO', metric: '매출액', target: 2100, actual: 2050, unit: '억원', created_at: '', updated_at: '' },
  { id: '6', year: CURRENT_YEAR, quarter: 1, division: 'ITO', metric: '영업이익', target: 180, actual: 165, unit: '억원', created_at: '', updated_at: '' },
  { id: '7', year: CURRENT_YEAR, quarter: 1, division: 'ITO', metric: '수주액', target: 2500, actual: 2650, unit: '억원', created_at: '', updated_at: '' },
  { id: '8', year: CURRENT_YEAR, quarter: 1, division: 'ITO', metric: '고객만족도', target: 88, actual: 91, unit: '점', created_at: '', updated_at: '' },
  { id: '9', year: CURRENT_YEAR, quarter: 1, division: '스마트팩토리', metric: '매출액', target: 1500, actual: 1380, unit: '억원', created_at: '', updated_at: '' },
  { id: '10', year: CURRENT_YEAR, quarter: 1, division: '스마트팩토리', metric: '영업이익', target: 120, actual: 95, unit: '억원', created_at: '', updated_at: '' },
  { id: '11', year: CURRENT_YEAR, quarter: 1, division: '스마트팩토리', metric: '수주액', target: 1800, actual: 1920, unit: '억원', created_at: '', updated_at: '' },
  { id: '12', year: CURRENT_YEAR, quarter: 1, division: '스마트팩토리', metric: '고객만족도', target: 85, actual: 82, unit: '점', created_at: '', updated_at: '' },
  { id: '13', year: CURRENT_YEAR, quarter: 1, division: '글로벌', metric: '매출액', target: 900, actual: 1050, unit: '억원', created_at: '', updated_at: '' },
  { id: '14', year: CURRENT_YEAR, quarter: 1, division: '글로벌', metric: '영업이익', target: 70, actual: 85, unit: '억원', created_at: '', updated_at: '' },
  { id: '15', year: CURRENT_YEAR, quarter: 1, division: '글로벌', metric: '수주액', target: 1200, actual: 1150, unit: '억원', created_at: '', updated_at: '' },
  { id: '16', year: CURRENT_YEAR, quarter: 1, division: '글로벌', metric: '고객만족도', target: 87, actual: 89, unit: '점', created_at: '', updated_at: '' },
  { id: '17', year: CURRENT_YEAR, quarter: 1, division: '공공/금융', metric: '매출액', target: 750, actual: 720, unit: '억원', created_at: '', updated_at: '' },
  { id: '18', year: CURRENT_YEAR, quarter: 1, division: '공공/금융', metric: '영업이익', target: 55, actual: 48, unit: '억원', created_at: '', updated_at: '' },
  { id: '19', year: CURRENT_YEAR, quarter: 1, division: '공공/금융', metric: '수주액', target: 900, actual: 880, unit: '억원', created_at: '', updated_at: '' },
  { id: '20', year: CURRENT_YEAR, quarter: 1, division: '공공/금융', metric: '고객만족도', target: 86, actual: 90, unit: '점', created_at: '', updated_at: '' },
]
