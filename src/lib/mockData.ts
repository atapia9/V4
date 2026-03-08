import { Block, GRID_COLS, GRID_ROWS, TOTAL_BLOCKS, BLOCK_PRICE_USD } from './supabase'

// ─── Mock Blocks ────────────────────────────────────────────────────────────

/** Generate a deterministic set of mock blocks for UI testing */
export function generateMockBlocks(): Block[] {
  const blocks: Block[] = []

  // Sold blocks with images (scattered across the grid)
  const soldPositions = [
    { x: 5, y: 3, owner: 'Tacos El Güero', url: 'https://example.com/tacos', color: '#6366f1' },
    { x: 10, y: 7, owner: 'Farmacia Cruz Verde', url: 'https://example.com/farmacia', color: '#8b5cf6' },
    { x: 20, y: 15, owner: 'Panadería La Esperanza', url: 'https://example.com/pan', color: '#ec4899' },
    { x: 30, y: 5, owner: 'Ferretería Acambaro', url: 'https://example.com/ferreteria', color: '#f59e0b' },
    { x: 45, y: 20, owner: 'Clínica Dental Sonrisa', url: 'https://example.com/dental', color: '#10b981' },
    { x: 60, y: 10, owner: 'Auto Partes Morales', url: 'https://example.com/autos', color: '#3b82f6' },
    { x: 75, y: 30, owner: 'Tienda de Ropa Moda', url: 'https://example.com/ropa', color: '#ef4444' },
    { x: 85, y: 45, owner: 'Restaurante El Mirador', url: 'https://example.com/restaurante', color: '#14b8a6' },
    { x: 15, y: 50, owner: 'Escuela de Música', url: 'https://example.com/musica', color: '#a855f7' },
    { x: 50, y: 60, owner: 'Veterinaria Patitas', url: 'https://example.com/vet', color: '#f97316' },
    { x: 90, y: 70, owner: 'Gym Fuerza Total', url: 'https://example.com/gym', color: '#06b6d4' },
    { x: 35, y: 35, owner: 'Librería El Saber', url: 'https://example.com/libros', color: '#84cc16' },
    { x: 65, y: 55, owner: 'Joyería Brillante', url: 'https://example.com/joyeria', color: '#eab308' },
    { x: 25, y: 65, owner: 'Papelería Colores', url: 'https://example.com/papeleria', color: '#f43f5e' },
    { x: 80, y: 20, owner: 'Taller Mecánico Rápido', url: 'https://example.com/taller', color: '#64748b' },
  ]

  // Reserved blocks
  const reservedPositions = [
    { x: 8, y: 12 },
    { x: 22, y: 8 },
    { x: 40, y: 25 },
    { x: 55, y: 40 },
    { x: 70, y: 15 },
    { x: 95, y: 50 },
    { x: 12, y: 70 },
    { x: 48, y: 75 },
  ]

  let id = 1

  for (const pos of soldPositions) {
    blocks.push({
      id: id++,
      x_position: pos.x,
      y_position: pos.y,
      status: 'sold',
      image_url: `https://placehold.co/20x20/${pos.color.replace('#', '')}/${pos.color.replace('#', '')}`,
      link_url: pos.url,
      owner_name: pos.owner,
      purchase_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  for (const pos of reservedPositions) {
    blocks.push({
      id: id++,
      x_position: pos.x,
      y_position: pos.y,
      status: 'reserved',
      image_url: null,
      link_url: null,
      owner_name: null,
      purchase_date: null,
    })
  }

  return blocks
}

export const MOCK_BLOCKS = generateMockBlocks()

export const MOCK_STATS = {
  sold: MOCK_BLOCKS.filter(b => b.status === 'sold').length,
  reserved: MOCK_BLOCKS.filter(b => b.status === 'reserved').length,
  available: TOTAL_BLOCKS - MOCK_BLOCKS.filter(b => b.status === 'sold').length - MOCK_BLOCKS.filter(b => b.status === 'reserved').length,
  revenue: MOCK_BLOCKS.filter(b => b.status === 'sold').length * BLOCK_PRICE_USD,
  total: TOTAL_BLOCKS,
}

export { GRID_COLS, GRID_ROWS, TOTAL_BLOCKS, BLOCK_PRICE_USD }
