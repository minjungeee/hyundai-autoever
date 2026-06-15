import { createClient } from '@supabase/supabase-js'

const PLACEHOLDER = 'your_supabase_url'

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === PLACEHOLDER) {
    throw new Error('Supabase not configured')
  }
  return createClient(url, key)
}

export type Database = {
  public: {
    Tables: {
      performance_records: {
        Row: {
          id: string
          year: number
          quarter: number
          division: string
          metric: string
          target: number
          actual: number
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<{
          id: string
          year: number
          quarter: number
          division: string
          metric: string
          target: number
          actual: number
          unit: string
          created_at: string
          updated_at: string
        }, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<{
          year: number
          quarter: number
          division: string
          metric: string
          target: number
          actual: number
          unit: string
        }>
      }
    }
  }
}
