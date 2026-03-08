'use client'

import { useState } from 'react'
import { Block } from '@/lib/supabase'
import { useLocale } from '@/lib/LocaleContext'
import Header from '@/components/Header'
import StatsBar from '@/components/StatsBar'
import PixelGrid from '@/components/PixelGrid'
import PurchaseModal from '@/components/PurchaseModal'

export default function HomePage() {
  const { t } = useLocale()
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <StatsBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-gray-950" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            8,160 bloques disponibles • $100 USD cada uno
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('hero.headline')}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-4 font-mono max-w-2xl mx-auto">
            {t('hero.subheadline')}
          </p>

          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#mosaic"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all duration-200 font-mono text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              {t('hero.cta')} →
            </a>
            <a
              href="#mosaic"
              className="px-8 py-3.5 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-mono text-sm rounded-lg transition-all duration-200"
            >
              Ver el Mosaico
            </a>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            {[
              '🔒 Permanente',
              '⚡ Instantáneo',
              '🌍 Global',
              '💳 Pago seguro',
            ].map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 bg-gray-800/60 border border-gray-700 rounded-full text-xs text-gray-400 font-mono"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mosaic Section */}
      <section id="mosaic" className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">{t('grid.title')}</h2>
              <p className="text-gray-400 text-sm mt-1 font-mono">
                1024 × 800 px • 10×10 px por bloque
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-500">
              <span className="text-indigo-400">●</span> Haz clic en un bloque disponible para comprarlo
            </div>
          </div>

          <PixelGrid onBlockSelect={setSelectedBlock} />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white font-mono text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Elige tu bloque',
                desc: 'Navega el mosaico y haz clic en cualquier bloque disponible para seleccionarlo.',
                icon: '🎯',
              },
              {
                step: '02',
                title: 'Personaliza tu anuncio',
                desc: 'Sube tu imagen, agrega tu URL y nombre de anunciante.',
                icon: '🎨',
              },
              {
                step: '03',
                title: 'Paga y publica',
                desc: 'Completa el pago seguro con Stripe. Tu bloque aparece permanentemente.',
                icon: '🚀',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-xl border border-gray-700 bg-gray-900/50 hover:border-indigo-500/50 transition-colors"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-indigo-400 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 grid grid-cols-2 grid-rows-2 gap-px">
              {['#6366f1', '#8b5cf6', '#a78bfa', '#6366f1'].map((color, i) => (
                <div key={i} className="rounded-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="text-gray-400 font-mono text-sm">Mosaico Digital Acambaro</span>
          </div>
          <p className="text-gray-600 font-mono text-xs">
            © {new Date().getFullYear()} • {t('footer.tagline')}
          </p>
        </div>
      </footer>

      {/* Purchase Modal */}
      {selectedBlock && (
        <PurchaseModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  )
}
