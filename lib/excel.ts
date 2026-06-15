import * as XLSX from 'xlsx'
import { PerformanceRecord } from '@/types'

export function exportToExcel(records: PerformanceRecord[], year: number, quarter: number) {
  const rows = records.map(r => ({
    연도: r.year,
    분기: `Q${r.quarter}`,
    사업부문: r.division,
    지표명: r.metric,
    목표: r.target,
    실적: r.actual,
    단위: r.unit,
    달성률: r.target > 0 ? `${((r.actual / r.target) * 100).toFixed(1)}%` : '-',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `${year}년 Q${quarter}`)
  XLSX.writeFile(wb, `현대오토에버_경영실적_${year}_Q${quarter}.xlsx`)
}

export function parseExcel(file: File): Promise<Partial<PerformanceRecord>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
        const records = rows.map(row => ({
          year: Number(row['연도']),
          quarter: Number(String(row['분기']).replace('Q', '')),
          division: String(row['사업부문'] ?? ''),
          metric: String(row['지표명'] ?? ''),
          target: Number(row['목표'] ?? 0),
          actual: Number(row['실적'] ?? 0),
          unit: String(row['단위'] ?? '억원'),
        }))
        resolve(records)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
