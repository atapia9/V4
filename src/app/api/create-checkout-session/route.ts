import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_CENTS } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { blockId, xPosition, yPosition, ownerName, linkUrl, imageUrl, description } = body

    if (!blockId || !ownerName || !linkUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if Supabase is configured
    const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Check if Stripe is configured
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY

    // If Supabase is configured, check block availability and reserve it
    if (supabaseConfigured) {
      const supabase = createSupabaseAdmin()
      const { data: existingBlock } = await supabase
        .from('blocks')
        .select('status')
        .eq('x_position', xPosition)
        .eq('y_position', yPosition)
        .single()

      if (existingBlock && existingBlock.status !== 'available') {
        return NextResponse.json({ error: 'Block is no longer available' }, { status: 409 })
      }

      // Reserve the block temporarily
      await supabase
        .from('blocks')
        .upsert({
          x_position: xPosition,
          y_position: yPosition,
          status: 'reserved',
          owner_name: ownerName,
          link_url: linkUrl,
          image_url: imageUrl || null,
        })
    }

    // If Stripe is not configured, return a mock success URL for demo mode
    if (!stripeConfigured) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const mockSessionId = `mock_session_${Date.now()}`
      return NextResponse.json({ 
        url: `${baseUrl}/success?session_id=${mockSessionId}&block_x=${xPosition}&block_y=${yPosition}&mock=true`,
        sessionId: mockSessionId,
        mock: true
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Pixel Block (${xPosition * 10}, ${yPosition * 10})`,
              description: description || `10x10 pixel advertising block at position (${xPosition * 10}, ${yPosition * 10})`,
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: STRIPE_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&block_x=${xPosition}&block_y=${yPosition}`,
      cancel_url: `${baseUrl}/?cancelled=true`,
      metadata: {
        blockId: String(blockId),
        xPosition: String(xPosition),
        yPosition: String(yPosition),
        ownerName,
        linkUrl,
        imageUrl: imageUrl || '',
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
