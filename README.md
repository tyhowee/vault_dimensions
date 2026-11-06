# Dimensions for Obsidian

An Obsidian plugin for navigating a vault through visual hierarchy, folders, dates, and connectivity. Working and installed; `main.js`, `styles.css` and `manifest.json` here are the shipped plugin.

The original design study, [the interactive mockup](mockups/index.html), still runs from disk with fictional notes and no network dependencies.

| Preset | Horizontal | Vertical |
| --- | --- | --- |
| Hierarchy by folder (default) | Folder | Five navigation strata |
| Hierarchy over time | Created month | Five navigation strata |
| Structure over time | Created month | Folder |

The five strata run from Home / hubs at the top through Maps of maps, Maps of content, Linked notes, and Unlinked notes. Choose other axis combinations to inspect incoming links, total neighbors, modification date, or note type.

Dot size reflects stratum, not connectivity: the three map strata are a regular larger size, linked and unlinked notes are small and near-uniform. Within a cell, notes scatter by a hash of their path, so positions are stable across rebuilds but carry no extra meaning.

Map titles always show, dodged apart and staggered across two lanes so names fit. Ordinary note titles appear once zoom passes about 2.2x, thinned by collision and prioritized by degree. Labels sit against their mark rather than floating off it.

Steps controls depth for both link lines and Focus. With Focus off it draws edges out to that many hops from the selection, fading with distance; with Focus on it also limits which notes are drawn. Scroll to zoom; Fit restores the overview.

Colour follows the graph view's path groups by default, and can instead encode the `area/`, `topic/` or `method/` tag namespace, with a legend.

The future plugin inherits the active Obsidian theme dynamically. Preview appearance follows the operating system by default, with Light/Dark overrides for inspection. The standalone file cannot read the theme of a separate Obsidian application.

- [Hierarchy and interaction rules](docs/hierarchy.md)
- [Product design](docs/design.md)
- [Implementation plan](docs/implementation-plan.md)
- [Research](docs/research.md)
- [Review guide](docs/review.md)
- [Validation](docs/validation.md)

Parentage is read from a frontmatter `parent:` property, a `**Parent:** [[X]]` line, or a bare `[[X]]` wikilink alone on the first body line, in that precedence order. A map is placed above the folder most of its descendants live in.

The name is provisional. This is an independent design inspired by Maps of the Ideaverse, not a fork. All note titles, dates, paths, links, and excerpts in the mockup are fictional. Actual vault observations are limited to structural findings in the research document. The live vault remains outside this project's write scope.
