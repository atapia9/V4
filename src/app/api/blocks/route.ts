import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  // If Supabase is not configured, return empty array so the grid renders
  // with all blocks as "available" (useful for local dev / demo mode)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json([])
  }

  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .neq('status', 'available') // Only return non-available blocks to reduce payload
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('GET /api/blocks error:', error)
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
}
