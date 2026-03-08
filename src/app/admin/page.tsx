'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Block } from '@/lib/supabase'
import { useLocale } from '@/lib/LocaleContext'
import Image from 'next/image'
import Link from 'next/link'

type AdminView = 'login' | 'dashboard'

export default function AdminPage() {
  const { t } = useLocale()
  const [view, setView] = useState<AdminView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [blocks, setBlocks] = useState<Block[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [editForm, setEditForm] = useState({ link_url: '', owner_name: '' })

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setView('dashboard')
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoginError(error.message)
    } else {
      setView('dashboard')
    }
    setLoginLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView('login')
  }

  const loadBlocks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/blocks?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBlocks(data)
      }
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    if (view === 'dashboard') {
      loadBlocks()
    }
  }, [view, loadBlocks])

  const handleDelete = async (block: Block) => {
    if (!confirm(t('admin.confirmDelete'))) return

    const res = await fetch(`/api/admin/blocks/${block.id}`, { method: 'DELETE' })
    if (res.ok) {
      setBlocks(prev => prev.filter(b => b.id !== block.id))
    }
  }

  const handleReserve = async (block: Block) => {
    const res = await fetch(`/api/admin/blocks/${block.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'reserved' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBlocks(prev => prev.map(b => b.id === block.id ? updated : b))
    }
  }

  const handleEditSave = async () => {
    if (!editingBlock) return

    const res = await fetch(`/api/admin/blocks/${editingBlock.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const updated = await res.json()
      setBlocks(prev => prev.map(b => b.id === editingBlock.id ? updated : b))
      setEditingBlock(null)
    }
  }

  const statusColors: Record<string, string> = {
    available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    reserved: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    sold: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 grid grid-cols-3 grid-rows-3 gap-px">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm"
                  style={{ backgroundColor: i % 2 === 0 ? '#6366f1' : '#1e1b4b' }}
                />
              ))}
            </div>
            <h1 className="text-2xl font-bold text-white font-mono">{t('admin.login')}</h1>
            <p className="text-gray-400 text-sm mt-1 font-mono">Mosaico Digital Acambaro</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-1.5">{t('admin.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-1.5">{t('admin.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-sm font-mono">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Cargando...' : t('admin.loginButton')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-300 font-mono text-sm transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Admin Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white font-mono">{t('admin.title')}</h1>
            <p className="text-gray-400 text-xs font-mono mt-0.5">Mosaico Digital Acambaro</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-mono text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              ← Ver sitio
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-mono text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
            >
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search')}
            className="flex-1 min-w-48 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">{t('admin.allStatus')}</option>
            <option value="sold">Vendidos</option>
            <option value="reserved">Reservados</option>
            <option value="available">Disponibles</option>
          </select>
          <button
            onClick={loadBlocks}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-sm rounded-md transition-colors"
          >
            Buscar
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total bloques', value: blocks.length, color: 'text-white' },
            { label: 'Vendidos', value: blocks.filter(b => b.status === 'sold').length, color: 'text-indigo-400' },
            { label: 'Reservados', value: blocks.filter(b => b.status === 'reserved').length, color: 'text-yellow-400' },
            { label: 'Revenue', value: `$${blocks.filter(b => b.status === 'sold').length * 100}`, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-mono mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Blocks Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">Posición</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">Anunciante</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">Imagen</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500 font-mono text-sm">
                        No se encontraron bloques
                      </td>
                    </tr>
                  ) : (
                    blocks.map((block) => (
                      <tr key={block.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-400">{block.id}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-300">
                          ({block.x_position * 10}, {block.y_position * 10})
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${statusColors[block.status] || ''}`}>
                            {block.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-mono max-w-32 truncate">
                          {block.owner_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-indigo-400 max-w-40 truncate">
                          {block.link_url ? (
                            <a href={block.link_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {block.link_url}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {block.image_url ? (
                            <div className="relative w-8 h-8 rounded overflow-hidden">
                              <Image
                                src={block.image_url}
                                alt={block.owner_name || 'Block'}
                                fill
                                sizes="32px"
                                style={{ objectFit: 'cover' }}
                                unoptimized
                              />
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">
                          {block.purchase_date
                            ? new Date(block.purchase_date).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingBlock(block)
                                setEditForm({ link_url: block.link_url || '', owner_name: block.owner_name || '' })
                              }}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title={t('admin.editBlock')}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {block.status !== 'reserved' && (
                              <button
                                onClick={() => handleReserve(block)}
                                className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors"
                                title={t('admin.reserveBlock')}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(block)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                              title={t('admin.deleteBlock')}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white font-mono mb-4">
              {t('admin.editBlock')} #{editingBlock.id}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, owner_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1.5">URL</label>
                <input
                  type="url"
                  value={editForm.link_url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, link_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingBlock(null)}
                className="flex-1 py-2 border border-gray-600 text-gray-300 rounded-md font-mono text-sm hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-mono text-sm transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
