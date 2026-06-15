'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number
  target: number
  unit: string
  trend?: number
}

export default function KPICard({ label, value, target, unit, trend = 0 }: KPICardProps) {
  const achievement = target > 0 ? (value / target) * 100 : 0
  const isGood = achievement >= 100
  const isCritical = achievement < 80

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'
        }`}>
          {trend > 0 ? <TrendingUp size={16} /> : trend < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
          {trend !== 0 && `${Math.abs(trend).toFixed(1)}%`}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>달성률</span>
          <span className={`font-semibold ${isGood ? 'text-emerald-600' : isCritical ? 'text-red-500' : 'text-amber-500'}`}>
            {achievement.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isGood ? 'bg-emerald-500' : isCritical ? 'bg-red-500' : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">목표 {target.toLocaleString()} {unit}</p>
      </div>
    </div>
  )
}
