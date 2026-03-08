import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
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
