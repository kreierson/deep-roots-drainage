/**
 * Setup script: creates all Storyblok component schemas + seeds initial stories
 * 
 * Usage: STORYBLOK_MANAGEMENT_TOKEN=xxx STORYBLOK_SPACE_ID=xxx node scripts/setup-storyblok.mjs
 */

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID

if (!TOKEN || !SPACE_ID) {
  console.error('Set STORYBLOK_MANAGEMENT_TOKEN and STORYBLOK_SPACE_ID')
  process.exit(1)
}

const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`
const headers = {
  'Authorization': TOKEN,
  'Content-Type': 'application/json',
}

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  }
  // Rate limit: Storyblok allows 3 req/sec on management API
  await new Promise(r => setTimeout(r, 350))
  return res.status === 204 ? null : res.json()
}

// ── Component Definitions ──────────────────────────────────────────

const components = [
  {
    name: 'page',
    display_name: 'Page',
    is_root: true,
    is_nestable: false,
    schema: {
      body: { type: 'bloks', display_name: 'Body', pos: 0 },
      seo_title: { type: 'text', display_name: 'SEO Title', pos: 1 },
      seo_description: { type: 'text', display_name: 'SEO Description', pos: 2 },
    },
  },
  {
    name: 'hero',
    display_name: 'Hero Banner',
    is_nestable: true,
    schema: {
      tagline: { type: 'text', display_name: 'Tagline', pos: 0 },
      headline: { type: 'text', display_name: 'Headline', pos: 1, required: true },
      subheadline: { type: 'textarea', display_name: 'Subheadline', pos: 2 },
      primary_button_text: { type: 'text', display_name: 'Primary Button Text', pos: 3 },
      primary_button_link: { type: 'multilink', display_name: 'Primary Button Link', pos: 4 },
      secondary_button_text: { type: 'text', display_name: 'Secondary Button Text', pos: 5 },
      secondary_button_link: { type: 'multilink', display_name: 'Secondary Button Link', pos: 6 },
      background_image: { type: 'asset', display_name: 'Background Image', filetypes: ['images'], pos: 7 },
    },
  },
  {
    name: 'text_section',
    display_name: 'Text Section',
    is_nestable: true,
    schema: {
      tagline: { type: 'text', display_name: 'Tagline', pos: 0 },
      headline: { type: 'text', display_name: 'Headline', pos: 1 },
      subtitle: { type: 'textarea', display_name: 'Subtitle', pos: 2 },
      content: { type: 'richtext', display_name: 'Content', pos: 3 },
      image: { type: 'asset', display_name: 'Image', filetypes: ['images'], pos: 4 },
      background: { type: 'option', display_name: 'Background', pos: 5, options: [{ name: 'White', value: 'white' }, { name: 'Light', value: 'light' }], default_value: 'white' },
      narrow: { type: 'boolean', display_name: 'Narrow Width', pos: 6 },
    },
  },
  {
    name: 'services_grid',
    display_name: 'Services Grid',
    is_nestable: true,
    schema: {
      tagline: { type: 'text', display_name: 'Tagline', pos: 0 },
      headline: { type: 'text', display_name: 'Headline', pos: 1 },
      subtitle: { type: 'textarea', display_name: 'Subtitle', pos: 2 },
      items: { type: 'bloks', display_name: 'Service Cards', restrict_type: '', restrict_components: true, component_whitelist: ['service_card'], pos: 3 },
      columns: { type: 'option', display_name: 'Columns', pos: 4, options: [{ name: '2', value: '2' }, { name: '3', value: '3' }, { name: '4', value: '4' }], default_value: '3' },
      background: { type: 'option', display_name: 'Background', pos: 5, options: [{ name: 'White', value: 'white' }, { name: 'Light', value: 'light' }], default_value: 'white' },
    },
  },
  {
    name: 'service_card',
    display_name: 'Service Card',
    is_nestable: true,
    schema: {
      title: { type: 'text', display_name: 'Title', pos: 0, required: true },
      description: { type: 'textarea', display_name: 'Description', pos: 1 },
      icon: { type: 'text', display_name: 'Icon (emoji)', pos: 2 },
      image: { type: 'asset', display_name: 'Image', filetypes: ['images'], pos: 3 },
      features: { type: 'textarea', display_name: 'Features (one per line)', pos: 4 },
    },
  },
  {
    name: 'cta_banner',
    display_name: 'CTA Banner',
    is_nestable: true,
    schema: {
      headline: { type: 'text', display_name: 'Headline', pos: 0, required: true },
      subtitle: { type: 'textarea', display_name: 'Subtitle', pos: 1 },
      button_text: { type: 'text', display_name: 'Button Text', pos: 2 },
      button_link: { type: 'multilink', display_name: 'Button Link', pos: 3 },
      style: { type: 'option', display_name: 'Style', pos: 4, options: [{ name: 'Dark (green)', value: 'dark' }, { name: 'Light', value: 'light' }], default_value: 'dark' },
    },
  },
  {
    name: 'feature_grid',
    display_name: 'Feature Grid',
    is_nestable: true,
    schema: {
      headline: { type: 'text', display_name: 'Headline', pos: 0 },
      items: { type: 'bloks', display_name: 'Feature Cards', restrict_components: true, component_whitelist: ['feature_card'], pos: 1 },
    },
  },
  {
    name: 'feature_card',
    display_name: 'Feature Card',
    is_nestable: true,
    schema: {
      title: { type: 'text', display_name: 'Title', pos: 0, required: true },
      description: { type: 'textarea', display_name: 'Description', pos: 1 },
    },
  },
  {
    name: 'contact_form',
    display_name: 'Contact Form',
    is_nestable: true,
    schema: {
      button_text: { type: 'text', display_name: 'Submit Button Text', pos: 0, default_value: 'Request Free Estimate' },
      phone: { type: 'text', display_name: 'Phone Number', pos: 1 },
      email: { type: 'text', display_name: 'Email', pos: 2 },
      location: { type: 'text', display_name: 'Location Text', pos: 3 },
    },
  },
  {
    name: 'gallery',
    display_name: 'Photo Gallery',
    is_nestable: true,
    schema: {
      headline: { type: 'text', display_name: 'Headline', pos: 0 },
      images: { type: 'multi_asset', display_name: 'Images', filetypes: ['images'], pos: 1 },
    },
  },
]

// ── Story Seeds (existing page content) ────────────────────────────

const stories = [
  {
    name: 'Home',
    slug: 'home',
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
          primary_button_link: { cached_url: '/contact', linktype: 'url' },
          secondary_button_text: 'Our Services',
          secondary_button_link: { cached_url: '/services', linktype: 'url' },
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
            {
              component: 'service_card',
              icon: '🌾',
              title: 'Higher Yields',
              description: 'Properly drained fields consistently produce 15-30% higher yields. Drain tile pays for itself — often within a few seasons.',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              icon: '🚜',
              title: 'Earlier Planting',
              description: 'Get into the field days or weeks earlier in spring. Drained soil warms faster and reaches workable moisture levels sooner.',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              icon: '💧',
              title: 'Healthier Soil',
              description: 'Better aeration, reduced compaction, and improved root development. Your soil works harder when it\'s not waterlogged.',
              _uid: crypto.randomUUID(),
            },
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
            {
              component: 'service_card',
              title: 'Systematic Tile Installation',
              description: 'GPS-guided pattern tile systems designed for your field\'s specific topography. We handle everything from survey to installation to outlet construction.',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              title: 'Main & Submain Lines',
              description: 'Large-diameter collector lines that move high volumes of water from your laterals to the outlet. Properly sized for your drainage area.',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              title: 'Outlets & Waterways',
              description: 'Engineered outlet structures and surface waterways that safely discharge drainage water while meeting all regulatory requirements.',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              title: 'Survey & Design',
              description: 'Detailed topographic surveys and custom drainage designs using the latest GPS technology. We plan every inch before we break ground.',
              _uid: crypto.randomUUID(),
            },
          ],
          _uid: crypto.randomUUID(),
        },
        {
          component: 'cta_banner',
          headline: 'Every Wet Season Is Costing You',
          subtitle: 'The ROI on drain tile is one of the best investments you can make in your operation. Let\'s look at your fields and put together a plan.',
          button_text: 'Get Your Free Estimate',
          button_link: { cached_url: '/contact', linktype: 'url' },
          style: 'dark',
          _uid: crypto.randomUUID(),
        },
      ],
    },
  },
  {
    name: 'Services',
    slug: 'services',
    content: {
      component: 'page',
      seo_title: 'Services',
      seo_description: 'Agricultural drain tile installation, survey & design, and drainage solutions for North Dakota farmland.',
      body: [
        {
          component: 'hero',
          tagline: 'What We Offer',
          headline: 'Our Services',
          subheadline: 'Complete agricultural drainage solutions — from initial survey to final installation. We work with your land, your budget, and your timeline.',
          _uid: crypto.randomUUID(),
        },
        {
          component: 'services_grid',
          columns: '2',
          background: 'white',
          items: [
            {
              component: 'service_card',
              title: 'Pattern Tile Systems',
              description: 'Systematic tile patterns designed for uniform drainage across your entire field. GPS-guided installation ensures precise depth and grade for optimal water removal.',
              features: 'GPS-guided plow installation\nCustom spacing based on soil type\n4" corrugated lateral lines\nGrade control for consistent flow',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              title: 'Mains & Submains',
              description: 'The backbone of your drainage system. We install large-diameter collector lines (6" to 15"+) that gather water from your laterals and move it to the outlet efficiently.',
              features: '6" - 15"+ diameter pipe\nCapacity-matched to drainage area\nProper junction connections\nEngineered for long-term performance',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              title: 'Survey & Design',
              description: 'Every good drainage project starts with good data. We conduct detailed topographic surveys using RTK GPS to map every contour of your fields.',
              features: 'RTK GPS topographic surveys\nCustom drainage design & maps\nSoil analysis consideration\nPhased installation planning',
              _uid: crypto.randomUUID(),
            },
            {
              component: 'service_card',
              title: 'Outlets & Structures',
              description: 'Properly built outlets are critical to system longevity and regulatory compliance. We construct durable outlet structures and ensure all discharge meets requirements.',
              features: 'Outlet structure construction\nRisers & cleanout access points\nErosion control at discharge\nDrainage board compliance',
              _uid: crypto.randomUUID(),
            },
          ],
          _uid: crypto.randomUUID(),
        },
        {
          component: 'cta_banner',
          headline: 'Ready to Improve Your Land?',
          subtitle: 'We\'ll survey your fields, design a drainage plan, and give you an honest quote. No pressure, no obligation.',
          button_text: 'Request a Free Estimate',
          button_link: { cached_url: '/contact', linktype: 'url' },
          style: 'light',
          _uid: crypto.randomUUID(),
        },
      ],
    },
  },
  {
    name: 'About',
    slug: 'about',
    content: {
      component: 'page',
      seo_title: 'About',
      seo_description: 'Learn about Deep Roots Drainage — agricultural drain tile experts serving North Dakota farmers and landowners.',
      body: [
        {
          component: 'hero',
          tagline: 'Who We Are',
          headline: 'About Deep Roots',
          _uid: crypto.randomUUID(),
        },
        {
          component: 'text_section',
          headline: '',
          content: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Deep Roots Drainage is a North Dakota drain tile company built by people who understand the land. We know what wet fields cost you — lost acres, late planting, and years of frustration. We\'re here to fix that.' }] },
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Our Approach' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'We don\'t believe in one-size-fits-all drainage. Every field is different — different soil, different topography, different challenges. We survey your land, study the data, and design a system that actually solves your specific water problems. Then we install it right the first time.' }] },
            ],
          },
          narrow: true,
          background: 'white',
          _uid: crypto.randomUUID(),
        },
        {
          component: 'feature_grid',
          headline: 'What Sets Us Apart',
          items: [
            { component: 'feature_card', title: 'Precision GPS', description: 'RTK-guided equipment ensures exact depth and grade on every foot of tile we install.', _uid: crypto.randomUUID() },
            { component: 'feature_card', title: 'Honest Pricing', description: 'Straightforward per-foot pricing. No hidden costs, no surprises when the bill comes.', _uid: crypto.randomUUID() },
            { component: 'feature_card', title: 'Local Knowledge', description: 'We know North Dakota soils — the clay, the black dirt, the sand. We design for what\'s actually under your fields.', _uid: crypto.randomUUID() },
            { component: 'feature_card', title: 'Quality Materials', description: 'We use heavy-duty corrugated pipe and proper fittings. Your tile system should last generations, not just years.', _uid: crypto.randomUUID() },
          ],
          _uid: crypto.randomUUID(),
        },
        {
          component: 'text_section',
          headline: 'Our Equipment',
          content: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'We run modern tile plows with RTK GPS grade control, allowing us to install tile at precise depths and grades even across complex terrain. Our equipment is sized to handle everything from small targeted runs to full-section pattern tile projects.' }] },
            ],
          },
          narrow: true,
          background: 'white',
          _uid: crypto.randomUUID(),
        },
      ],
    },
  },
  {
    name: 'Gallery',
    slug: 'gallery',
    content: {
      component: 'page',
      seo_title: 'Gallery',
      seo_description: 'See our agricultural drain tile projects across North Dakota.',
      body: [
        {
          component: 'hero',
          tagline: 'Our Work',
          headline: 'Project Gallery',
          subheadline: 'Real fields. Real results.',
          _uid: crypto.randomUUID(),
        },
        {
          component: 'gallery',
          headline: '',
          images: [],
          _uid: crypto.randomUUID(),
        },
      ],
    },
  },
  {
    name: 'Contact',
    slug: 'contact',
    content: {
      component: 'page',
      seo_title: 'Contact',
      seo_description: 'Get a free drain tile estimate from Deep Roots Drainage. Serving farmers and landowners across North Dakota.',
      body: [
        {
          component: 'hero',
          tagline: "Let's Talk",
          headline: 'Get Your Free Estimate',
          subheadline: "Tell us about your land and we'll get back to you within 24 hours.",
          _uid: crypto.randomUUID(),
        },
        {
          component: 'contact_form',
          button_text: 'Request Free Estimate',
          phone: '(701) 555-0123',
          email: 'info@deeprootsdrainage.com',
          location: 'Serving All of North Dakota',
          _uid: crypto.randomUUID(),
        },
      ],
    },
  },
]

// ── Run ────────────────────────────────────────────────────────────

async function run() {
  // 1. Create components
  console.log('\n📦 Creating components...\n')
  for (const comp of components) {
    try {
      const res = await api('/components', 'POST', { component: comp })
      console.log(`  ✅ ${comp.display_name}`)
    } catch (e) {
      if (e.message.includes('422')) {
        console.log(`  ⏭️  ${comp.display_name} (already exists)`)
      } else {
        console.error(`  ❌ ${comp.display_name}: ${e.message}`)
      }
    }
  }

  // 2. Create stories
  console.log('\n📝 Creating stories...\n')
  for (const story of stories) {
    try {
      await api('/stories', 'POST', {
        story: {
          name: story.name,
          slug: story.slug,
          content: story.content,
        },
        publish: 1,
      })
      console.log(`  ✅ ${story.name} (/${story.slug})`)
    } catch (e) {
      if (e.message.includes('422')) {
        console.log(`  ⏭️  ${story.name} (already exists)`)
      } else {
        console.error(`  ❌ ${story.name}: ${e.message}`)
      }
    }
  }

  console.log('\n🎉 Done! Your Storyblok space is ready.\n')
  console.log('Next steps:')
  console.log('  1. Go to app.storyblok.com and check your stories')
  console.log('  2. Set Visual Editor URL to http://localhost:4321/')
  console.log('  3. Start editing content visually!\n')
}

run().catch(console.error)
