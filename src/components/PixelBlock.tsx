'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Block, BLOCK_DISPLAY_SIZE } from '@/lib/supabase'

interface PixelBlockProps {
  block: Block
  onSelect: (block: Block) => void
}

const PixelBlock = memo(function PixelBlock({ block, onSelect }: PixelBlockProps) {
  const [hovered, setHovered] = useState(false)
  const size = BLOCK_DISPLAY_SIZE

  const handleClick = () => {
    if (block.status === 'available') {
      onSelect(block)
    } else if (block.status === 'sold' && block.link_url) {
      window.open(block.link_url, '_blank', 'noopener,noreferrer')
    }
  }

  const bgColor =
    block.status === 'available'
      ? hovered
        ? '#4f46e5'
        : '#1e1b4b'
      : block.status === 'reserved'
      ? hovered
        ? '#d97706'
        : '#92400e'
      : 'transparent'

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={
        block.status === 'sold'
          ? block.owner_name || 'Sold'
          : block.status === 'reserved'
          ? 'Reserved'
          : `Block (${block.x_position}, ${block.y_position}) - Click to buy`
      }
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        cursor: block.status === 'available' ? 'pointer' : block.status === 'sold' ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        outline: hovered ? '1px solid rgba(99, 102, 241, 0.8)' : '1px solid rgba(255,255,255,0.03)',
        transition: 'outline 0.1s, background-color 0.1s',
        flexShrink: 0,
      }}
    >
      {block.status === 'sold' && block.image_url && (
        <Image
          src={block.image_url}
          alt={block.owner_name || 'Ad'}
          fill
          sizes={`${size}px`}
          style={{ objectFit: 'cover' }}
          loading="lazy"
          unoptimized
        />
      )}

      {/* Hover overlay for sold blocks */}
      {block.status === 'sold' && hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      )}

      {/* Available block hover indicator */}
      {block.status === 'available' && hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'rgba(165, 180, 252, 0.8)',
            }}
          />
        </div>
      )}
    </div>
  )
})

export default PixelBlock
