import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('blocks')
    .select('status')

  if (error) {
    console.error('Error fetching stats:', error)
    return { sold: 0, available: TOTAL_BLOCKS, reserved: 0, revenue: 0 }
  }

  const sold = data?.filter(b => b.status === 'sold').length || 0
  const reserved = data?.filter(b => b.status === 'reserved').length || 0
  const available = TOTAL_BLOCKS - sold - reserved

  return {
    sold,
    reserved,
    available,
    revenue: sold * BLOCK_PRICE_USD,
  }
}

export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey)
}
