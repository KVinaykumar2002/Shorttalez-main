-- Update episode descriptions with unique content for each episode
UPDATE public.episodes 
SET description = CASE 
  WHEN title = 'Episode 1' THEN 'Meet our protagonist as they navigate the complexities of modern relationships. A bold introduction to a thought-provoking series that challenges social conventions.'
  WHEN title = 'Episode 2' THEN 'Relationships get complicated as secrets begin to unravel. Our characters face difficult choices that will change their lives forever.'
  WHEN title = 'Episode 3' THEN 'The truth comes to light in unexpected ways. Personal boundaries are tested as relationships reach a breaking point.'
  WHEN title = 'Episode 4' THEN 'Confrontations lead to revelations. Characters must face the consequences of their actions and make life-changing decisions.'
  WHEN title = 'Episode 5' THEN 'Past and present collide in dramatic fashion. Trust is broken and rebuilt as characters search for redemption and understanding.'
  WHEN title = 'Episode 6' THEN 'The finale brings resolution and new beginnings. Characters find closure while opening doors to unexpected possibilities.'
  ELSE description
END
WHERE series_id = '44c9d94b-35b3-4054-9a22-4baa57e24a25';