# Research

Read-only inspection on November 5, 2026. No vault changes requested or performed by this work.

## Vault observations

655 Markdown files in the content/navigation folders, excluding 12 templates and two root instruction/readme files. There are 25 Bases. These are filesystem counts, not claims about link resolution.

| Folder | Markdown files |
| --- | ---: |
| Projects | 78 |
| Research | 13 |
| Education | 4 |
| Notes | 130 |
| Resources | 150 |
| Daily | 126 |
| People | 84 |
| Meeting Notes | 47 |
| MOCs | 22 |
| Inbox | 1 |

The current theme is Minimal. Installed plugins include Omnisearch and Extended Graph. This argues for a spatial browsing tool with meaningful axes rather than another general search engine or force graph.

The taxonomy separates area, topic, and method. Type, category, status, dates, aliases, folder paths, and links provide several already-established dimensions. There is no reason to require a schema migration.

170 content/navigation files have an aliases property. Alias presence does not imply a nonempty alias list. Title-only search would still discard a deliberate retrieval mechanism.

All 47 meeting notes lack area/topic/method frontmatter tags in this inspection. Meetings and daily notes are intentionally untagged. Type inference must respect folder conventions without asking for new frontmatter. Tag dimensions need a visible Untagged lane and optional contextual inclusion, with inferred membership distinguished from authored tags.

The documented schema and real metadata include variations: books have their own type, some resource types are quoted, some category values differ in case, and some files omit type. Read through Obsidian's parsed metadata, preserve raw values, and use conservative display normalization. This is a rendering concern, not a request to repair notes.

MOCs can embed dynamic Bases. A relationship-only view cannot assume that every displayed Base result appears as an explicit link from the hub. The initial degree dimension measures actual resolved note links. A later native Bases view can expose query membership without inventing edges.

The Dashboard already links to top-level hubs and recent/reading views. Rebuilding that as another landing page would contribute less than a view where folder, date, and connectivity become independent spatial dimensions.

No note text or private project content is used in the mockup. All examples are invented. Structural inspection used the vault instructions, README, representative hub/Base files, aggregate metadata, and plugin/theme configuration. The Obsidian CLI was not on PATH; no Obsidian runtime was modified or used to install anything.

## Reference

[Maps of the Ideaverse](https://github.com/nickmilo/ideaverse-maps/tree/main), inspected at commit `9e465fcf6e09f5f5d32427384288ac97beb252f3`. Read the README and `src/scan.js`, and visually inspected `docs/emergence.png`.

The [README](https://github.com/nickmilo/ideaverse-maps/blob/9e465fcf6e09f5f5d32427384288ac97beb252f3/README.md) describes layouts based on dates, folders, links, and hierarchy, selected-note focus, saved views, and Bases integration. Emergence combines time with structural bands; its screenshot makes the value of a stable spatial explanation clear. The [scanner](https://github.com/nickmilo/ideaverse-maps/blob/9e465fcf6e09f5f5d32427384288ac97beb252f3/src/scan.js) separates extracted note features from link resolution and derived scores.

The proposed plugin keeps meaningful dimensions, contextual focus, and inspectable values. It replaces emergence/importance scores with directly named measures, and uses one configurable 2D layout with explicit aggregation. This recommendation is design judgment, not a finding that the reference cannot be configured more simply.

| Approach | Benefit | Cost | Recommendation |
| --- | --- | --- | --- |
| Configure Ideaverse | Fastest route to trying dimensional navigation | Retains a broad product and its interaction language | Useful reference; not the requested custom design |
| Fork Ideaverse | Existing scanner and many rendering features | Large inherited surface to simplify and maintain | Avoid for the initial prototype |
| Independent small plugin | Tight control of axes, density, and interaction | Must implement indexing, layout, and accessibility | Preferred after validating this design |
| Bases and native graph alone | Uses current tooling | Does not provide the proposed synchronized spatial surface | Keep as complementary tools |

No source code or visual assets from Ideaverse are copied into this repository.

## API evidence

The current [public Obsidian TypeScript declarations](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) were read on November 5, 2026. They expose `ItemView`, `Plugin.registerView`, `MetadataCache.getFileCache`, `getFirstLinkpathDest`, `resolvedLinks`, metadata resolution events, vault rename events, and plugin data storage.

`resolvedLinks` maps source and destination file paths to occurrence counts. Distinct-neighbor degree is our derived measure, not the raw occurrence sum. `MetadataCache.changed` does not cover renames; the implementation must also handle vault rename events. Link resolution can complete after the metadata change event.

`Plugin.registerBasesView` is documented in those declarations since Obsidian 1.10.0 and returns false when Bases are disabled. This makes a native Bases surface a plausible later integration. It does not require independently reimplementing the `.base` query language.

`Plugin.saveData` writes `data.json` in the plugin folder. Persistent settings are therefore writes to plugin configuration even when note content is read-only.

These API checks establish feasibility, not runtime verification. No plugin has been compiled or tested in Obsidian in this design phase.

## Theme compatibility follow-up

Obsidian's [styling guidance](https://docs.obsidian.md/Reference/CSS%20variables/About%20styling) recommends consuming built-in CSS variables for compatibility with community themes. Its [HTML elements guidance](https://docs.obsidian.md/Plugins/User%20interface/HTML%20elements) demonstrates native text and border tokens. The public TypeScript declarations also expose the Workspace `css-change` event.

Design implication: inherit native theme tokens rather than storing a separate plugin palette. CSS/SVG updates automatically; measured label placement and any future canvas renderer need an explicit refresh. The standalone preview's fallback palettes are only for inspection outside Obsidian. Actual dynamic theme behavior must still be tested in the fixture-vault plugin.
