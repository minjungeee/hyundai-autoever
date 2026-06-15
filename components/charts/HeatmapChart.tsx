'use client'
import { HeatmapCell } from '@/types'

interface Props {
  data: HeatmapCell[]
}

function getColor(achievement: number) {
  if (achievement >= 110) return { bg: 'bg-blue-900', text: 'text-white' }
  if (achievement >= 100) return { bg: 'bg-blue-600', text: 'text-white' }
  if (achievement >= 90) return { bg: 'bg-blue-300', text: 'text-blue-900' }
  if (achievement >= 80) return { bg: 'bg-amber-300', text: 'text-amber-900' }
  return { bg: 'bg-red-400', text: 'text-white' }
}

export default function HeatmapChart({ data }: Props) {
  const divisions = [...new Set(data.map(d => d.division))]
  const metrics = [...new Set(data.map(d => d.metric))]

  const lookup = new Map(data.map(d => [`${d.division}|${d.metric}`, d.achievement]))

  return (
    <div className="overflow-auto">
      <table className="min-w-full text-xs border-separate border-spacing-0.5">
        <thead>
          <tr>
            <th className="bg-gray-50 text-gray-500 font-medium px-3 py-2 text-left min-w-[100px] rounded">사업부문</th>
            {metrics.map(m => (
              <th key={m} className="bg-gray-50 text-gray-500 font-medium px-2 py-2 text-center min-w-[80px] rounded">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {divisions.map(div => (
            <tr key={div}>
              <td className="bg-gray-50 text-gray-700 font-medium px-3 py-2 rounded">{div}</td>
              {metrics.map(m => {
                const val = lookup.get(`${div}|${m}`)
                if (val === undefined) return (
                  <td key={m} className="bg-gray-100 text-gray-400 text-center px-2 py-2 rounded">-</td>
                )
                const { bg, text } = getColor(val)
                return (
                  <td key={m} className={`${bg} ${text} text-center px-2 py-2 rounded font-semibold`}>
                    {val.toFixed(0)}%
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" />{'<80%'}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block" />80~90%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300 inline-block" />90~100%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" />100~110%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-900 inline-block" />{'>110%'}</span>
      </div>
    </div>
  )
}
