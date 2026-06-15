import { getSupabase } from './supabase'
import { PerformanceRecord } from '@/types'

export async function fetchRecords(year: number, quarter: number): Promise<PerformanceRecord[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('performance_records')
    .select('*')
    .eq('year', year)
    .eq('quarter', quarter)
    .order('division')
  if (error) throw error
  return data ?? []
}

export async function upsertRecord(record: Partial<PerformanceRecord> & { year: number; quarter: number; division: string; metric: string }): Promise<PerformanceRecord> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('performance_records')
    .upsert({ ...record, updated_at: new Date().toISOString() }, { onConflict: 'year,quarter,division,metric' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRecord(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('performance_records').delete().eq('id', id)
  if (error) throw error
}

export async function fetchAllYears(): Promise<number[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('performance_records')
    .select('year')
    .order('year', { ascending: false })
  if (error) throw error
  return [...new Set((data ?? []).map((r: { year: number }) => r.year))]
}
