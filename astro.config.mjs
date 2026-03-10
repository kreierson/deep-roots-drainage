// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

const env = loadEnv('', process.cwd(), 'STORYBLOK');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    server: {
      https: {
        key: './localhost-key.pem',
        cert: './localhost.pem',
      },
    },
  },
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        page: 'storyblok/Page',
        hero: 'storyblok/Hero',
        services_grid: 'storyblok/ServicesGrid',
        service_card: 'storyblok/ServiceCard',
        text_section: 'storyblok/TextSection',
        cta_banner: 'storyblok/CtaBanner',
        feature_grid: 'storyblok/FeatureGrid',
        feature_card: 'storyblok/FeatureCard',
        contact_form: 'storyblok/ContactForm',
        gallery: 'storyblok/Gallery',
      },
      apiOptions: {
        region: 'us',
      },
    }),
  ],
});
