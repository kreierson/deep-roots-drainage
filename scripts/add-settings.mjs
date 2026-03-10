/**
 * Create a "Settings" component + story for global site settings (header/footer)
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
  // 1. Create settings component
  console.log('Creating settings component...')
  try {
    await api('/components', 'POST', {
      component: {
        name: 'settings',
        display_name: 'Site Settings',
        is_root: true,
        is_nestable: false,
        schema: {
          tab_company: { type: 'tab', display_name: 'Company Info', pos: 0 },
          company_name: { type: 'text', display_name: 'Company Name', pos: 1, default_value: 'Deep Roots Drainage' },
          tagline: { type: 'text', display_name: 'Tagline', pos: 2 },
          phone: { type: 'text', display_name: 'Phone', pos: 3 },
          email: { type: 'text', display_name: 'Email', pos: 4 },
          location: { type: 'text', display_name: 'Location', pos: 5 },

          tab_footer: { type: 'tab', display_name: 'Footer', pos: 6 },
          footer_description: { type: 'textarea', display_name: 'Footer Description', pos: 7 },
          footer_cta_text: { type: 'text', display_name: 'Footer CTA Button Text', pos: 8 },
          footer_cta_link: { type: 'multilink', display_name: 'Footer CTA Link', pos: 9 },

          tab_nav: { type: 'tab', display_name: 'Navigation', pos: 10 },
          nav_links: { type: 'bloks', display_name: 'Nav Links', restrict_components: true, component_whitelist: ['nav_link'], pos: 11 },
          cta_button_text: { type: 'text', display_name: 'Header CTA Text', pos: 12, default_value: 'Free Estimate' },
          cta_button_link: { type: 'multilink', display_name: 'Header CTA Link', pos: 13 },
        },
      },
    })
    console.log('  ✅ settings component')
  } catch (e) {
    console.log('  ⏭️  settings (already exists)')
  }

  // 2. Create nav_link component
  try {
    await api('/components', 'POST', {
      component: {
        name: 'nav_link',
        display_name: 'Nav Link',
        is_nestable: true,
        schema: {
          label: { type: 'text', display_name: 'Label', pos: 0, required: true },
          link: { type: 'multilink', display_name: 'Link', pos: 1 },
        },
      },
    })
    console.log('  ✅ nav_link component')
  } catch (e) {
    console.log('  ⏭️  nav_link (already exists)')
  }

  // 3. Create settings story
  console.log('\nCreating settings story...')
  try {
    await api('/stories', 'POST', {
      story: {
        name: 'Settings',
        slug: 'settings',
        is_startpage: false,
        content: {
          component: 'settings',
          company_name: 'Deep Roots Drainage',
          tagline: 'Agricultural Drainage Solutions',
          phone: '(701) 555-0123',
          email: 'info@deeprootsdrainage.com',
          location: 'North Dakota',
          footer_description: 'Professional agricultural drain tile installation serving farmers and landowners across North Dakota.',
          footer_cta_text: 'Request a Free Estimate',
          footer_cta_link: { url: '/contact', linktype: 'url' },
          cta_button_text: 'Free Estimate',
          cta_button_link: { url: '/contact', linktype: 'url' },
          nav_links: [
            { component: 'nav_link', label: 'Home', link: { url: '/', linktype: 'url' }, _uid: crypto.randomUUID() },
            { component: 'nav_link', label: 'Services', link: { url: '/services', linktype: 'url' }, _uid: crypto.randomUUID() },
            { component: 'nav_link', label: 'About', link: { url: '/about', linktype: 'url' }, _uid: crypto.randomUUID() },
            { component: 'nav_link', label: 'Gallery', link: { url: '/gallery', linktype: 'url' }, _uid: crypto.randomUUID() },
            { component: 'nav_link', label: 'Contact', link: { url: '/contact', linktype: 'url' }, _uid: crypto.randomUUID() },
          ],
        },
      },
      publish: 1,
    })
    console.log('  ✅ Settings story created and published')
  } catch (e) {
    console.log('  ⏭️  Settings story (already exists)')
  }

  console.log('\n🎉 Done! Settings are now editable in Storyblok.')
}

run().catch(console.error)
