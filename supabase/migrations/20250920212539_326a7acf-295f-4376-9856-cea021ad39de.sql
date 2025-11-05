-- Update episode titles with creative captions based on series themes

-- Auto Johny S2 (Auto/Car theme)
UPDATE public.episodes 
SET title = CASE episode_number
  WHEN 1 THEN 'Episode 1 - The Engine Starts'
  WHEN 2 THEN 'Episode 2 - First Gear'
  WHEN 3 THEN 'Episode 3 - Highway Dreams'
  WHEN 4 THEN 'Episode 4 - Mechanic Troubles'
  WHEN 5 THEN 'Episode 5 - Fuel Crisis'
  WHEN 6 THEN 'Episode 6 - Night Drive'
  WHEN 7 THEN 'Episode 7 - Speed Limit'
  WHEN 8 THEN 'Episode 8 - Brake Check'
  WHEN 9 THEN 'Episode 9 - Crossroads'
  WHEN 10 THEN 'Episode 10 - Pit Stop'
  WHEN 11 THEN 'Episode 11 - Overheating'
  WHEN 12 THEN 'Episode 12 - Reverse Gear'
  WHEN 13 THEN 'Episode 13 - GPS Lost'
  WHEN 14 THEN 'Episode 14 - Traffic Jam'
  WHEN 15 THEN 'Episode 15 - Oil Change'
  WHEN 16 THEN 'Episode 16 - Battery Dead'
  WHEN 17 THEN 'Episode 17 - Tyre Burst'
  WHEN 18 THEN 'Episode 18 - New Route'
  WHEN 19 THEN 'Episode 19 - Final Lap'
  WHEN 20 THEN 'Episode 20 - Victory Drive'
  WHEN 21 THEN 'Episode 21 - Next Journey'
  WHEN 22 THEN 'Episode 22 - Road Trip'
  WHEN 23 THEN 'Episode 23 - Destination'
  WHEN 24 THEN 'Episode 24 - Parking Lot'
  WHEN 25 THEN 'Episode 25 - Car Wash'
  WHEN 26 THEN 'Episode 26 - Service Time'
  WHEN 27 THEN 'Episode 27 - Test Drive'
  WHEN 28 THEN 'Episode 28 - Long Miles'
  WHEN 29 THEN 'Episode 29 - Last Stop'
  WHEN 30 THEN 'Episode 30 - Journey''s End'
  ELSE 'Episode ' || episode_number || ' - Road Ahead'
END
WHERE series_id = (SELECT id FROM series WHERE title = 'Auto Johny S2');

-- Dil Patang (Heart/Kite theme)
UPDATE public.episodes 
SET title = CASE episode_number
  WHEN 1 THEN 'Episode 1 - Flying High'
  WHEN 2 THEN 'Episode 2 - String of Love'
  WHEN 3 THEN 'Episode 3 - Windy Hearts'
  WHEN 4 THEN 'Episode 4 - Sky Dancing'
  WHEN 5 THEN 'Episode 5 - Tangled Strings'
  WHEN 6 THEN 'Episode 6 - Festival Colors'
  WHEN 7 THEN 'Episode 7 - Paper Dreams'
  WHEN 8 THEN 'Episode 8 - Broken Wings'
  WHEN 9 THEN 'Episode 9 - New Heights'
  WHEN 10 THEN 'Episode 10 - Freedom Flight'
  ELSE 'Episode ' || episode_number || ' - Soaring Spirit'
END
WHERE series_id = (SELECT id FROM series WHERE title = 'Dil Patang');

-- I'm Not A Virgin Mini Series (Romance/Drama theme)
UPDATE public.episodes 
SET title = CASE episode_number
  WHEN 1 THEN 'Episode 1 - First Confessions'
  WHEN 2 THEN 'Episode 2 - Hidden Secrets'
  WHEN 3 THEN 'Episode 3 - Truth Unveiled'
  WHEN 4 THEN 'Episode 4 - Heart to Heart'
  WHEN 5 THEN 'Episode 5 - Breaking Barriers'
  WHEN 6 THEN 'Episode 6 - New Beginnings'
  ELSE 'Episode ' || episode_number || ' - Love''s Journey'
END
WHERE series_id = (SELECT id FROM series WHERE title = 'I''m Not A Virgin Mini Series');

-- Itlu Seethamahalakshmi (Traditional/Cultural theme)
UPDATE public.episodes 
SET title = CASE episode_number
  WHEN 1 THEN 'Episode 1 - Sacred Traditions'
  WHEN 2 THEN 'Episode 2 - Family Honor'
  WHEN 3 THEN 'Episode 3 - Cultural Bonds'
  WHEN 4 THEN 'Episode 4 - Ancient Wisdom'
  WHEN 5 THEN 'Episode 5 - Festival Celebrations'
  WHEN 6 THEN 'Episode 6 - Blessed Union'
  WHEN 7 THEN 'Episode 7 - Golden Heritage'
  WHEN 8 THEN 'Episode 8 - Sacred Rituals'
  WHEN 9 THEN 'Episode 9 - Divine Blessings'
  WHEN 10 THEN 'Episode 10 - Eternal Love'
  ELSE 'Episode ' || episode_number || ' - Sacred Journey'
END
WHERE series_id = (SELECT id FROM series WHERE title = 'Itlu Seethamahalakshmi');

-- Prostitute Premakatha (Drama/Social theme)
UPDATE public.episodes 
SET title = CASE episode_number
  WHEN 1 THEN 'Episode 1 - Shattered Dreams'
  WHEN 2 THEN 'Episode 2 - Street Stories'
  WHEN 3 THEN 'Episode 3 - Hope in Darkness'
  WHEN 4 THEN 'Episode 4 - Finding Light'
  WHEN 5 THEN 'Episode 5 - Second Chances'
  WHEN 6 THEN 'Episode 6 - New Dawn'
  WHEN 7 THEN 'Episode 7 - Redemption Path'
  WHEN 8 THEN 'Episode 8 - Breaking Chains'
  WHEN 9 THEN 'Episode 9 - Rising Above'
  WHEN 10 THEN 'Episode 10 - Freedom Found'
  ELSE 'Episode ' || episode_number || ' - Journey Home'
END
WHERE series_id = (SELECT id FROM series WHERE title = 'Prostitute Premakatha');

-- Software Sankranthi Kastalu (Tech/Festival theme)
UPDATE public.episodes 
SET title = CASE episode_number
  WHEN 1 THEN 'Episode 1 - Code Festival'
  WHEN 2 THEN 'Episode 2 - Bug Hunt'
  WHEN 3 THEN 'Episode 3 - Server Crash'
  WHEN 4 THEN 'Episode 4 - Deadline Pressure'
  WHEN 5 THEN 'Episode 5 - Team Bonding'
  WHEN 6 THEN 'Episode 6 - Release Day'
  WHEN 7 THEN 'Episode 7 - Client Chaos'
  WHEN 8 THEN 'Episode 8 - Coffee Break'
  WHEN 9 THEN 'Episode 9 - Final Push'
  WHEN 10 THEN 'Episode 10 - Success Story'
  ELSE 'Episode ' || episode_number || ' - Tech Tales'
END
WHERE series_id = (SELECT id FROM series WHERE title = 'Software Sankranthi Kastalu');