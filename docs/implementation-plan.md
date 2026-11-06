# Implementation plan

> **Status, November 2026.** A working plugin now ships from this repository and is installed in the live vault. It was built directly rather than through the staged path below, so Stage 0's "no plugin manifest or live-vault installation" no longer holds, and several acceptance criteria describe superseded behavior: criterion 11 states connectivity-scaled radii and selection-only labels, both of which were replaced (see docs/hierarchy.md). The module breakdown, data contract and the remaining criteria are still the plan of record for work not yet done.


## Stage 0: validate the spatial model

Deliverable: this repository, the design documents, and an offline interactive mockup with fictional data. No package scaffold, plugin manifest, bundled application, or live-vault installation.

Review all three coordinate systems. Confirm whether the user can recognize an area or period of work, select a meaningful subset, and follow a relationship without remembering titles. The mockup is sufficient to review the layout, not performance at vault scale.

## Stage 1: read-only vertical slice in a fixture vault

Create a TypeScript plugin using the official Obsidian sample-plugin build approach, pinned to an explicitly selected API version at implementation time. Use one native ItemView and ordinary DOM controls. Do not introduce React, a graph engine, or a chart framework unless a concrete implementation need justifies it.

Suggested modules:

- `VaultIndex`: a normalized record per Markdown path; incoming/outgoing adjacency sets; metadata provenance. No writes to note files.
- `HierarchyClassifier`: ordered role rules, explicit home/hub settings, recognized map candidates, validated declared child-map relations, configurable threshold, local overrides, and per-note explanation. Compute globally before display filters.
- `DimensionRegistry`: dimension identity, value accessor, type, label, comparator, missing-value policy, and formatter.
- `Scope`: folder/type filters and title/alias/path search. Link counts remain vault-wide within configured inclusion boundaries.
- `Neighborhood`: breadth-first traversal with distances and predecessor paths, visited-set deduplication, and a 1–3 hop limit. Scope intersects its result; it never recomputes global role or degree.
- `Layout`: pure records-to-coordinate and aggregation functions. Stable ordering, explicit calendar bins, unknown-value gutters, exact group membership.
- `MapView`: rendering and hit testing; selection and viewport state. Start with SVG for the slice. Benchmark before deciding whether large views require a canvas renderer with the same accessible list.
- `Labels`: selected/direct-neighbor eligibility, active-font text measurement, deterministic placement priority, collision culling, and recomputation on zoom, font readiness, theme changes, and resizing.
- `Inspector`: exact values, provenance, group members, explicit connections, native note-open actions.
- `Settings`: versioned settings and saved view configurations. No persistent body index initially.

Build Hierarchy over time and Hierarchy by folder first, with role explanations and fixed global scales. Add connectivity sizing and Focus after normalized adjacency sets are correct. Reuse the same selection/list/inspector behavior for all presets.

## Data contract

Identity is a normalized vault-relative path. Display names can collide; paths cannot. Rename events update records, selection, and saved references. Deleted files vanish from all reverse indexes and groups. Never use title alone as a key.

Each record holds path, title, aliases, folder, inferred/explicit type and provenance, dates with source and precision, raw properties needed for supported dimensions, and distinct resolved Markdown neighbors. Preserve missing values explicitly.

Read parsed frontmatter from MetadataCache. Use cached/resolved internal-link information and Obsidian's resolver instead of inventing filename matching. Validate heading/block references, aliases, relative Markdown links, and frontmatter links in the fixture. Exclude self references, templates, attachments, configuration, and unresolved destinations from note degree. Confirm how embeds appear in the cache and define them consistently before release.

Expose index readiness: metadata ready, links resolving, ready. Do not briefly display unresolved-yet notes as confirmed zero-degree notes. Subscribe to cache changes/resolution and vault create/delete/rename; debounce updates and update affected reverse edges. Unregister listeners and release rendering state on unload.

Saved view schema: version, axes, filters, grouping depth, date/number range, zoom, Focus state and steps, link-overlay setting, and selected path. Separately persist hierarchy configuration: map recognition, home/hub paths, declared child overrides, role overrides, and promotion threshold. Keep state migrations explicit. Index persistence and cross-device read history are out of scope.

## Stage 2: useful density and navigation

Add folder expansion, date/range zoom, back navigation, adaptive aggregation, and the remaining initial axis choices. Keep changes to the view local; never alter source properties.

Add complete keyboard navigation, native note-open behavior, inspector resizing, and state restoration. Theme inheritance is part of the first slice: consume native variables, register `workspace.on("css-change")`, recalculate measured labels, and clean up listeners. Check changes to community theme, base light/dark scheme, snippets, and font without recreating the view. A group of 100 notes must remain browsable even if its mark is small. Show exactly which inclusion/exclusion rules determine counts.

## Stage 3: validate at real scale

Test first with generated fixture vaults at approximately 650, 2,000, and 10,000 notes, including dense same-day imports, high-degree hubs, zero-degree notes, incomplete dates, and multiple folder depths. No copied private notes in fixtures.

Proposed targets, to measure rather than promise:

- Warm filtering and selection under 100 ms at 2,000 notes on the user's Mac.
- First useful view under 1 second after Obsidian metadata is ready at that scale.
- Background work yields often enough to keep typing responsive; no unexplained main-thread stalls over 50 ms.
- At 10,000 notes, aggregation bounds rendered marks by viewport capacity. Measure memory before choosing a persistent cache or worker.

Only install in the live vault in a separate, explicitly requested implementation phase. Until then, use a fixture vault outside the user's notes.

## Acceptance criteria

1. **Coordinate truth:** every individual point and aggregate maps to its declared date/category/count range; unknown dates never get fabricated timestamps.
2. **Count truth:** repeated links and reciprocal links obey the stated degree definitions. Filtered views retain the declared vault-wide count semantics.
3. **Coverage:** every included note is reachable through a mark/group or the synchronized list, including untagged meetings and zero-degree notes.
4. **Stability:** the same dataset and view state produce the same bins and ordering. Selection survives preset changes.
5. **Density:** collisions aggregate into inspectable groups. Zoom/Back preserve context. Group totals equal unique records in scope.
6. **Updates:** adding, deleting, and renaming fixture files update the view correctly after metadata resolution, without stale reverse edges.
7. **Boundary:** content hashes of fixture notes and Bases remain unchanged through indexing, filtering, selecting, and opening notes. Persistent writes are confined to documented plugin configuration.
8. **Access:** all discovery actions work without a mouse through the linked list and controls; light/dark themes retain contrast; narrow layouts do not lose controls.
9. **Hierarchy:** top-down role precedence yields one stratum; explicit maps remain maps with zero links; high-degree ordinary notes remain linked notes; repeated child maps count once; parent-return links and cycles do not inflate child-map count. Every result exposes its rule.
10. **Focus:** BFS distances are correct through cycles and reciprocal links at 1, 2, and 3 hops; filtering may hide intermediate nodes without fabricating edges. Turning Focus on/off changes visibility without shifting global coordinates or count scales.
11. **Labels and sizes:** radius is monotonic and bounded; filtering does not change it. Only selected/direct-neighbor titles appear, with the selection prioritized and neighbor boxes collision-free. More space at zoom can reveal labels and unpack aggregates. Verify actual fonts in a browser, not only estimated test metrics.
12. **Theme lifecycle:** change base scheme, community theme, snippets, and font with the view open. All surfaces/marks update, measured labels are recomputed, and view state remains intact. Test default and representative community themes; do not promise immunity to arbitrary third-party CSS.
13. **Evidence:** incoming and outgoing lists agree with resolved links. Query membership, inferred type, and date sources are labeled.

Tests should target the pure normalizer/layout/link invariants and the runtime lifecycle boundaries. Use a small end-to-end fixture test for the complete interaction. Avoid snapshot tests that only repeat CSS or implementation structure.

## Later extension: Bases

Add a native Bases view that receives its actual query result from Obsidian. Share the rendering and dimension modules with the standalone view. Show whether degree values are whole-vault or within the Base. If Bases is disabled or the required API is absent, the standalone view still works. Do not parse arbitrary Base expressions as a shortcut.

## Review decisions

The default proposal is a neutral hierarchy-by-created-date map, with a hierarchy-by-folder preset, sized dots, collision-aware neighbor labels, and an adjacent inspector. Before production code, settle the usefulness of those axes, the desired density, and whether grouped marks feel natural. The current prototype intentionally makes these choices visible and testable.
