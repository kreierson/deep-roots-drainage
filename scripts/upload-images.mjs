/**
 * Upload images to Storyblok asset manager, then update all stories with image references
 */
import fs from 'fs'
import path from 'path'

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN
const SPACE = process.env.STORYBLOK_SPACE_ID
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE}`
const headers = { 'Authorization': TOKEN, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

const IMG_DIR = path.resolve('tmp-images')

async function apiJson(url, method = 'GET', body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(url.startsWith('http') ? url : `${API}${url}`, opts)
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${await res.text()}`)
  await sleep(400)
  return res.json()
}

async function uploadImage(filename, alt) {
  const filePath = path.join(IMG_DIR, filename)

  // Step 1: Request a signed upload URL
  const signed = await apiJson('/assets', 'POST', { filename, size: '0x0' })

  const assetId = signed.id
  const postUrl = signed.post_url
  const fields = signed.fields
  const prettyUrl = `https:${signed.pretty_url}`

  // Step 2: Upload the file
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value)
  }
  formData.append('file', new Blob([fs.readFileSync(filePath)]), filename)

  const uploadRes = await fetch(postUrl, { method: 'POST', body: formData })
  if (!uploadRes.ok && uploadRes.status !== 204) {
    throw new Error(`Upload failed for ${filename}: ${uploadRes.status}`)
  }

  await sleep(300)

  // Step 3: Finalize
  try {
    await fetch(`${API}/assets/${assetId}/finish_upload`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id: assetId }),
    })
  } catch (e) { /* sometimes returns empty */ }

  await sleep(300)

  console.log(`  ✅ ${filename}`)
  return { filename: prettyUrl, alt, id: assetId }
}

async function getStory(slug) {
  const { stories } = await apiJson(`/stories?with_slug=${slug}`)
  if (!stories[0]) throw new Error(`Story ${slug} not found`)
  const { story } = await apiJson(`/stories/${stories[0].id}`)
  return story
}

async function updateStory(id, content) {
  await apiJson(`/stories/${id}`, 'PUT', { story: { content }, publish: 1 })
}

async function run() {
  const img = {}

  console.log('\n📸 Uploading images to Storyblok...\n')

  img.heroHome = await uploadImage('hero-home.jpg', 'Golden wheat field at sunset')
  img.heroServices = await uploadImage('hero-services.jpg', 'Agricultural field with drainage')
  img.heroAbout = await uploadImage('hero-about.jpg', 'Green farmland aerial view')
  img.heroGallery = await uploadImage('hero-gallery.jpg', 'Expansive farmland landscape')
  img.heroContact = await uploadImage('hero-contact.jpg', 'Rolling farm fields')

  img.serviceTile = await uploadImage('service-tile.jpg', 'Drain tile installation in field')
  img.serviceMains = await uploadImage('service-mains.jpg', 'Main drainage line construction')
  img.serviceSurvey = await uploadImage('service-survey.jpg', 'GPS survey and field mapping')
  img.serviceOutlet = await uploadImage('service-outlet.jpg', 'Drainage outlet structure')

  img.yieldField = await uploadImage('yield-field.jpg', 'High-yield crop field')
  img.tractorField = await uploadImage('tractor-field.jpg', 'Tractor working in field')
  img.soilHealth = await uploadImage('soil-health.jpg', 'Healthy agricultural soil')

  img.aboutTeam = await uploadImage('about-team.jpg', 'Deep Roots Drainage team')
  img.aboutEquipment = await uploadImage('about-equipment.jpg', 'Professional drainage equipment')

  img.gallery1 = await uploadImage('gallery-1.jpg', 'Open farmland ready for drainage')
  img.gallery2 = await uploadImage('gallery-2.jpg', 'Agricultural field at golden hour')
  img.gallery3 = await uploadImage('gallery-3.jpg', 'Waterway through farmland')
  img.gallery4 = await uploadImage('gallery-4.jpg', 'Wheat field drainage project')
  img.gallery5 = await uploadImage('gallery-5.jpg', 'Farm field with crop rows')
  img.gallery6 = await uploadImage('gallery-6.jpg', 'North Dakota landscape')
  img.gallery7 = await uploadImage('gallery-7.jpg', 'Farm equipment in field')
  img.gallery8 = await uploadImage('gallery-8.jpg', 'Completed drainage project aerial')

  console.log('\n📝 Updating stories with images...\n')

  // Helper
  const assetRef = (i) => ({ filename: i.filename, alt: i.alt })

  // ── HOME ──
  const home = await getStory('home')
  const hb = home.content.body

  const homeHero = hb.find(b => b.component === 'hero')
  if (homeHero) homeHero.background_image = assetRef(img.heroHome)

  const whyGrid = hb.find(b => b.component === 'services_grid' && b.tagline === 'Why Drain Tile')
  if (whyGrid?.items) {
    whyGrid.items[0].image = assetRef(img.yieldField)
    whyGrid.items[1].image = assetRef(img.tractorField)
    whyGrid.items[2].image = assetRef(img.soilHealth)
  }

  const svcGrid = hb.find(b => b.component === 'services_grid' && b.tagline === 'What We Do')
  if (svcGrid?.items) {
    svcGrid.items[0].image = assetRef(img.serviceTile)
    svcGrid.items[1].image = assetRef(img.serviceMains)
    svcGrid.items[2].image = assetRef(img.serviceOutlet)
    svcGrid.items[3].image = assetRef(img.serviceSurvey)
  }

  await updateStory(home.id, home.content)
  console.log('  ✅ Home')

  // ── SERVICES ──
  const services = await getStory('services')
  const sb = services.content.body

  const svcHero = sb.find(b => b.component === 'hero')
  if (svcHero) svcHero.background_image = assetRef(img.heroServices)

  const svcCards = sb.find(b => b.component === 'services_grid')
  if (svcCards?.items) {
    svcCards.items[0].image = assetRef(img.serviceTile)
    svcCards.items[1].image = assetRef(img.serviceMains)
    svcCards.items[2].image = assetRef(img.serviceSurvey)
    svcCards.items[3].image = assetRef(img.serviceOutlet)
  }

  await updateStory(services.id, services.content)
  console.log('  ✅ Services')

  // ── ABOUT ──
  const about = await getStory('about')
  const ab = about.content.body

  const aboutHero = ab.find(b => b.component === 'hero')
  if (aboutHero) aboutHero.background_image = assetRef(img.heroAbout)

  const textSections = ab.filter(b => b.component === 'text_section')
  if (textSections[0]) textSections[0].image = assetRef(img.aboutTeam)
  if (textSections[1]) textSections[1].image = assetRef(img.aboutEquipment)

  await updateStory(about.id, about.content)
  console.log('  ✅ About')

  // ── GALLERY ──
  const gallery = await getStory('gallery')
  const gb = gallery.content.body

  const galleryHero = gb.find(b => b.component === 'hero')
  if (galleryHero) galleryHero.background_image = assetRef(img.heroGallery)

  const galleryBlock = gb.find(b => b.component === 'gallery')
  if (galleryBlock) {
    galleryBlock.images = [
      assetRef(img.gallery1), assetRef(img.gallery2), assetRef(img.gallery3), assetRef(img.gallery4),
      assetRef(img.gallery5), assetRef(img.gallery6), assetRef(img.gallery7), assetRef(img.gallery8),
    ]
  }

  await updateStory(gallery.id, gallery.content)
  console.log('  ✅ Gallery')

  // ── CONTACT ──
  const contact = await getStory('contact')
  const cb = contact.content.body

  const contactHero = cb.find(b => b.component === 'hero')
  if (contactHero) contactHero.background_image = assetRef(img.heroContact)

  await updateStory(contact.id, contact.content)
  console.log('  ✅ Contact')

  console.log('\n🎉 All images uploaded and stories updated!\n')

  // Cleanup
  fs.rmSync(IMG_DIR, { recursive: true })
  console.log('Temp images cleaned up.')
}

run().catch(console.error)
