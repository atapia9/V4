import Stripe from 'stripe'

// Lazy singleton — avoids crashing at build time when env vars are not set
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY env var is not configured.')
    _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' })
  }
  return _stripe
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const STRIPE_PRICE_CENTS = 10000 // $100.00 USD

export interface CheckoutMetadata {
  blockId: string
  xPosition: string
  yPosition: string
  ownerName: string
  linkUrl: string
  imageUrl: string
}
