import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid') {
      const { xPosition, yPosition, ownerName, linkUrl, imageUrl } = session.metadata || {}

      if (!xPosition || !yPosition) {
        console.error('Missing metadata in webhook')
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const supabase = createSupabaseAdmin()

      const { error } = await supabase
        .from('blocks')
        .upsert({
          x_position: parseInt(xPosition),
          y_position: parseInt(yPosition),
          status: 'sold',
          owner_name: ownerName || 'Anonymous',
          link_url: linkUrl || '',
          image_url: imageUrl || null,
          purchase_date: new Date().toISOString(),
        })

      if (error) {
        console.error('Failed to update block after payment:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`Block (${xPosition}, ${yPosition}) sold to ${ownerName}`)
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const { xPosition, yPosition } = session.metadata || {}

    if (xPosition && yPosition) {
      const supabase = createSupabaseAdmin()

      // Release the reservation
      await supabase
        .from('blocks')
        .delete()
        .eq('x_position', parseInt(xPosition))
        .eq('y_position', parseInt(yPosition))
        .eq('status', 'reserved')
    }
  }

  return NextResponse.json({ received: true })
}
