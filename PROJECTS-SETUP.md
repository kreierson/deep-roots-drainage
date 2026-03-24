# Projects Setup — Storyblok Configuration

## 1. Create the `project` Content Type

In the Storyblok dashboard (app.storyblok.com):

1. Go to **Block Library** (left sidebar)
2. Click **+ New Block**
3. Name: `project`, Type: **Content type block**
4. Add these fields:

| Field Name       | Type         | Notes                          |
|-----------------|--------------|--------------------------------|
| `title`          | Text         | Check "Required"               |
| `summary`        | Text         | Short description for cards    |
| `featured_image` | Asset        | Filter: Images only            |
| `description`    | Richtext     | Full project writeup           |
| `gallery`        | Multi-asset  | Filter: Images only            |
| `location`       | Text         | Optional                       |
| `completion_date`| Text         | Optional (e.g. "Fall 2025")    |

5. Click **Save**

## 2. Create the `projects` Folder

1. Go to **Content** (left sidebar)
2. Click **+ Create new** → **Folder**
3. Name: `projects`, Slug: `projects`
4. Set default content type to `project`

## 3. Add a Project (Test)

1. Inside the `projects/` folder, click **+ Create new** → **Story**
2. Content type: `project`
3. Fill in title, summary, featured image, etc.
4. **Publish** the story

## 4. Update Navigation Label

The header navigation is managed via Storyblok Settings. To rename "Gallery" → "Projects":

1. Go to **Content** → click the **settings** story
2. Find the navigation links
3. Change the label from "Gallery" to "Projects"
4. Change the URL from `/gallery` to `/projects`
5. **Publish**

## 5. Optional: Create `projects_grid` Nestable Block

If you want to embed a projects grid inside other pages:

1. **Block Library** → **+ New Block**
2. Name: `projects_grid`, Type: **Nestable block**
3. Add field: `headline` (Text)
4. Save

Then you can add it as a component on any page.

## What Was Changed in Code

- `src/pages/gallery.astro` → removed (replaced by `src/pages/projects.astro`)
- `src/pages/projects.astro` — lists all project stories
- `src/pages/projects/[slug].astro` — individual project detail pages
- `src/storyblok/Project.astro` — detail view component
- `src/storyblok/ProjectCard.astro` — card for grid listings
- `src/storyblok/ProjectsGrid.astro` — nestable grid block
- `astro.config.mjs` — registered new components
- `src/pages/[...slug].astro` — excludes `projects/*` from catch-all
