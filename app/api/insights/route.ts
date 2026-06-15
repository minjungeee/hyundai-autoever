import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PerformanceRecord } from '@/types'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const { records, year, quarter }: { records: PerformanceRecord[]; year: number; quarter: number } = await req.json()

  if (!records || records.length === 0) {
    return NextResponse.json({ error: '분석할 데이터가 없습니다.' }, { status: 400 })
  }

  // Build structured data summary for the prompt
  const tableRows = records.map(r => {
    const ach = r.target > 0 ? ((r.actual / r.target) * 100).toFixed(1) : '-'
    return `| ${r.division} | ${r.metric} | ${r.target.toLocaleString()} | ${r.actual.toLocaleString()} | ${r.unit} | ${ach}% |`
  }).join('\n')

  const prompt = `당신은 현대오토에버의 경영실적 분석 전문가입니다.
아래는 ${year}년 Q${quarter} 경영실적 데이터입니다.

| 사업부문 | 지표 | 목표 | 실적 | 단위 | 달성률 |
|---------|------|------|------|------|--------|
${tableRows}

위 데이터를 바탕으로 다음 항목을 **한국어**로 분석해주세요:

## 📊 종합 진단
전체 실적을 2~3문장으로 요약하세요.

## ✅ 잘한 점 (Top 3)
목표를 초과 달성한 항목 중 주목할 만한 성과를 구체적 수치와 함께 설명하세요.

## ⚠️ 개선 필요 (Bottom 3)
목표 미달성 항목 중 우선 개선이 필요한 항목을 구체적 수치와 함께 설명하세요.

## 💡 실행 가능한 개선 제안
각 미달성 항목에 대해 실제로 실행 가능한 구체적 조치를 3가지 제안하세요.

## 🎯 다음 분기 핵심 목표
다음 분기에 집중해야 할 최우선 과제 2가지를 제시하세요.

답변은 명확하고 실무적으로 작성해주세요.`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return NextResponse.json({ insight: text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini API 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
