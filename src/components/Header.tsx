'use client'

import { useTheme } from 'next-themes'
import { useLocale } from '@/lib/LocaleContext'
import { Locale, localeNames } from '@/lib/i18n'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])

  const locales: Locale[] = ['es', 'en', 'pt', 'fr']

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 grid grid-cols-4 grid-rows-4 gap-px">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm transition-colors duration-300"
                  style={{
                    backgroundColor: [
                      '#6366f1', '#8b5cf6', '#6366f1', '#a78bfa',
                      '#8b5cf6', '#6366f1', '#a78bfa', '#6366f1',
                      '#a78bfa', '#6366f1', '#8b5cf6', '#6366f1',
                      '#6366f1', '#a78bfa', '#6366f1', '#8b5cf6',
                    ][i],
                  }}
                />
              ))}
            </div>
            <span className="font-bold text-white text-lg tracking-tight font-mono">
              {t('nav.title')}
            </span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors font-mono"
              >
                <span className="text-xs">🌐</span>
                <span className="uppercase">{locale}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-md border border-gray-700 bg-gray-900 shadow-xl z-50">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors hover:bg-gray-800 ${
                        locale === loc ? 'text-indigo-400' : 'text-gray-300'
                      }`}
                    >
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Admin Link */}
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm font-mono text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              {t('nav.admin')}
            </Link>

            {/* Buy Block CTA */}
            <a
              href="#mosaic"
              className="px-4 py-1.5 text-sm font-mono font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
            >
              {t('nav.buyBlock')}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
