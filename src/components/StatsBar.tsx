'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/LocaleContext'
import { TOTAL_BLOCKS } from '@/lib/supabase'

interface Stats {
  sold: number
  available: number
  reserved: number
  revenue: number
}

export default function StatsBar() {
  const { t } = useLocale()
  const [stats, setStats] = useState<Stats>({
    sold: 0,
    available: TOTAL_BLOCKS,
    reserved: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/blocks/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    const interval = setInterval(loadStats, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const soldPercent = Math.round((stats.sold / TOTAL_BLOCKS) * 100)

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-sm font-mono text-gray-300">
                {loading ? (
                  <span className="inline-block w-16 h-4 bg-gray-700 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="text-white font-bold">{stats.sold.toLocaleString()}</span>
                    {' '}{t('stats.sold')}
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-mono text-gray-300">
                {loading ? (
                  <span className="inline-block w-16 h-4 bg-gray-700 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="text-white font-bold">{stats.available.toLocaleString()}</span>
                    {' '}{t('stats.available')}
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-mono text-gray-300">
                {loading ? (
                  <span className="inline-block w-20 h-4 bg-gray-700 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="text-white font-bold">${stats.revenue.toLocaleString()}</span>
                    {' '}{t('stats.revenue')}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 min-w-48">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
              {soldPercent}% {t('stats.sold')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
