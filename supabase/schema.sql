-- ============================================================
-- Mosaico Digital Acambaro - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BLOCKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  image_url TEXT,
  link_url TEXT,
  owner_name TEXT,
  purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique position
  UNIQUE(x_position, y_position),
  
  -- Validate position ranges (102 cols x 80 rows)
  CONSTRAINT valid_x CHECK (x_position >= 0 AND x_position < 102),
  CONSTRAINT valid_y CHECK (y_position >= 0 AND y_position < 80)
);

-- Index for fast position lookups
CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(x_position, y_position);
CREATE INDEX IF NOT EXISTS idx_blocks_status ON blocks(status);
CREATE INDEX IF NOT EXISTS idx_blocks_owner ON blocks(owner_name);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Public can read all blocks
CREATE POLICY "Public read access" ON blocks
  FOR SELECT USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role full access" ON blocks
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create storage bucket for block images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'block-images',
  'block-images',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for storage
CREATE POLICY "Public read block images" ON storage.objects
  FOR SELECT USING (bucket_id = 'block-images');

-- Service role can upload
CREATE POLICY "Service role upload block images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'block-images' AND auth.role() = 'service_role');

-- Service role can update
CREATE POLICY "Service role update block images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'block-images' AND auth.role() = 'service_role');

-- Service role can delete
CREATE POLICY "Service role delete block images" ON storage.objects
  FOR DELETE USING (bucket_id = 'block-images' AND auth.role() = 'service_role');

-- ============================================================
-- STATS VIEW (optional, for performance)
-- ============================================================

CREATE OR REPLACE VIEW block_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'sold') AS sold_count,
  COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_count,
  COUNT(*) FILTER (WHERE status = 'available') AS available_count,
  COUNT(*) FILTER (WHERE status = 'sold') * 100 AS total_revenue_usd
FROM blocks;

-- ============================================================
-- SAMPLE DATA (optional - for testing)
-- ============================================================

-- Uncomment to insert some test sold blocks:
/*
INSERT INTO blocks (x_position, y_position, status, owner_name, link_url, purchase_date)
VALUES
  (0, 0, 'sold', 'Test Advertiser 1', 'https://example.com', NOW()),
  (1, 0, 'sold', 'Test Advertiser 2', 'https://example2.com', NOW()),
  (2, 0, 'reserved', NULL, NULL, NULL)
ON CONFLICT (x_position, y_position) DO NOTHING;
*/
