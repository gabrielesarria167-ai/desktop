# Design guidelines

How Liner looks and moves, and why. Read this before a UI change. The code rules in
[AGENTS.md](../AGENTS.md) still apply: Tailwind v4, `cn()` for conditional classes, theme
tokens instead of raw hex, shared primitives from `@/shared/ui`.

## Principles

1. **Content is the colour.** The cover art drives the colour of the screen through the
   page backdrop and the fullscreen Kawarp background. The chrome stays neutral: white or
   black at low alpha on top of whatever the cover gives.
2. **Glass, not boxes.** Surfaces are translucent tints with blur, not opaque grey panels.
   You should still feel the page under a menu, a toast or an overlay.
3. **The target is the thing.** When the user does something to a place, make that place
   respond. Do not draw a small box that says "here". The drag-and-drop overlay below is
   the reference example.
4. **Calm motion.** Short fades, soft springs, one easing curve. Loops are slow and quiet.
5. **Nothing new for one call site.** Reuse the hero, the glass button, the dropdown, the
   toast. If a pattern is missing, add it to `@/shared/ui` and use it everywhere.

## Tokens

Use the theme tokens from `src/app/globals.css`. They switch with the theme.

| Use                                | Token                                                                 |
| ---------------------------------- | --------------------------------------------------------------------- |
| Text                               | `text-text-primary`, `text-text-secondary`, `text-text-tertiary`      |
| Raised surfaces (toasts, popovers) | `bg-bg-elevated`, `bg-bg-panel`                                       |
| Hairlines and quiet fills          | `border-alpha-14`, `border-alpha-33` (as `bg-`, `text-` or `border-`) |
| Accent                             | `accent-primary` (liked heart, active state)                          |

Glass tints (the same everywhere, so chips and buttons read as one surface):

- Glass fill: `bg-black/[0.05] dark:bg-white/[0.09]` (`HERO_GLASS_CLASS`)
- Glass button: `HERO_GLASS_BUTTON_CLASS`, hover goes to `0.09` / `0.16`
- List panel under a hero: `bg-black/[0.03] dark:bg-white/[0.04]` with `backdrop-blur-xl`,
  dropped when `useClassicSurfaces()` is on

## Type

- SF Pro everywhere (`font-family: var(--font-inter)`, which now holds the SF Pro stack),
  SF Pro Display for section headings (`var(--font-roboto-flex)`), Montserrat only in the player.
- Hero title: `HERO_TITLE_CLASS` (30px heading font). Hero subtitle: `HERO_SUBTITLE_CLASS` (18px).
- Body and list rows: 14px / 500 for titles, 13px tertiary for the second line.
- Toast: 13px / 600 message, 12.5px tertiary description after a `·`.

## Shape

- Radii in use: 4, 6, 8, 9, 10, 12, 14, 16, 18, 20px. Pick the one the neighbours use.
- Buttons and chips in a hero: 9px. Dropdown menu: 11px with 8px items. Toast: 12px.
  Cover in a hero: 10px. Library tiles: `rounded-md`. Big floating art: 16px.
- The app window itself is rounded 12px and goes square when maximised
  (`isEdgeToEdge`). Full-window effects follow the window shape, not the screen.

## Motion

- Default easing: `[0.22, 1, 0.36, 1]`. Use it for enter and exit.
- Fades: 0.1 to 0.2s. Page and list transitions: about 0.2s with a 4 to 6px slide and
  a light blur (`filter: blur(4px)` to `0`).
- Springs for things that "land": stiffness about 260 to 320, damping about 20 to 22.
- Idle loops (breathing, floating): 1.8 to 2.4s, `easeInOut`, small amplitude
  (opacity 0.55 to 1, or a 6px float).
- Pause anything continuous when the window is hidden (`isWindowVisible()`), and keep
  the fullscreen background at 60 fps or less.

## Building blocks

- **Entity page** (playlist, album, local files): `EntityHero` with a 168px cover, title,
  subtitle, a meta chip (`HERO_CHIP_CLASS`: count · duration), primary "Play all", a
  glass shuffle button, then search, sort and secondary actions on the right. Under it,
  the glass list panel with virtualised `SongCardWithMenu` rows of 64px.
- **Sidebar** (`src/widgets/sidebar`): 240px glass panel with labelled rows of 34px.
  Icons take `accent-primary`, labels stay `text-primary`; the current page gets the
  glass fill and the Fill icon. Order: search, Home, Equalizer, the Library shortcuts,
  then the user's playlists. The account row at the foot opens settings.
- **Player pill**: the mini player floats over the page, centred, at most 760px wide,
  with the transport first. Pages keep `--page-inset-bottom` clear for it.
- **Home**: "Recommended for you" leads with 250px cards tinted by their own blurred
  cover and a one-line reason above the title. Every other row uses the 175px tiles
  and a plain 20px heading, with no icon.
- **Artist page**: the artist photo runs edge to edge under the header and fades into
  the page backdrop; name, audience and actions sit on its lower edge.
- **Equalizer page** (`/equalizer`): the ten bands as points on one accent curve over
  a +12 / -12 dB grid. Each point is a vertical slider (drag, wheel, arrow keys,
  double-click to zero). Presets live in one menu; an unsaved curve can be saved.
- **Menus**: `DropdownMenu` from `@/shared/ui`. One line per item, icon on the left,
  `danger` for destructive items, `active` for the current one.
- **Toasts**: `showToast(message, variant, { description })`. Keep the message short; put
  the name of the thing in the description. Toasts size to their content.
- **Generated covers** (Liked Songs, On this device): 1000×1000 SVG in `src/assets/`.
  Dark radial gradient, three large blurred glow shapes at 30% opacity, a 20% black
  shade, and one white glyph at 70% opacity in the middle. Each virtual collection gets
  its own hue (Liked Songs violet, On this device teal). Take the glyph from Mingcute,
  so it matches the app icons.

## Reference: the drag-and-drop overlay

`src/features/library/local/ui/LocalDropZone.tsx`. Shown while files are dragged over
the window.

- The whole window is the drop target, so the window itself reacts: a 2px ring inset
  10px from the edges with an 18px radius, following the window shape, breathing between
  55% and 100% opacity.
- Behind it the app is frosted (`bg-black/45 backdrop-blur-2xl backdrop-saturate-150`)
  rather than hidden, so the user keeps their place.
- In the centre is the cover of the destination, not a generic icon: it springs in from
  a slight tilt and floats. Dragging several files fans out more cards behind it, so the
  count is visible before the text is read.
- Text is white on the frost: a 22px / 600 title, a 13.5px subtitle at 60%, and a glass
  pill with the file count.

Use the same recipe for any future full-window state: frost the app, make the window
edge respond, and put the destination's own artwork in the middle.

## Icons

`@mingcute/react` first, then `@solar-icons/react` and `@ai0x0/keyline-icons`. Do not add
another icon library. Use the Fill variant on artwork and active states, Line elsewhere.
