/**
 * Delete all existing assets, re-upload fresh images, update all stories
 */
import fs from 'fs'
import path from 'path'

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN
const SPACE = process.env.STORYBLOK_SPACE_ID
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE}`
const headers = { 'Authorization': TOKEN, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const IMG_DIR = path.resolve('tmp-images')

async function apiFetch(urlPath, method = 'GET', body = null) {
  const url = urlPath.startsWith('http') ? urlPath : `${API}${urlPath}`
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(url, opts)
  await sleep(350)
  if (!res.ok && method !== 'DELETE') throw new Error(`${method} ${urlPath} → ${res.status}: ${await res.text()}`)
  if (res.status === 204 || res.headers.get('content-length') === '0') return null
  try { return await res.json() } catch { return null }
}

async function deleteAllAssets() {
  let page = 1
  while (true) {
    const data = await apiFetch(`/assets?per_page=100&page=${page}`)
    if (!data?.assets?.length) break
    for (const asset of data.assets) {
      await apiFetch(`/assets/${asset.id}`, 'DELETE')
    }
    console.log(`  Deleted ${data.assets.length} assets (page ${page})`)
    page++
  }
}

async function uploadImage(filename, alt) {
  const filePath = path.join(IMG_DIR, filename)

  const signed = await apiFetch('/assets', 'POST', { filename, size: '0x0' })
  const assetId = signed.id
  const prettyUrl = `https:${signed.pretty_url}`

  const formData = new FormData()
  for (const [key, value] of Object.entries(signed.fields)) {
    formData.append(key, value)
  }
  formData.append('file', new Blob([fs.readFileSync(filePath)]), filename)

  await fetch(signed.post_url, { method: 'POST', body: formData })
  await sleep(200)

  try { await apiFetch(`/assets/${assetId}/finish_upload`, 'PUT', { id: assetId }) } catch {}
  await sleep(200)

  console.log(`  ✅ ${filename}`)
  return { filename: prettyUrl, alt }
}

async function getStory(slug) {
  const { stories } = await apiFetch(`/stories?with_slug=${slug}`)
  if (!stories[0]) throw new Error(`Story ${slug} not found`)
  const { story } = await apiFetch(`/stories/${stories[0].id}`)
  return story
}

async function updateStory(id, content) {
  await apiFetch(`/stories/${id}`, 'PUT', { story: { content }, publish: 1 })
}

async function run() {
  console.log('\n🗑️  Deleting old assets...\n')
  await deleteAllAssets()

  console.log('\n📸 Uploading fresh images...\n')
  const img = {}

  img.heroHome = await uploadImage('hero-home.jpg', 'Golden farmland at sunset')
  img.heroServices = await uploadImage('hero-services.jpg', 'Autumn farmland landscape')
  img.heroAbout = await uploadImage('hero-about.jpg', 'Green crop rows in field')
  img.heroGallery = await uploadImage('hero-gallery.jpg', 'Wide open farmland')
  img.heroContact = await uploadImage('hero-contact.jpg', 'Agricultural field at dawn')

  img.serviceTile = await uploadImage('service-tile.jpg', 'Agricultural drainage installation')
  img.serviceMains = await uploadImage('service-mains.jpg', 'Large pipe infrastructure')
  img.serviceSurvey = await uploadImage('service-survey.jpg', 'Survey and planning work')
  img.serviceOutlet = await uploadImage('service-outlet.jpg', 'Water flowing through drainage')

  img.yieldField = await uploadImage('yield-field.jpg', 'Healthy wheat field at golden hour')
  img.tractorField = await uploadImage('tractor-field.jpg', 'Tractor working farmland')
  img.soilHealth = await uploadImage('soil-health.jpg', 'Rich agricultural soil close-up')

  img.aboutTeam = await uploadImage('about-team.jpg', 'Professional team at work')
  img.aboutEquipment = await uploadImage('about-equipment.jpg', 'Heavy equipment for drainage')

  img.gallery1 = await uploadImage('gallery-1.jpg', 'Green farmland landscape')
  img.gallery2 = await uploadImage('gallery-2.jpg', 'Rolling wheat fields')
  img.gallery3 = await uploadImage('gallery-3.jpg', 'Farm field at golden hour')
  img.gallery4 = await uploadImage('gallery-4.jpg', 'Waterway through farm country')
  img.gallery5 = await uploadImage('gallery-5.jpg', 'Agricultural landscape')
  img.gallery6 = await uploadImage('gallery-6.jpg', 'Farmland at harvest time')
  img.gallery7 = await uploadImage('gallery-7.jpg', 'Field equipment at work')
  img.gallery8 = await uploadImage('gallery-8.jpg', 'Completed field project')

  const ref = (i) => ({ filename: i.filename, alt: i.alt })

  console.log('\n📝 Updating stories...\n')

  // HOME
  const home = await getStory('home')
  const hb = home.content.body
  const homeHero = hb.find(b => b.component === 'hero')
  if (homeHero) homeHero.background_image = ref(img.heroHome)
  const whyGrid = hb.find(b => b.tagline === 'Why Drain Tile')
  if (whyGrid?.items) {
    whyGrid.items[0].image = ref(img.yieldField)
    whyGrid.items[1].image = ref(img.tractorField)
    whyGrid.items[2].image = ref(img.soilHealth)
  }
  const svcGrid = hb.find(b => b.tagline === 'What We Do')
  if (svcGrid?.items) {
    svcGrid.items[0].image = ref(img.serviceTile)
    svcGrid.items[1].image = ref(img.serviceMains)
    svcGrid.items[2].image = ref(img.serviceOutlet)
    svcGrid.items[3].image = ref(img.serviceSurvey)
  }
  await updateStory(home.id, home.content)
  console.log('  ✅ Home')

  // SERVICES
  const services = await getStory('services')
  const sb = services.content.body
  const svcHero = sb.find(b => b.component === 'hero')
  if (svcHero) svcHero.background_image = ref(img.heroServices)
  const svcCards = sb.find(b => b.component === 'services_grid')
  if (svcCards?.items) {
    svcCards.items[0].image = ref(img.serviceTile)
    svcCards.items[1].image = ref(img.serviceMains)
    svcCards.items[2].image = ref(img.serviceSurvey)
    svcCards.items[3].image = ref(img.serviceOutlet)
  }
  await updateStory(services.id, services.content)
  console.log('  ✅ Services')

  // ABOUT
  const about = await getStory('about')
  const ab = about.content.body
  const aboutHero = ab.find(b => b.component === 'hero')
  if (aboutHero) aboutHero.background_image = ref(img.heroAbout)
  const ts = ab.filter(b => b.component === 'text_section')
  if (ts[0]) ts[0].image = ref(img.aboutTeam)
  if (ts[1]) ts[1].image = ref(img.aboutEquipment)
  await updateStory(about.id, about.content)
  console.log('  ✅ About')

  // GALLERY
  const gallery = await getStory('gallery')
  const gb = gallery.content.body
  const gHero = gb.find(b => b.component === 'hero')
  if (gHero) gHero.background_image = ref(img.heroGallery)
  const gBlock = gb.find(b => b.component === 'gallery')
  if (gBlock) {
    gBlock.images = [ref(img.gallery1), ref(img.gallery2), ref(img.gallery3), ref(img.gallery4),
      ref(img.gallery5), ref(img.gallery6), ref(img.gallery7), ref(img.gallery8)]
  }
  await updateStory(gallery.id, gallery.content)
  console.log('  ✅ Gallery')

  // CONTACT
  const contact = await getStory('contact')
  const cb = contact.content.body
  const cHero = cb.find(b => b.component === 'hero')
  if (cHero) cHero.background_image = ref(img.heroContact)
  await updateStory(contact.id, contact.content)
  console.log('  ✅ Contact')

  console.log('\n🎉 Done! All images replaced.\n')
  fs.rmSync(IMG_DIR, { recursive: true })
}

run().catch(console.error)
