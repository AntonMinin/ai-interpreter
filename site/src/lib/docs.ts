import type { CollectionEntry } from 'astro:content'

export interface NavEntry {
  slug: string
  title: string
  section: 'start' | 'use' | 'about'
}

/** Sorted sidebar entries with the locale prefix stripped from each id. */
export function docsNav(entries: CollectionEntry<'docs'>[]): NavEntry[] {
  return entries
    .slice()
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      slug: entry.id.replace(/^[a-z]{2}\//, ''),
      title: entry.data.title,
      section: entry.data.section
    }))
}
