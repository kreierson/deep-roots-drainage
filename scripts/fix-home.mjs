/**
 * Fix the Home story: replace default content with our seeded content + set slug to /
 */

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`
const headers = { 'Authorization': TOKEN, 'Content-Type': 'application/json' }

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`)
  await new Promise(r => setTimeout(r, 350))
  return res.status === 204 ? null : res.json()
}

async function run() {
  // Find the home story
  const { stories } = await api('/stories?with_slug=home')
  const home = stories[0]
  if (!home) { console.error('No home story found'); process.exit(1) }
  
  console.log(`Found Home story (id: ${home.id}), updating...`)

  // Update with our content
  await api(`/stories/${home.id}`, 'PUT', {
    story: {
      name: 'Home',
      slug: 'home',
      path: '/',
      content: {
        component: 'page',
        seo_title: 'Home',
        seo_description: 'Deep Roots Drainage — Professional agricultural drain tile installation for North Dakota farmland.',
        body: [
          {
            component: 'hero',
            tagline: 'Agricultural Drainage Solutions · North Dakota',
            headline: 'Better Drainage. Better Yields.',
            subheadline: 'Professional drain tile installation for North Dakota farmland. Remove excess water, improve soil health, and maximize every acre\'s potential.',
            primary_button_text: 'Get a Free Estimate',
            primary_button_link: { url: '/contact', linktype: 'url' },
            secondary_button_text: 'Our Services',
            secondary_button_link: { url: '/services', linktype: 'url' },
            _uid: crypto.randomUUID(),
          },
          {
            component: 'services_grid',
            tagline: 'Why Drain Tile',
            headline: 'Turn Wet Acres Into Productive Acres',
            subtitle: 'Excess water costs you money every season. Drain tile removes standing water, reduces soil compaction, and gets you in the field earlier.',
            columns: '3',
            background: 'white',
            items: [
              { component: 'service_card', icon: '🌾', title: 'Higher Yields', description: 'Properly drained fields consistently produce 15-30% higher yields. Drain tile pays for itself — often within a few seasons.', _uid: crypto.randomUUID() },
              { component: 'service_card', icon: '🚜', title: 'Earlier Planting', description: 'Get into the field days or weeks earlier in spring. Drained soil warms faster and reaches workable moisture levels sooner.', _uid: crypto.randomUUID() },
              { component: 'service_card', icon: '💧', title: 'Healthier Soil', description: 'Better aeration, reduced compaction, and improved root development. Your soil works harder when it\'s not waterlogged.', _uid: crypto.randomUUID() },
            ],
            _uid: crypto.randomUUID(),
          },
          {
            component: 'services_grid',
            tagline: 'What We Do',
            headline: 'Our Services',
            columns: '2',
            background: 'light',
            items: [
              { component: 'service_card', title: 'Systematic Tile Installation', description: 'GPS-guided pattern tile systems designed for your field\'s specific topography. We handle everything from survey to installation to outlet construction.', _uid: crypto.randomUUID() },
              { component: 'service_card', title: 'Main & Submain Lines', description: 'Large-diameter collector lines that move high volumes of water from your laterals to the outlet. Properly sized for your drainage area.', _uid: crypto.randomUUID() },
              { component: 'service_card', title: 'Outlets & Waterways', description: 'Engineered outlet structures and surface waterways that safely discharge drainage water while meeting all regulatory requirements.', _uid: crypto.randomUUID() },
              { component: 'service_card', title: 'Survey & Design', description: 'Detailed topographic surveys and custom drainage designs using the latest GPS technology. We plan every inch before we break ground.', _uid: crypto.randomUUID() },
            ],
            _uid: crypto.randomUUID(),
          },
          {
            component: 'cta_banner',
            headline: 'Every Wet Season Is Costing You',
            subtitle: 'The ROI on drain tile is one of the best investments you can make in your operation. Let\'s look at your fields and put together a plan.',
            button_text: 'Get Your Free Estimate',
            button_link: { url: '/contact', linktype: 'url' },
            style: 'dark',
            _uid: crypto.randomUUID(),
          },
        ],
      },
    },
    publish: 1,
  })

  console.log('✅ Home story updated and published!')
}

run().catch(console.error)
