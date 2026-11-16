// daily-update.js
require('dotenv').config({ path: '.env.local' });
const { ApifyClient } = require('apify-client');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function geocode(area, city) {
  try {
    const query = encodeURIComponent(`${area}, ${city}, India`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const response = await axios.get(url);
    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      return { lat, lng };
    }
  } catch (err) {
    console.error(`Geocoding failed for ${area}, ${city}`);
  }
  return { lat: 28.6139, lng: 77.2090 };
}

async function runDailyUpdate() {
  console.log('Fetching latest funding rounds from Apify...');
  try {
    const run = await apifyClient.actor("nexgendata/india-startup-funding-tracker").call({
      maxResults: 25
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`Fetched ${items.length} total funding rounds.`);

    const delhiKeywords = ['Delhi', 'Gurugram', 'Noida', 'Ghaziabad', 'Faridabad', 'NCR'];
    const recentRounds = items.filter(round => {
      const title = round.title || '';
      const isRecent = new Date(round.date) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      const isDelhi = delhiKeywords.some(keyword => title.includes(keyword));
      return isRecent && isDelhi;
    });

    console.log(`Found ${recentRounds.length} recent Delhi NCR funding rounds.`);

    for (const round of recentRounds) {
      const companyName = round.startupName;
      if (!companyName) continue;

      const slug = companyName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      
      const { data: existing } = await supabase
        .from('entities')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        console.log(`Skipping ${companyName}, already in database.`);
        continue;
      }

      const { lat, lng } = await geocode(round.city || 'Delhi', 'Delhi');

      const { error } = await supabase.from('entities').insert({
        name: companyName,
        slug: slug,
        tagline: round.title || `${companyName} - recently funded startup.`,
        city: 'Delhi',
        entity_type: 'startup',
        tags: ['Recently Funded', round.roundType || 'Funding'],
        lat: lat,
        lng: lng,
        is_verified: true,
        pin_precision: 'area_level',
      });

      if (error) {
        console.error(`Failed to insert ${companyName}:`, error.message);
      } else {
        console.log(`Successfully added ${companyName} (${round.roundType})`);
      }
    }
  } catch (error) {
    console.error('Error running daily update:', error);
  }
  console.log('Daily update complete!');
}

runDailyUpdate();