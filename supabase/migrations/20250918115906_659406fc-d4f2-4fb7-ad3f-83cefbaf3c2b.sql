-- Update series thumbnails to vertical format
UPDATE public.series SET 
  thumbnail_url = CASE 
    WHEN id = '750e8400-e29b-41d4-a716-446655440001' THEN 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=533&fit=crop'
    WHEN id = '750e8400-e29b-41d4-a716-446655440002' THEN 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=533&fit=crop'
    WHEN id = '750e8400-e29b-41d4-a716-446655440003' THEN 'https://images.unsplash.com/photo-1518568814300-6c0582ba4351?w=300&h=533&fit=crop'
    WHEN id = '750e8400-e29b-41d4-a716-446655440004' THEN 'https://images.unsplash.com/photo-1489599735734-79b4706ca9aa?w=300&h=533&fit=crop'
    WHEN id = '750e8400-e29b-41d4-a716-446655440005' THEN 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=533&fit=crop'
    ELSE thumbnail_url
  END;