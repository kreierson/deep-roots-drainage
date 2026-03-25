import { getEntry } from 'astro:content'

let _cache: any = null

export async function getSettings() {
  if (_cache) return _cache

  try {
    const settings = await getEntry('settings', 'global')
    _cache = settings.data
    return _cache
  } catch (e) {
    // Fallback if settings don't exist yet
    console.error('Failed to load settings:', e)
    return {
      company_name: 'Deep Roots Drainage',
      tagline: 'Agricultural Drainage Solutions',
      phone: '(701) 555-0123',
      email: 'info@deeprootsdrainage.com',
      location: 'North Dakota',
      footer_description: 'Professional agricultural drain tile installation serving farmers and landowners across North Dakota.',
      footer_cta_text: 'Request a Free Estimate',
      footer_cta_link: '/contact',
      cta_button_text: 'Free Estimate',
      cta_button_link: '/contact',
      nav_links: [
        { label: 'Home', url: '/' },
        { label: 'Services', url: '/services' },
        { label: 'About', url: '/about' },
        { label: 'Projects', url: '/projects' },
        { label: 'Contact', url: '/contact' },
      ],
    }
  }
}
