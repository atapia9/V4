'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/LocaleContext'

function SuccessContent() {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const blockX = searchParams.get('block_x')
  const blockY = searchParams.get('block_y')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Pixel confetti */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-sm animate-bounce"
                style={{
                  backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#34d399', '#f59e0b'][i % 5],
                  left: `${10 + (i * 7) % 80}%`,
                  top: `${5 + (i * 13) % 90}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.8 + (i % 3) * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>

        <h1 className="text-3xl font-black text-white font-mono mb-3">
          {t('success.title')}
        </h1>

        <p className="text-gray-300 mb-4">
          {t('success.message')}
        </p>

        {blockX && blockY && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-950/50 border border-indigo-500/30 rounded-lg mb-8">
            <span className="text-indigo-300 font-mono text-sm">
              Bloque ({parseInt(blockX) * 10}, {parseInt(blockY) * 10}) — permanentemente tuyo
            </span>
          </div>
        )}

        {/* Pixel art block preview */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-8 grid-rows-8 gap-px p-3 bg-gray-900 rounded-lg border border-gray-700">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: i % 7 === 0 ? '#6366f1' : i % 5 === 0 ? '#8b5cf6' : '#1e1b4b',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold rounded-lg transition-colors"
          >
            {t('success.viewMosaic')}
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-mono rounded-lg transition-colors"
          >
            {t('success.backHome')}
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-600 font-mono">
          Recibirás un correo de confirmación de Stripe con los detalles de tu compra.
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
