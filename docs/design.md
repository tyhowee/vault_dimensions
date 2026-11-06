# Design

## Purpose

Find notes by recognizing where they sit in a meaningful structure, even when their names are forgotten. Make the structure understandable at a glance, then let the user narrow it through direct interaction.

The user's clarification is the central requirement: Ideaverse is compelling because it gives folder structure, creation date, and number of links spatial dimensions. A better-looking table alone would miss that requirement.

## Main surface

One map, two labeled axes, a compact inspector, and a synchronized note list. Presets change the coordinate system of the same data. They do not switch between unrelated visual metaphors.

1. **Hierarchy over time.** X = created date, Y = five navigation strata. The default overview, from Unlinked notes at the bottom to Home / hubs at the top.
2. **Hierarchy by folder.** X = folder, Y = the same strata. Compare navigation roles across the existing folder structure.
3. **Structure over time.** X = created date, Y = folder. Revisit periods of work by where notes were collected.

The initial connectivity views remain available through axis choices: Incoming links by Created date, or Folder by Total neighbors. The full rules for strata, Focus, dot size, and labeling are in [hierarchy.md](hierarchy.md).

Each preset has a fixed, descriptive label. X and Y selectors allow simple combinations. The initial release supports Created, Modified, Incoming links, Outgoing links, Total neighbors, Folder, Type, and Hierarchy where the axis permits them. The mockup demonstrates a subset.

Later dimensions: area, topic, method, status, category, and a user-selected numeric property. Multi-valued properties need an explicit display policy before implementation. A note can belong to several tag lanes; duplicated appearances must retain one note identity and unique-note totals. Do not silently keep only its first tag.

## How a mark behaves

- Position encodes the chosen axes. A circle's size encodes distinct whole-vault neighbors through a bounded square-root radius scale. Counts and scale remain unchanged by filtering or Focus. A numbered square explicitly represents several notes.
- Clicking a mark selects it without opening a file or changing the viewport. The inspector shows the title, path, exact axis values, date source, and incoming/outgoing neighbors. Opening the note is a separate explicit action in the eventual plugin.
- A numbered square represents multiple notes in the same displayed cell. Selecting it reveals the entire group in the list. Selecting a list row picks one note without pretending it has a unique point in the overview.
- In the prototype, dates are grouped by month. The axis says so. Exact dates remain visible in the inspector. Aggregate counts are exact for the visible, fictional dataset.
- Outside Focus, only the selected note's direct links are drawn. In Focus at steps 2 and 3, subtle dotted shortest paths also explain the outer neighborhood. Incoming links are dashed; outgoing links are solid. Text lists carry direction and titles. When a target is in a numbered group, a line ends at that group; it does not mean every group member is linked.
- A selected note's connections outside the current filter remain listed as outside the view. Following one preserves the filter unless the user explicitly reveals it. Never silently broaden scope.
- No force simulation, orbit, animated background, random layout, or arrangement by inferred importance. Stable coordinates make revisiting a region predictable.

## Scale and drill-down

The whole-vault view must remain legible at 655 notes and at 10,000 notes. Dense data become aggregates, not an unreadable stack of tiny dots.

- Use calendar-aligned time bins appropriate to the visible range. State the current granularity: year, month, week, or day. Unknown dates occupy a separate named gutter, outside the time scale.
- On categorical axes, aggregate within each category and time/count bin. On numeric axes, aggregate into explicit numeric ranges when the viewport cannot fit individual positions. Show the range in the inspector.
- A selected group lists all its members. The eventual plugin also offers Zoom to group and Back. Zoom increases detail while preserving the note selection and a breadcrumb for the current range.
- Folder rows initially use top-level folders in vault order. Expansion reveals actual subfolders, such as Pilot Projects. It does not move files or infer a new hierarchy. Folder depth and date range are independent controls.
- Render titles only for the selected note and its direct neighbors. Measure text and suppress collisions, prioritizing the selection. Zoom and theme/font changes recompute placement. Hover/focus and the linked list supply titles when labels are hidden.
- Keep numeric axes linear initially. Do not compress large link counts with an unlabeled nonlinear scale. If a long tail makes linear scaling unusable, offer an explicitly labeled log scale after testing, with a separate zero treatment.

## Interaction contract

- A preset changes axes and keeps the folder filter, search, selection, and scope. Tell the user when the selection falls outside the visible scope.
- Search locates notes by title, alias, and path in the initial release. It filters the view. Display the result count and a clear reset. Full-text search can continue through the user's existing search tooling until there is evidence it belongs here.
- Folder filtering changes the displayed note set. Link counts default to the entire included vault, even when the map is filtered. The label always says "Vault link counts." A future in-view count switch must change the label too.
- Focus with a 1/2/3-step control intersects the existing folder/search scope with a bidirectional link neighborhood. Traversal uses a visited set. Positions and classification stay stable; selecting another note recenters Focus.
- Zoom increases spacing while retaining readable label sizes; Fit restores the overview. Back restores the previous scope and viewport in the eventual plugin. Keyboard selection works through a synchronized native list, with focus visible. The final plugin adds directional map navigation; shortcuts apply only while this view is focused and never hijack text entry.
- Opening a note uses Obsidian's native workspace. An optional follow-active-note mode can keep the map beside the editor; it is not required for the first release.
- Presets are useful immediately. Custom saved views are optional and save only view configuration, not duplicated content.

## Dates and connections must be honest

**Created:** a valid configured frontmatter date, followed by a strict date-bearing filename. Preserve precision for year-only and month-only properties. An absent date stays Unknown. Filesystem creation time is an explicit optional fallback because migrations and sync can reset it.

**Modified:** filesystem modification time, labeled as file modified. It is not a measure of reading, attention, or intellectual progress. Bulk edits may create dense bands and are not automatically dismissed as noise.

**Incoming/outgoing:** distinct other included Markdown files linking to/from the note. Repeated references from the same note count once; self-links do not count. Total neighbors is the union of incoming and outgoing files, so a reciprocal pair contributes one total neighbor. Unresolved links and non-note attachments are separate and do not inflate these values.

**Hub membership:** a link to a hub, a declared parent, and membership in a Bases query are different relationships. An embedded Base does not create explicit note-to-note links to every result. Show source labels when adding these relationships later. Link count is a structural measure, never a quality score.

## Visual language

- Inherit the active Obsidian theme, including light/dark changes, community themes, fonts, and CSS snippets. No separate production palette or plugin theme toggle. Minimal is a reference for restraint, not a dependency.
- Use Obsidian variables for background, text, muted text, borders, selection, focus, and interface font. Scope plugin styles to its view root. Do not override `body`, `:root`, or Obsidian's theme classes in production.
- SVG marks, strokes, and text reference CSS variables directly, so color changes propagate immediately. Recompute measured label placement on Obsidian's `css-change`, font readiness, and resize events. If canvas rendering is later introduced, redraw it with freshly resolved computed colors and fonts.
- Test theme switches without reopening the view, preserving selection, axes, Focus, and zoom. Include Obsidian defaults and representative community themes in both light and dark, plus a snippet/font change.
- The standalone mockup aliases Obsidian token names when available and supplies preview-only fallback palettes otherwise. Follow system is automatic; Light/Dark overrides belong only to the preview. This is not live Obsidian theme integration.
- Neutral canvas, thin separators, small circular marks, restrained text. Selection uses contrast and a visible ring. Meaning must remain available without color.
- No per-folder rainbow. Folder labels and coordinates do the grouping.
- Normal reading text at approximately 14 px, supporting labels at 12 px. Keep mark hit targets larger than their visual diameter. Use 44 px targets on touch where practical.
- One compact control row, three named presets, one detail panel. Avoid a dashboard of statistics and settings.
- At narrow widths, stack the inspector below the map and reduce label density. Keep a complete list alternative. Desktop-first validation; no claim of finished mobile support in the prototype.

## Scope

First usable version: hierarchy strata and explainable classification, three presets, axis selectors, folder/type filters, title/alias/path search, meaningful aggregates, connectivity-sized marks, collision-aware neighbor labels, zoom/Fit, Focus with 1–3 steps, exact-value inspector, native note opening, theme inheritance, and view state.

Later: tag dimensions, folder expansion refinements, optional Bases view, saved scopes, read-history-based rediscovery if requested. A revisit queue is secondary to dimensional exploration.

Outside initial scope: semantic embeddings, AI chat, graph clustering, inferred note quality, vault cleanup, automatic linking, note creation, a replacement editor, social capture, ornamental maps, and dozens of rendering modes.

## Storage boundary

This design work does not change the live vault. No plugin is installed there.

The future plugin reads note content/metadata and never creates, moves, rewrites, or retags notes or Bases. Normal plugin installation and settings would write inside Obsidian's plugin configuration directory. That is still physically inside a vault on a standard installation; do not describe it as literally zero writes. Test in a separate fixture vault first. No live-vault installation is part of this phase.

Index and relationship data stay in memory initially. Persist only settings and saved view configuration through the plugin's normal data mechanism. No note-body cache, telemetry, external image loading, or network requests. A preview should render local text without loading remote embeds.
