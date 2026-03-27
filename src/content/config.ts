import { defineCollection, z } from 'astro:content';

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    hero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
      image: z.string(),
      image_alt: z.string(),
      primary_button: z.object({
        text: z.string(),
        url: z.string()
      }).optional(),
      secondary_button: z.object({
        text: z.string(),
        url: z.string()
      }).optional()
    }).optional(),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).optional(),
    before_after: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
      before_image: z.string(),
      before_image_alt: z.string(),
      before_title: z.string(),
      before_description: z.string(),
      after_image: z.string(),
      after_image_alt: z.string(),
      after_title: z.string(),
      after_description: z.string()
    }).optional(),
    how_it_works: z.object({
      eyebrow: z.string(),
      title: z.string(),
      image: z.string(),
      image_alt: z.string(),
      steps: z.array(z.object({
        title: z.string(),
        description: z.string()
      }))
    }).optional(),
    social_proof: z.object({
      eyebrow: z.string(),
      title: z.string(),
      stats: z.array(z.object({
        value: z.string(),
        label: z.string()
      }))
    }).optional(),
    testimonials: z.object({
      eyebrow: z.string(),
      title: z.string(),
      items: z.array(z.object({
        quote: z.string(),
        name: z.string(),
        location: z.string()
      }))
    }).optional(),
    cta: z.object({
      title: z.string(),
      description: z.string(),
      button_text: z.string(),
      button_url: z.string(),
      image: z.string().optional(),
      image_alt: z.string().optional()
    }).optional(),
    services: z.array(z.object({
      title: z.string(),
      description: z.string(),
      image: z.string(),
      image_alt: z.string(),
      features: z.array(z.string()).optional()
    })).optional(),
    features_title: z.string().optional(),
    features: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      image: z.string().optional(),
      image_alt: z.string().optional()
    })).optional(),
    contact_info: z.object({
      phone: z.string(),
      phone_note: z.string(),
      email: z.string(),
      email_note: z.string(),
      location: z.string(),
      location_note: z.string(),
    }).optional(),
    steps: z.array(z.string()).optional(),
    planning_ahead: z.object({
      title: z.string(),
      description: z.string(),
    }).optional(),
    service_options: z.array(z.string()).optional(),
    no_openings_title: z.string().optional(),
    no_openings_text: z.string().optional(),
    bottom_cta_title: z.string().optional(),
    bottom_cta_text: z.string().optional()
  })
});

const careersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    location: z.string(),
    type: z.string(),
    posted_date: z.coerce.date(),
    active: z.boolean().default(true)
  })
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    location: z.string(),
    acres: z.number(),
    year: z.number(),
    featured_image: z.string(),
    featured_image_alt: z.string(),
    gallery: z.array(z.object({
      image: z.string(),
      alt: z.string(),
      caption: z.string().optional()
    })).optional(),
    results: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).optional(),
    testimonial: z.object({
      quote: z.string(),
      author: z.string()
    }).optional(),
    featured: z.boolean().default(false)
  })
});

const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    company_name: z.string(),
    tagline: z.string(),
    phone: z.string(),
    email: z.string(),
    location: z.string(),
    footer_description: z.string(),
    footer_cta_text: z.string(),
    footer_cta_link: z.string(),
    cta_button_text: z.string(),
    cta_button_link: z.string(),
    nav_links: z.array(z.object({
      label: z.string(),
      url: z.string()
    }))
  })
});

export const collections = {
  'pages': pagesCollection,
  'projects': projectsCollection,
  'careers': careersCollection,
  'settings': settingsCollection
};