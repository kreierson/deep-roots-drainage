# Decap CMS Migration - Setup Instructions

## ✅ Migration Completed

The Deep Roots Drainage site has been successfully migrated from Storyblok CMS to Decap CMS (formerly Netlify CMS). All content is now stored as markdown and JSON files in the repository.

## 🏗️ New Content Structure

```
src/content/
├── pages/           # Static pages (home, about, services, contact)
├── projects/        # Project case studies  
└── settings/        # Global site settings
```

## 🔐 Netlify Identity Setup Required

To enable content editing through Decap CMS, you need to set up Netlify Identity:

### 1. Create Netlify Site (for Identity only)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Create a new site from Git or drag & drop any folder 
3. **Important**: This Netlify site is ONLY for Identity - the main site stays deployed on Vercel

### 2. Enable Identity & Git Gateway

1. In your Netlify site dashboard → **Identity** tab
2. Click **Enable Identity**
3. Go to **Identity** → **Settings and usage** 
4. **Registration preferences**: Set to "Invite only"
5. **Git Gateway**: Click **Enable Git Gateway**
6. **External providers** (optional): Enable GitHub/Google for easier login

### 3. Configure Site URL

1. In Netlify site settings → **Identity** → **Settings and usage**
2. Add your production domain (e.g., `https://deeprootsdrainage.com`) to **Site's URL**
3. Also add `http://localhost:4321` for local development

### 4. Invite Users

1. **Identity** tab → **Invite users**
2. Add the client's email address
3. They'll receive an invitation email to set up their account

## 🎛️ Content Management

### Accessing Decap CMS

- **Production**: `https://yourdomain.com/admin`
- **Local dev**: `http://localhost:4321/admin`

### Content Organization

**Pages**: Static content for main pages
- Home page sections (hero, stats, testimonials, etc.)
- About page content
- Services offerings
- Contact page

**Projects**: Case study showcase  
- Individual project details
- Before/after photos
- Results and testimonials
- Featured project toggle

**Settings**: Site-wide configuration
- Company information
- Contact details  
- Navigation links
- CTA buttons

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

The site will build successfully without any external API calls - all content is now local.

## 📝 Key Changes Made

✅ **Removed**:
- `@storyblok/astro` package
- Storyblok API integration
- HTTPS development certificates
- All Storyblok component files

✅ **Added**:
- Astro content collections
- Decap CMS configuration
- Content markdown/JSON files
- Netlify Identity widget

✅ **Migrated**:
- All existing content from HTML fallbacks
- Page layouts and styling (unchanged)
- Project showcase functionality
- Navigation and site settings

The site maintains identical design and functionality - only the content management system has changed.

## 🔧 Troubleshooting

**Can't access /admin**: 
- Check Netlify Identity is enabled
- Verify site URL is configured  
- Ensure user is invited to Identity

**Content not saving**:
- Check Git Gateway is enabled
- Verify repository permissions
- Check browser console for errors

**Build issues**:
- Run `npm run build` to test locally
- Check content collection schemas match data

---

The migration is complete and ready for production! The client can now manage all content through the visual Decap CMS interface while maintaining the exact same website appearance and functionality.