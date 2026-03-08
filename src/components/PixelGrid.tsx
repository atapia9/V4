'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Block, GRID_COLS, GRID_ROWS, BLOCK_DISPLAY_SIZE } from '@/lib/supabase'
import PixelBlock from './PixelBlock'
import { useLocale } from '@/lib/LocaleContext'

interface PixelGridProps {
  onBlockSelect: (block: Block) => void
}

export default function PixelGrid({ onBlockSelect }: PixelGridProps) {
  const { t } = useLocale()
  const [blocks, setBlocks] = useState<Map<string, Block>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBlocks = useCallback(async () => {
    try {
      const res = await fetch('/api/blocks')
      if (!res.ok) throw new Error('Failed to fetch blocks')
      const data: Block[] = await res.json()

      const blockMap = new Map<string, Block>()
      data.forEach(block => {
        blockMap.set(`${block.x_position},${block.y_position}`, block)
      })
      setBlocks(blockMap)
    } catch (err) {
      console.error(err)
      setError('Failed to load the mosaic. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBlocks()
  }, [loadBlocks])

  // Build grid rows for rendering
  const gridRows = useMemo(() => {
    const rows: Block[][] = []
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowBlocks: Block[] = []
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${col},${row}`
        const block = blocks.get(key) || {
          id: row * GRID_COLS + col,
          x_position: col,
          y_position: row,
          status: 'available' as const,
          image_url: null,
          link_url: null,
          owner_name: null,
          purchase_date: null,
        }
        rowBlocks.push(block)
      }
      rows.push(rowBlocks)
    }
    return rows
  }, [blocks])

  const canvasWidth = GRID_COLS * BLOCK_DISPLAY_SIZE
  const canvasHeight = GRID_ROWS * BLOCK_DISPLAY_SIZE

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400 font-mono text-sm">Loading mosaic...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-red-400 font-mono text-sm mb-4">{error}</p>
          <button
            onClick={loadBlocks}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-mono text-sm hover:bg-indigo-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <span className="text-xs font-mono text-gray-400">{t('grid.available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-indigo-600" />
          <span className="text-xs font-mono text-gray-400">{t('grid.sold')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#92400e' }} />
          <span className="text-xs font-mono text-gray-400">{t('grid.reserved')}</span>
        </div>
        <span className="text-xs font-mono text-gray-500 ml-auto">
          {GRID_COLS} × {GRID_ROWS} = {(GRID_COLS * GRID_ROWS).toLocaleString()} blocks
        </span>
      </div>

      {/* Zoom/Pan Controls hint */}
      <div className="text-xs font-mono text-gray-500 mb-3 px-2">
        🖱️ Scroll to zoom • Drag to pan • Click available block to buy
      </div>

      {/* Grid Container */}
      <div
        className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-950"
        style={{ maxHeight: '70vh' }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.3}
          maxScale={5}
          wheel={{ step: 0.1 }}
          panning={{ velocityDisabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                <button
                  onClick={() => zoomIn()}
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center text-lg font-bold transition-colors border border-gray-600"
                >
                  +
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center text-lg font-bold transition-colors border border-gray-600"
                >
                  −
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center transition-colors border border-gray-600"
                  title="Reset zoom"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: '100%', maxHeight: '70vh', overflow: 'hidden' }}
                contentStyle={{ cursor: 'grab' }}
              >
                <div
                  style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {gridRows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        height: BLOCK_DISPLAY_SIZE,
                        flexShrink: 0,
                      }}
                    >
                      {row.map((block) => (
                        <PixelBlock
                          key={`${block.x_position}-${block.y_position}`}
                          block={block}
                          onSelect={onBlockSelect}
                        />
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
