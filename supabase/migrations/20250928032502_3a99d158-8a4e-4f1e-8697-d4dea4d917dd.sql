-- Update Miss Unlucky series to use Episode 1's thumbnail as the main series thumbnail
UPDATE series 
SET thumbnail_url = 'https://nxsogkmnimaihoxbpnpd.supabase.co/storage/v1/object/public/episode-thumbnails/thumbnails/episode_752d678c-3a14-4e78-bfb2-8e5fae4b23ee_1759029769414.jpg',
    updated_at = now()
WHERE id = '6466c5fe-8250-4bec-86d8-3a4c5a1fee07';