import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

// PATCH - update a block
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from('blocks')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin PATCH block error:', error)
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 })
  }
}

// DELETE - remove a block (reset to available)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseAdmin()

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE block error:', error)
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
  }
}
