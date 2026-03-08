import { NextResponse } from 'next/server'
import { createSupabaseAdmin, TOTAL_BLOCKS, BLOCK_PRICE_USD } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('blocks')
      .select('status')

    if (error) throw error

    const sold = data?.filter(b => b.status === 'sold').length || 0
    const reserved = data?.filter(b => b.status === 'reserved').length || 0
    const available = TOTAL_BLOCKS - sold - reserved

    return NextResponse.json({
      sold,
      reserved,
      available,
      revenue: sold * BLOCK_PRICE_USD,
      total: TOTAL_BLOCKS,
    })
  } catch (error) {
    console.error('GET /api/blocks/stats error:', error)
    return NextResponse.json(
      { sold: 0, available: TOTAL_BLOCKS, reserved: 0, revenue: 0, total: TOTAL_BLOCKS },
      { status: 200 }
    )
  }
}
