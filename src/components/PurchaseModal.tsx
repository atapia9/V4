'use client'

import { useState, useRef, useCallback } from 'react'
import { Block, BLOCK_PRICE_USD } from '@/lib/supabase'
import { useLocale } from '@/lib/LocaleContext'

interface PurchaseModalProps {
  block: Block | null
  onClose: () => void
}

interface FormData {
  ownerName: string
  linkUrl: string
  description: string
  imageFile: File | null
  imagePreview: string | null
}

export default function PurchaseModal({ block, onClose }: PurchaseModalProps) {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormData>({
    ownerName: '',
    linkUrl: '',
    description: '',
    imageFile: null,
    imagePreview: null,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!form.ownerName.trim()) {
      newErrors.ownerName = t('modal.nameRequired')
    }

    if (!form.linkUrl.trim()) {
      newErrors.linkUrl = t('modal.urlRequired')
    } else {
      try {
        new URL(form.linkUrl)
      } catch {
        newErrors.linkUrl = t('modal.invalidUrl')
      }
    }

    if (!form.imageFile) {
      newErrors.imageFile = t('modal.imageRequired')
    } else {
      if (form.imageFile.size > 2 * 1024 * 1024) {
        newErrors.imageFile = t('modal.imageTooLarge')
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(form.imageFile.type)) {
        newErrors.imageFile = t('modal.invalidFormat')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form, t])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setForm(prev => ({ ...prev, imageFile: file }))

    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, imagePreview: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!block || !validate()) return

    setSubmitting(true)

    try {
      // Upload image first
      let imageUrl = ''
      if (form.imageFile) {
        const uploadData = new FormData()
        uploadData.append('file', form.imageFile)
        uploadData.append('blockId', String(block.id))

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })

        if (!uploadRes.ok) {
          throw new Error('Image upload failed')
        }

        const uploadResult = await uploadRes.json()
        imageUrl = uploadResult.url
      }

      // Create checkout session
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId: block.id,
          xPosition: block.x_position,
          yPosition: block.y_position,
          ownerName: form.ownerName,
          linkUrl: form.linkUrl,
          imageUrl,
          description: form.description,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!block) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">{t('modal.title')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('modal.blockInfo')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Block Info */}
        <div className="px-6 py-3 bg-indigo-950/50 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-gray-400">
              {t('modal.coordinates')}: <span className="text-indigo-300">({block.x_position * 10}, {block.y_position * 10})</span>
            </span>
            <span className="text-gray-400">
              {t('modal.price')}: <span className="text-emerald-400 font-bold">${BLOCK_PRICE_USD} USD</span>
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Advertiser Name */}
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-1.5">
              {t('modal.advertiserName')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => setForm(prev => ({ ...prev, ownerName: e.target.value }))}
              placeholder={t('modal.advertiserNamePlaceholder')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {errors.ownerName && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.ownerName}</p>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-1.5">
              {t('modal.websiteUrl')} <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm(prev => ({ ...prev, linkUrl: e.target.value }))}
              placeholder={t('modal.websiteUrlPlaceholder')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {errors.linkUrl && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.linkUrl}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-1.5">
              {t('modal.uploadImage')} <span className="text-red-400">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-600 rounded-md p-4 cursor-pointer hover:border-indigo-500 transition-colors text-center"
            >
              {form.imagePreview ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="text-left">
                    <p className="text-sm text-white font-mono">{form.imageFile?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">
                      {form.imageFile ? (form.imageFile.size / 1024).toFixed(1) : 0} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400 font-mono">{t('modal.imageRequirements')}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {errors.imageFile && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.imageFile}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-1.5">
              {t('modal.description')}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('modal.descriptionPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/30 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-md font-mono text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-mono text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('modal.processing')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {t('modal.proceedPayment')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
