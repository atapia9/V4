import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

// GET all blocks for admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const supabase = createSupabaseAdmin()

    let query = supabase
      .from('blocks')
      .select('*')
      .order('purchase_date', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('owner_name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin GET blocks error:', error)
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
}
