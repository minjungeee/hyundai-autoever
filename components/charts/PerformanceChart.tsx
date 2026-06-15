'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts'
import { PerformanceRecord } from '@/types'

interface Props {
  records: PerformanceRecord[]
  type?: 'bar' | 'line'
}

export default function PerformanceChart({ records, type = 'bar' }: Props) {
  const grouped = records.reduce<Record<string, { name: string; 목표: number; 실적: number }>>((acc, r) => {
    const key = r.division
    if (!acc[key]) acc[key] = { name: key, 목표: 0, 실적: 0 }
    acc[key].목표 += r.target
    acc[key].실적 += r.actual
    return acc
  }, {})

  const chartData = Object.values(grouped)

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
          <Legend />
          <Line type="monotone" dataKey="목표" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="실적" stroke="#002C5F" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
        <Legend />
        <Bar dataKey="목표" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="실적" fill="#002C5F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
