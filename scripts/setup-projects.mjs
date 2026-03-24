/**
 * Setup script: creates the 'project' component + 'projects' folder in Storyblok
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
  await new Promise(r => setTimeout(r, 350))
  return res.status === 204 ? null : res.json()
}

async function main() {
  // 1. Create 'project' component
  console.log('Creating project component...')
  try {
    const comp = await api('/components', 'POST', {
      component: {
        name: 'project',
        display_name: 'Project',
        is_root: true,
        is_nestable: false,
        schema: {
          title: { type: 'text', pos: 0, required: true, display_name: 'Title' },
          summary: { type: 'text', pos: 1, display_name: 'Summary' },
          featured_image: { type: 'asset', pos: 2, filetypes: ['images'], display_name: 'Featured Image' },
          description: { type: 'richtext', pos: 3, display_name: 'Description' },
          gallery: { type: 'multiasset', pos: 4, filetypes: ['images'], display_name: 'Photo Gallery' },
          location: { type: 'text', pos: 5, display_name: 'Location' },
          completion_date: { type: 'text', pos: 6, display_name: 'Completion Date' },
        },
      },
    })
    console.log(`  ✅ Created component: ${comp.component.name} (id: ${comp.component.id})`)
  } catch (e) {
    if (e.message.includes('422')) {
      console.log('  ⚠️  Component "project" may already exist, skipping...')
    } else {
      throw e
    }
  }

  // 2. Create 'projects' folder
  console.log('Creating projects folder...')
  try {
    const folder = await api('/stories', 'POST', {
      story: {
        name: 'Projects',
        slug: 'projects',
        is_folder: true,
        default_root: 'project',
      },
    })
    console.log(`  ✅ Created folder: ${folder.story.slug} (id: ${folder.story.id})`)
  } catch (e) {
    if (e.message.includes('422')) {
      console.log('  ⚠️  Folder "projects" may already exist, skipping...')
    } else {
      throw e
    }
  }

  // 3. Update nav: change Gallery → Projects in settings
  console.log('Updating navigation label...')
  try {
    // Find settings story
    const { stories } = await api('/stories?with_slug=settings')
    if (stories.length > 0) {
      const settingsId = stories[0].id
      const { story } = await api(`/stories/${settingsId}`)
      
      // Update nav links
      if (story.content.nav_links) {
        let updated = false
        for (const link of story.content.nav_links) {
          if (link.label && link.label.toLowerCase() === 'gallery') {
            link.label = 'Projects'
            if (link.link) {
              link.link.url = '/projects'
              link.link.cached_url = 'projects'
            }
            updated = true
          }
        }
        if (updated) {
          await api(`/stories/${settingsId}`, 'PUT', {
            story: {
              content: story.content,
            },
            publish: 1,
          })
          console.log('  ✅ Updated nav: Gallery → Projects')
        } else {
          console.log('  ⚠️  No "Gallery" nav link found to rename')
        }
      }
    } else {
      console.log('  ⚠️  No settings story found')
    }
  } catch (e) {
    console.log(`  ⚠️  Could not update nav: ${e.message}`)
  }

  console.log('\n🎉 Done! Project content type and folder are ready in Storyblok.')
  console.log('  1. Go to app.storyblok.com → Content → Projects folder')
  console.log('  2. Create new stories using the "Project" content type')
  console.log('  3. Fill in title, summary, featured image, description, gallery')
  console.log('  4. Publish and rebuild the site')
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
