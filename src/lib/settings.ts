import { useStoryblokApi } from '@storyblok/astro'

let _cache: any = null

export async function getSettings() {
  if (_cache) return _cache

  try {
    const api = useStoryblokApi()
    const { data } = await api.get('cdn/stories/settings', {
      version: import.meta.env.DEV ? 'draft' : 'published',
    })
    _cache = data.story.content
    return _cache
  } catch (e) {
    // Fallback if settings story doesn't exist yet
    return {
      company_name: 'Deep Roots Drainage',
      tagline: 'Agricultural Drainage Solutions',
      phone: '(701) 555-0123',
      email: 'info@deeprootsdrainage.com',
      location: 'North Dakota',
      footer_description: 'Professional agricultural drain tile installation serving farmers and landowners across North Dakota.',
      footer_cta_text: 'Request a Free Estimate',
      footer_cta_link: { url: '/contact' },
      cta_button_text: 'Free Estimate',
      cta_button_link: { url: '/contact' },
      nav_links: [
        { label: 'Home', link: { url: '/' } },
        { label: 'Services', link: { url: '/services' } },
        { label: 'About', link: { url: '/about' } },
        { label: 'Gallery', link: { url: '/gallery' } },
        { label: 'Contact', link: { url: '/contact' } },
      ],
    }
  }
}
