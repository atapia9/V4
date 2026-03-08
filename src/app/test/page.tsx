'use client'

import { useState, useMemo, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Block, GRID_COLS, GRID_ROWS, BLOCK_DISPLAY_SIZE, BLOCK_PRICE_USD, TOTAL_BLOCKS } from '@/lib/supabase'
import { MOCK_BLOCKS, MOCK_STATS } from '@/lib/mockData'
import PixelBlock from '@/components/PixelBlock'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

type TestSection = 'overview' | 'grid' | 'modal' | 'stats' | 'blocks'

// ─── Mock Stats Bar (standalone, no API call) ────────────────────────────────

function MockStatsBar({ stats }: { stats: typeof MOCK_STATS }) {
  const soldPercent = Math.round((stats.sold / stats.total) * 100)
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-mono text-gray-300">
              <span className="text-white font-bold">{stats.sold.toLocaleString()}</span> vendidos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-mono text-gray-300">
              <span className="text-white font-bold">{stats.available.toLocaleString()}</span> disponibles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm font-mono text-gray-300">
              <span className="text-white font-bold">{stats.available.toLocaleString()}</span> disponibles
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 min-w-48">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-400 whitespace-nowrap">{soldPercent}% vendido</span>
        </div>
      </div>
    </div>
  )
}

// ─── Mock Purchase Modal ──────────────────────────────────────────────────────

function MockPurchaseModal({ block, onClose }: { block: Block; onClose: () => void }) {
  const [form, setForm] = useState({ ownerName: '', linkUrl: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'form' | 'success'>('form')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.ownerName.trim()) e.ownerName = 'El nombre es requerido'
    if (!form.linkUrl.trim()) e.linkUrl = 'La URL es requerida'
    else {
      try { new URL(form.linkUrl) } catch { e.linkUrl = 'URL inválida' }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) setStep('success')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Comprar Bloque</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 'success' ? '✅ Simulación completada' : 'Formulario de compra (modo test)'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Block Info */}
        <div className="px-6 py-3 bg-indigo-950/50 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-gray-400">
              Coordenadas: <span className="text-indigo-300">({block.x_position * 10}, {block.y_position * 10})</span>
            </span>
            <span className="text-gray-400">
              Precio: <span className="text-emerald-400 font-bold">${BLOCK_PRICE_USD} USD</span>
            </span>
          </div>
        </div>

        {step === 'success' ? (
          <div className="px-6 py-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white font-mono mb-2">¡Simulación exitosa!</h3>
            <p className="text-gray-400 text-sm mb-1">Anunciante: <span className="text-white">{form.ownerName}</span></p>
            <p className="text-gray-400 text-sm mb-1">URL: <span className="text-indigo-300">{form.linkUrl}</span></p>
            <p className="text-gray-500 text-xs mt-4 font-mono">
              En producción, esto redirige a Stripe Checkout.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-mono text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1.5">
                  Nombre del anunciante <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm(p => ({ ...p, ownerName: e.target.value }))}
                  placeholder="Mi Empresa S.A."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.ownerName && <p className="mt-1 text-xs text-red-400 font-mono">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1.5">
                  URL del sitio web <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) => setForm(p => ({ ...p, linkUrl: e.target.value }))}
                  placeholder="https://miempresa.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.linkUrl && <p className="mt-1 text-xs text-red-400 font-mono">{errors.linkUrl}</p>}
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1.5">Imagen</label>
                <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center text-gray-500 font-mono text-xs">
                  📎 Subida de imagen deshabilitada en modo test
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descripción opcional..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/30 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-md font-mono text-sm hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-mono text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Simular Pago →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Mock Pixel Grid (uses mock data, no API) ─────────────────────────────────

function MockPixelGrid({ onBlockSelect }: { onBlockSelect: (b: Block) => void }) {
  const blockMap = useMemo(() => {
    const map = new Map<string, Block>()
    MOCK_BLOCKS.forEach(b => map.set(`${b.x_position},${b.y_position}`, b))
    return map
  }, [])

  const gridRows = useMemo(() => {
    const rows: Block[][] = []
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowBlocks: Block[] = []
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${col},${row}`
        rowBlocks.push(blockMap.get(key) || {
          id: row * GRID_COLS + col,
          x_position: col,
          y_position: row,
          status: 'available' as const,
          image_url: null,
          link_url: null,
          owner_name: null,
          purchase_date: null,
        })
      }
      rows.push(rowBlocks)
    }
    return rows
  }, [blockMap])

  const canvasWidth = GRID_COLS * BLOCK_DISPLAY_SIZE
  const canvasHeight = GRID_ROWS * BLOCK_DISPLAY_SIZE

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <span className="text-xs font-mono text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-indigo-600" />
          <span className="text-xs font-mono text-gray-400">Vendido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#92400e' }} />
          <span className="text-xs font-mono text-gray-400">Reservado</span>
        </div>
        <span className="text-xs font-mono text-gray-500 ml-auto">
          {GRID_COLS} × {GRID_ROWS} = {(GRID_COLS * GRID_ROWS).toLocaleString()} bloques (mock)
        </span>
      </div>
      <div className="text-xs font-mono text-gray-500 mb-3 px-2">
        🖱️ Scroll para zoom • Arrastra para mover • Clic en bloque disponible para probar modal
      </div>
      <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-950" style={{ maxHeight: '70vh' }}>
        <TransformWrapper initialScale={1} minScale={0.3} maxScale={5} wheel={{ step: 0.1 }}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                <button onClick={() => zoomIn()} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center text-lg font-bold transition-colors border border-gray-600">+</button>
                <button onClick={() => zoomOut()} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center text-lg font-bold transition-colors border border-gray-600">−</button>
                <button onClick={() => resetTransform()} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center transition-colors border border-gray-600" title="Reset zoom">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <TransformComponent wrapperStyle={{ width: '100%', maxHeight: '70vh', overflow: 'hidden' }} contentStyle={{ cursor: 'grab' }}>
                <div style={{ width: canvasWidth, height: canvasHeight, display: 'flex', flexDirection: 'column' }}>
                  {gridRows.map((row, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex', flexDirection: 'row', height: BLOCK_DISPLAY_SIZE, flexShrink: 0 }}>
                      {row.map((block) => (
                        <PixelBlock key={`${block.x_position}-${block.y_position}`} block={block} onSelect={onBlockSelect} />
                      ))}
                    </div>
                  ))}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  )
}

// ─── API Status Checker ───────────────────────────────────────────────────────

type ApiStatus = 'idle' | 'loading' | 'ok' | 'error'

interface ApiResult {
  status: ApiStatus
  data?: unknown
  error?: string
  ms?: number
}

function ApiTester() {
  const endpoints = [
    { label: 'GET /api/blocks', url: '/api/blocks', method: 'GET' },
    { label: 'GET /api/blocks/stats', url: '/api/blocks/stats', method: 'GET' },
    { label: 'GET /api/admin/blocks', url: '/api/admin/blocks', method: 'GET' },
  ]

  const [results, setResults] = useState<Record<string, ApiResult>>({})

  const testEndpoint = useCallback(async (url: string, method: string) => {
    setResults(prev => ({ ...prev, [url]: { status: 'loading' } }))
    const start = Date.now()
    try {
      const res = await fetch(url, { method })
      const ms = Date.now() - start
      const data = await res.json()
      setResults(prev => ({
        ...prev,
        [url]: { status: res.ok ? 'ok' : 'error', data, ms, error: res.ok ? undefined : `HTTP ${res.status}` },
      }))
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [url]: { status: 'error', error: String(err), ms: Date.now() - start },
      }))
    }
  }, [])

  const testAll = useCallback(() => {
    endpoints.forEach(ep => testEndpoint(ep.url, ep.method))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testEndpoint])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 font-mono">
          Prueba los endpoints de la API. Requiere variables de entorno configuradas.
        </p>
        <button
          onClick={testAll}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-mono text-sm transition-colors"
        >
          Probar todos
        </button>
      </div>

      <div className="space-y-3">
        {endpoints.map((ep) => {
          const result = results[ep.url]
          return (
            <div key={ep.url} className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded text-xs font-mono font-bold">
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm text-white">{ep.label}</span>
                  {result?.ms !== undefined && (
                    <span className="text-xs font-mono text-gray-500">{result.ms}ms</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {result && (
                    <span className={`text-xs font-mono font-bold ${
                      result.status === 'ok' ? 'text-emerald-400' :
                      result.status === 'error' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {result.status === 'loading' ? '⏳ loading...' :
                       result.status === 'ok' ? '✅ OK' :
                       `❌ ${result.error}`}
                    </span>
                  )}
                  <button
                    onClick={() => testEndpoint(ep.url, ep.method)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs font-mono transition-colors"
                  >
                    Probar
                  </button>
                </div>
              </div>
              {result?.data !== undefined && result.status === 'ok' && (
                <div className="px-4 py-3 bg-gray-950 border-t border-gray-700">
                  <pre className="text-xs font-mono text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Block Inspector ──────────────────────────────────────────────────────────

function BlockInspector() {
  const sold = MOCK_BLOCKS.filter(b => b.status === 'sold')
  const reserved = MOCK_BLOCKS.filter(b => b.status === 'reserved')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total bloques', value: TOTAL_BLOCKS.toLocaleString(), color: 'text-white' },
          { label: 'Vendidos (mock)', value: sold.length, color: 'text-indigo-400' },
          { label: 'Reservados (mock)', value: reserved.length, color: 'text-yellow-400' },
          { label: 'Disponibles (mock)', value: (TOTAL_BLOCKS - sold.length - reserved.length).toLocaleString(), color: 'text-emerald-400' },
          { label: 'Precio por bloque', value: `$${BLOCK_PRICE_USD}`, color: 'text-white' },
          { label: 'Ingresos máx.', value: `$${(TOTAL_BLOCKS * BLOCK_PRICE_USD).toLocaleString()}`, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-xs font-mono text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-mono text-gray-400 mb-3">Bloques vendidos (mock data)</h3>
        <div className="overflow-auto max-h-64 rounded-lg border border-gray-700">
          <table className="w-full text-xs font-mono">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-gray-400">ID</th>
                <th className="px-3 py-2 text-left text-gray-400">Posición</th>
                <th className="px-3 py-2 text-left text-gray-400">Anunciante</th>
                <th className="px-3 py-2 text-left text-gray-400">URL</th>
                <th className="px-3 py-2 text-left text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BLOCKS.map((block) => (
                <tr key={block.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-3 py-2 text-gray-400">{block.id}</td>
                  <td className="px-3 py-2 text-gray-300">({block.x_position}, {block.y_position})</td>
                  <td className="px-3 py-2 text-white">{block.owner_name || '—'}</td>
                  <td className="px-3 py-2 text-indigo-400 truncate max-w-32">
                    {block.link_url ? (
                      <a href={block.link_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {block.link_url}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      block.status === 'sold' ? 'bg-indigo-900 text-indigo-300' :
                      block.status === 'reserved' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {block.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main Test Page ───────────────────────────────────────────────────────────

export default function TestPage() {
  const [activeSection, setActiveSection] = useState<TestSection>('overview')
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [modalDemoBlock] = useState<Block>({
    id: 999,
    x_position: 42,
    y_position: 17,
    status: 'available',
    image_url: null,
    link_url: null,
    owner_name: null,
    purchase_date: null,
  })

  const sections: { id: TestSection; label: string; icon: string }[] = [
    { id: 'overview', label: 'Resumen', icon: '🏠' },
    { id: 'grid', label: 'Mosaico (mock)', icon: '🎨' },
    { id: 'modal', label: 'Modal de compra', icon: '💳' },
    { id: 'stats', label: 'Estadísticas', icon: '📊' },
    { id: 'blocks', label: 'Datos de bloques', icon: '🔍' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Test Header */}
      <div className="sticky top-0 z-40 border-b border-yellow-500/30 bg-yellow-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-yellow-500 text-yellow-950 rounded text-xs font-mono font-black">TEST</span>
            <span className="font-mono text-yellow-200 text-sm font-semibold">Frontend de prueba — sin Supabase ni Stripe</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-mono text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors border border-gray-700"
            >
              ← Ir al sitio real
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm font-mono text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors border border-gray-700"
            >
              Admin →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section Nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                activeSection === s.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black font-mono text-white mb-2">
                🧪 Test Frontend
              </h1>
              <p className="text-gray-400 max-w-2xl">
                Esta página te permite probar todos los componentes de UI de <strong className="text-white">Mosaico Digital Acambaro</strong> sin necesitar Supabase ni Stripe configurados. Usa datos mock para simular el estado real de la aplicación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'Mosaico (mock)',
                  desc: 'El grid completo 102×80 con bloques mock vendidos, reservados y disponibles. Zoom/pan funcional.',
                  icon: '🎨',
                  section: 'grid' as TestSection,
                  badge: 'Interactivo',
                },
                {
                  title: 'Modal de compra',
                  desc: 'Formulario de compra con validación. Simula el flujo completo sin llamar a Stripe.',
                  icon: '💳',
                  section: 'modal' as TestSection,
                  badge: 'Simulado',
                },
                {
                  title: 'Estadísticas',
                  desc: 'Barra de estadísticas con datos mock y prueba de endpoints de API reales.',
                  icon: '📊',
                  section: 'stats' as TestSection,
                  badge: 'Mock + API',
                },
                {
                  title: 'Datos de bloques',
                  desc: 'Inspecciona los bloques mock: posiciones, anunciantes, URLs y estados.',
                  icon: '🔍',
                  section: 'blocks' as TestSection,
                  badge: 'Datos',
                },
              ].map((card) => (
                <button
                  key={card.title}
                  onClick={() => setActiveSection(card.section)}
                  className="text-left p-5 rounded-xl border border-gray-700 bg-gray-900/50 hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{card.icon}</span>
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs font-mono border border-gray-700">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono mb-1 group-hover:text-indigo-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-400">{card.desc}</p>
                </button>
              ))}
            </div>

            {/* Environment check */}
            <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/30">
              <h2 className="text-lg font-bold font-mono text-white mb-4">🔧 Variables de entorno</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'NEXT_PUBLIC_BASE_URL',
                  'NEXT_PUBLIC_SUPABASE_URL',
                  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                  'SUPABASE_SERVICE_ROLE_KEY',
                  'STRIPE_SECRET_KEY',
                  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
                  'STRIPE_WEBHOOK_SECRET',
                ].map((envVar) => (
                  <div key={envVar} className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-gray-500">•</span>
                    <code className="text-gray-300">{envVar}</code>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 font-mono">
                Copia <code className="text-gray-400">.env.local.example</code> a <code className="text-gray-400">.env.local</code> y rellena los valores para activar la funcionalidad completa.
              </p>
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        {activeSection === 'grid' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-mono text-white mb-1">🎨 Mosaico con datos mock</h2>
              <p className="text-gray-400 text-sm">
                {MOCK_BLOCKS.filter(b => b.status === 'sold').length} bloques vendidos •{' '}
                {MOCK_BLOCKS.filter(b => b.status === 'reserved').length} reservados •{' '}
                Haz clic en un bloque disponible para abrir el modal de compra simulado.
              </p>
            </div>
            <MockPixelGrid onBlockSelect={setSelectedBlock} />
          </div>
        )}

        {/* ── Modal ── */}
        {activeSection === 'modal' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-mono text-white mb-1">💳 Modal de compra</h2>
              <p className="text-gray-400 text-sm">
                Prueba el formulario de compra. La validación funciona igual que en producción, pero el pago es simulado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview card */}
              <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/30">
                <h3 className="text-sm font-mono text-gray-400 mb-4">Bloque de prueba</h3>
                <div className="space-y-2 text-sm font-mono mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID:</span>
                    <span className="text-white">{modalDemoBlock.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posición X:</span>
                    <span className="text-indigo-300">{modalDemoBlock.x_position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posición Y:</span>
                    <span className="text-indigo-300">{modalDemoBlock.y_position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado:</span>
                    <span className="text-emerald-400">{modalDemoBlock.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Precio:</span>
                    <span className="text-emerald-400 font-bold">${BLOCK_PRICE_USD} USD</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlock(modalDemoBlock)}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-mono text-sm font-semibold transition-colors"
                >
                  Abrir modal de compra →
                </button>
              </div>

              {/* Instructions */}
              <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/30">
                <h3 className="text-sm font-mono text-gray-400 mb-4">Qué probar</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  {[
                    'Enviar el formulario vacío → ver errores de validación',
                    'Ingresar una URL inválida → ver mensaje de error',
                    'Completar todos los campos → simular pago exitoso',
                    'Cerrar el modal con clic en el fondo oscuro',
                    'Cerrar con el botón ✕ en la esquina',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        {activeSection === 'stats' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-mono text-white mb-1">📊 Estadísticas</h2>
              <p className="text-gray-400 text-sm">Barra de estadísticas con datos mock y prueba de endpoints de API.</p>
            </div>

            <div>
              <h3 className="text-sm font-mono text-gray-400 mb-3">StatsBar con datos mock</h3>
              <MockStatsBar stats={MOCK_STATS} />
            </div>

            <div>
              <h3 className="text-sm font-mono text-gray-400 mb-3">Prueba de endpoints de API</h3>
              <ApiTester />
            </div>
          </div>
        )}

        {/* ── Blocks ── */}
        {activeSection === 'blocks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-mono text-white mb-1">🔍 Datos de bloques</h2>
              <p className="text-gray-400 text-sm">Inspecciona los bloques mock usados en esta página de prueba.</p>
            </div>
            <BlockInspector />
          </div>
        )}
      </div>

      {/* Purchase Modal (triggered from grid or modal section) */}
      {selectedBlock && (
        <MockPurchaseModal block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}
    </div>
  )
}
