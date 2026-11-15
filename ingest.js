require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const startups = [
  {
    name: "Zomato",
    tagline: "Food delivery and restaurant discovery platform.",
    city: "Gurugram",
    area: "Golf Course Ext Road",
    entity_type: "startup",
    founders: ["Deepinder Goyal", "Gaurav Gupta"],
    tags: ["FoodTech", "Listed"],
  },
  {
    name: "PolicyBazaar",
    tagline: "Online insurance aggregator and marketplace.",
    city: "Gurugram",
    area: "Sector 44",
    entity_type: "startup",
    founders: ["Yashish Dahiya", "Alok Bansal"],
    tags: ["Fintech", "Unicorn"],
  },
  {
    name: "Lenskart",
    tagline: "Omnichannel eyewear retailer.",
    city: "Gurugram",
    area: "Golf Course Road",
    entity_type: "startup",
    founders: ["Peyush Bansal"],
    tags: ["D2C", "Unicorn"],
  },
  {
    name: "Paytm",
    tagline: "Digital payments and financial services platform.",
    city: "Noida",
    area: "Sector 62",
    entity_type: "startup",
    founders: ["Vijay Shekhar Sharma"],
    tags: ["Fintech", "Listed"],
  },
  {
    name: "Delhivery",
    tagline: "Integrated third-party logistics provider.",
    city: "Gurugram",
    area: "Sector 44",
    entity_type: "startup",
    founders: ["Sahil Barua"],
    tags: ["Logistics", "Listed"],
  },
  {
    name: "MakeMyTrip",
    tagline: "Online travel booking platform.",
    city: "Gurugram",
    area: "Cyber City",
    entity_type: "startup",
    founders: ["Deep Kalra"],
    tags: ["Travel", "Listed"],
  },
  {
    name: "OYO",
    tagline: "Global hospitality platform offering budget hotel bookings.",
    city: "Gurugram",
    area: "Golf Course Ext Road",
    entity_type: "startup",
    founders: ["Ritesh Agarwal"],
    tags: ["Hospitality", "Unicorn"],
  },
  {
    name: "Moglix",
    tagline: "B2B e-commerce platform for industrial supplies.",
    city: "Noida",
    area: "Sector 125",
    entity_type: "startup",
    founders: ["Rahul Garg"],
    tags: ["B2B", "Unicorn"],
  },
  {
    name: "CarDekho",
    tagline: "Auto-tech platform for buying and selling cars.",
    city: "Gurugram",
    area: "Sector 32",
    entity_type: "startup",
    founders: ["Amit Jain", "Anurag Jain"],
    tags: ["AutoTech", "Unicorn"],
  },
  {
    name: "Info Edge (Naukri)",
    tagline: "Online recruitment and classifieds platform.",
    city: "Noida",
    area: "Sector 62",
    entity_type: "startup",
    founders: ["Sanjeev Bikhchandani"],
    tags: ["Internet", "Listed"],
  },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

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
  return { lat: 28.6139, lng: 77.209 };
}

async function run() {
  console.log(`Starting ingestion of ${startups.length} startups...`);

  for (const startup of startups) {
    console.log(`Geocoding ${startup.name}...`);
    const { lat, lng } = await geocode(startup.area, startup.city);

    const slug = slugify(startup.name);

    const { error } = await supabase.from("entities").upsert(
      {
        name: startup.name,
        slug,
        tagline: startup.tagline,
        city: startup.city,
        area: startup.area,
        entity_type: startup.entity_type,
        founders: startup.founders,
        tags: startup.tags,
        lat,
        lng,
        is_verified: true,
        pin_precision: "precise",
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.error(`Failed to insert ${startup.name}:`, error.message);
    } else {
      console.log(`Successfully added ${startup.name} at [${lat}, ${lng}]`);
    }
  }

  console.log("Ingestion complete!");
}

run();
