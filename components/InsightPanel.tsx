'use client'
import { useState } from 'react'
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { PerformanceRecord } from '@/types'

interface Props {
  records: PerformanceRecord[]
  year: number
  quarter: number
  onClose: () => void
}

export default function InsightPanel({ records, year, quarter, onClose }: Props) {
  const [insight, setInsight] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [generated, setGenerated] = useState(false)

  async function generate() {
    setLoading(true)
    setError('')
    setInsight('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, year, quarter }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '분석 오류')
      setInsight(json.insight)
      setGenerated(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  // Render markdown-like text with basic formatting
  function renderInsight(text: string) {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-base font-bold text-[#002C5F] mt-5 mb-2 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        )
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-semibold text-gray-800 mt-3 mb-1">{line.replace('### ', '')}</h4>
      }
      if (line.match(/^\d+\./)) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-[#002C5F] font-bold text-sm shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <p className="text-sm text-gray-700 leading-relaxed">{line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</p>
          </div>
        )
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 my-0.5 ml-2">
            <span className="text-[#002C5F] mt-1.5 text-xs shrink-0">●</span>
            <p className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )
      }
      if (line.trim() === '' || line === '---') return <div key={i} className="h-1" />
      return (
        <p key={i} className="text-sm text-gray-700 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      )
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#002C5F] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-300" />
            <span className="text-white font-bold text-base">AI 경영 인사이트</span>
            <span className="text-blue-300 text-xs ml-1">Gemini 2.5 Flash</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Context badge */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 shrink-0">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">{year}년 Q{quarter}</span> 실적 데이터 {records.length}건을 기반으로 분석합니다.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!generated && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Sparkles size={28} className="text-[#002C5F]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">AI 경영 인사이트 분석</p>
                <p className="text-sm text-gray-500">
                  현재 분기 실적 데이터를 Gemini가 분석하여<br />
                  개선 방향과 실행 과제를 제안합니다.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={32} className="text-[#002C5F] animate-spin" />
              <p className="text-sm text-gray-500">실적 데이터를 분석하는 중입니다…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={22} className="text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center">{error}</p>
              <button onClick={generate}
                className="text-sm text-[#002C5F] underline hover:no-underline">
                다시 시도
              </button>
            </div>
          )}

          {insight && (
            <div className="prose-sm max-w-none">
              {renderInsight(insight)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={generate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#002C5F] hover:bg-[#003d80] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-colors"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> 분석 중…</>
              : <><Sparkles size={16} /> {generated ? '다시 분석하기' : 'AI 인사이트 생성'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
