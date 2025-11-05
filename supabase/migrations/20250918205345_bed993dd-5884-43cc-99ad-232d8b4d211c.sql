-- Update episodes 3-10 with the new Google Drive videos and mark them as approved
UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/1mAGOF0JBCZ86fttroLDUVyyDfA5pwju1/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 3;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/1az0QOf6ZIUhMkHhGVPJ-hwJJfy24QEuo/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 4;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/1bSU66hZrEMo-CFsCzuzF-27_XQH3Wf4o/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 5;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/13AgNzdM-33JhoZBsmq_gSWeahD5rcnEm/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 6;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/13pAWA_82Y1T9Kw0xQrdxVEwnVq_lKuq2/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 7;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/1cmp8k3afsNR93a_Lp1ehCBKtJ5Yb7HUw/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 8;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/1bSU66hZrEMo-CFsCzuzF-27_XQH3Wf4o/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 9;

UPDATE episodes SET 
  video_url = 'https://drive.google.com/file/d/1GASetdHbk9gwKfeLQn32aiuX3o8LuMjS/view?usp=sharing',
  status = 'approved',
  updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 10;

-- Update series episode count to 10
UPDATE series SET 
  episode_count = 10,
  updated_at = now()
WHERE id = '841851d2-9b1c-41f0-9773-2946243dbf7d';