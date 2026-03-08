import { createClient } from '@supabase/supabase-js'

// Lazy singleton — avoids crashing at build time when env vars are not set
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase env vars are not configured.')
    _supabase = createClient(url, key)
  }
  return _supabase
}

/** @deprecated Use getSupabase() instead */
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabase()[prop as keyof ReturnType<typeof createClient>]
  },
})

export type BlockStatus = 'available' | 'reserved' | 'sold'

export interface Block {
  id: number
  x_position: number
  y_position: number
  status: BlockStatus
  image_url: string | null
  link_url: string | null
  owner_name: string | null
  purchase_date: string | null
}

export const GRID_COLS = 102  // 1024 / 10
export const GRID_ROWS = 80   // 800 / 10
export const TOTAL_BLOCKS = GRID_COLS * GRID_ROWS // 8160
export const BLOCK_PRICE_USD = 100
export const BLOCK_DISPLAY_SIZE = 20 // pixels on screen per block unit

export async function fetchAllBlocks(): Promise<Block[]> {
  const { data, error } = await getSupabase()
    .from('blocks')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching blocks:', error)
    return []
  }

  return data || []
}

export async function fetchBlockStats() {
  const { data, error } = await getSupabase()
    .from('blocks')
    .select('status')

  if (error) {
    console.error('Error fetching stats:', error)
    return { sold: 0, available: TOTAL_BLOCKS, reserved: 0 }
  }

  const rows = (data || []) as { status: string }[]
  const sold = rows.filter(b => b.status === 'sold').length
  const reserved = rows.filter(b => b.status === 'reserved').length
  const available = TOTAL_BLOCKS - sold - reserved

  return {
    sold,
    reserved,
    available,
  }
}

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase admin env vars are not configured.')
  return createClient(url, serviceKey)
}
