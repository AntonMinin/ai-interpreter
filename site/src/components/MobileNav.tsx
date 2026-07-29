import { useEffect, useRef, useState } from 'preact/hooks'

interface Link {
  href: string
  label: string
  external?: boolean
}

interface Props {
  links: Link[]
  openLabel: string
  closeLabel: string
  downloadLabel: string
  downloadHref: string
}

export default function MobileNav({
  links,
  openLabel,
  closeLabel,
  downloadLabel,
  downloadHref
}: Props) {
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    panel.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div class="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? closeLabel : openLabel}
        class="rounded-lg border border-edge p-2 text-muted transition-colors hover:text-fg"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          ref={panel}
          class="absolute inset-x-0 top-16 border-b border-edge bg-ink px-4 pb-5 pt-2 shadow-xl"
        >
          <nav class="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                class="border-b border-edge/60 py-3 text-fg transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            ))}
            <a
              href={downloadHref}
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 rounded-lg border border-accent bg-accent-dim px-4 py-2.5 text-center font-semibold text-white"
            >
              {downloadLabel}
            </a>
          </nav>
        </div>
      )}
    </div>
  )
}
