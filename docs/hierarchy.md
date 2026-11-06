# Hierarchy, focus, and labels

The primary view uses five fixed strata, from top to bottom. Choose Created date or Folder for X. This separates a note's navigation role from where it is stored and when it was created.

| Stratum | Default rule |
| --- | --- |
| 5. Home / hubs | Notes explicitly designated as home or major entry points in plugin settings. |
| 4. Maps of maps | Recognized map notes with at least two distinct declared child maps. Threshold is configurable. |
| 3. Maps of content | Notes recognized by an existing `type: moc`, a configured navigation folder, or a plugin-local role override. |
| 2. Linked notes | Other notes with at least one resolved incoming or outgoing note link. |
| 1. Unlinked notes | Other notes with no resolved incoming or outgoing note links. |

Apply the rules top-down; each note receives exactly one stratum. A recognized map without links still remains a map. A highly connected ordinary note remains in Linked notes. This is a navigation hierarchy, not a quality or maturity score.

## Configure it for this vault

Proposed defaults to review in the eventual plugin:

1. Designate `MOCs/Dashboard.md` as Home. Select any additional major hubs individually; do not promote every frequently referenced note automatically.
2. Recognize maps through `type: moc` and the `MOCs/` folder. The folder rule covers lightweight indexes without frontmatter.
3. Derive declared parent/child relationships from three sources, in precedence order: a frontmatter `parent:` property, a `**Parent:** [[X]]` line in the body, and a bare `[[X]]` wikilink alone on the first body line. Normalize all three into child-to-parent relations, then count children of each map. The third form is how this vault's SKILL notes and pilot-project notes declare their uplink; targets that do not resolve to a Markdown note, such as `.base` files, are discarded.
4. Where the structure is implicit, offer a role or child-map override in plugin settings. No added frontmatter, retagging, or file movement is required.

A generic outgoing link to a parent or sibling does not establish a child. This prevents ubiquitous return links from promoting every MOC into a map of maps. Self-relations and duplicate children are ignored. Cyclic parent relations are flagged and omitted from automatic promotion; a role override remains available. A single child is still a map of content by default.

Maps backed by Bases retain their map role even when query results are not explicit links. Query membership does not count toward link degree or child-map count. A future native Bases integration can expose that separate relationship with its own label.

Classification uses the entire included vault before any display filter, focus operation, or date range. Notes do not change strata when their neighbors are temporarily hidden. The inspector shows the winning rule and evidence: for example, "Maps of maps: 3 declared child maps." Missing or unresolved metadata stays pending until resolution finishes.

## Dot size

**Shipped behavior.** Radius is a function of stratum, not of connectivity. The earlier connectivity-scaled radius was replaced because a single high-degree outlier set the scale for the whole vault, inflating every well-connected note until dense folders rendered as solid masses.

| Stratum | Radius |
| --- | --- |
| 5. Home / hubs | 6.5 px |
| 4. Maps of maps | 6.0 px |
| 3. Maps of content | 5.5 px |
| 2. Linked notes | 1.8 to 2.9 px, log-compressed by degree |
| 1. Unlinked notes | 1.8 px |

Note-stratum marks drop to a 0.6 px halo so the background stroke does not swallow them. Degree is still the number of distinct neighbors across incoming and outgoing links, counted once per neighbor, excluding self-links, unresolved targets and excluded files, and it still drives the slight variation inside the linked stratum and the ordering of label priority.

Within a folder/date/stratum cell, positions come from a hash of the note's path, giving a uniform random scatter with natural clumping and voids. Positions are stable across rebuilds because the hash is of the path. The cell's occupied area scales with the note count, down to a floor, so small folders read as a group rather than as specks flung into the corners. Map strata skip this and use the tier layout below.

Exact numeric-axis positions are not jittered.

## Label visibility and zoom

**Shipped behavior.** Eligibility is no longer restricted to the selection and its neighbors.

- Map strata always label. Before labelling, the three map strata are laid out across their row: sorted by territory, dodged to a minimum spacing derived from each title's width, and staggered into two vertical lanes so adjacent names clear each other.
- The selected note and its direct neighbors always label.
- Every other note labels once zoom passes about 2.2x. Below that the label is hidden before any text measurement, so the cost of the extra marks is near zero.
- Above the threshold, labels outside the viewport are culled from their anchor position and scale before measurement, bounding work to what is on screen.
- Remaining collisions are resolved greedily in priority order: selection, then map strata by stratum and degree, then neighbors by degree, then everything else by degree. Map labels use a tighter clearance than note labels.
- Labels are placed against the mark, offset by its own radius, with the baseline vertically centred, so they stay attached at every size and zoom.
- Recompute placement after zoom, pan, resizing, font loading, or theme changes. Text stays screen-sized while coordinate spacing grows, which is what makes room for more labels.

Zoom is continuous by scroll wheel between 0.4x and 6x. Fit restores the overview. There are no zoom buttons.

## Focus and steps

**Shipped behavior.** Steps is not a Focus-only control. It sets a depth that applies to link lines always, and additionally to note visibility when Focus is on.

- Focus off: all notes stay visible, and link lines are drawn from the selection out to the chosen depth.
- Focus on: the same depth also limits which notes are drawn, to the selection and its neighborhood.
- 1, 2 or 3 steps in both cases.

Edges are collected by breadth-first traversal from the selection with a visited set, so cycles and reciprocal links do not duplicate. Each undirected pair is drawn once. Direction is retained in styling: solid for outgoing, dashed for incoming. Depth is shown by opacity, roughly 0.62, 0.42 and 0.22 for the first, second and third hop. Edges are quadratic curves bowed perpendicular to the chord at a fifth of its length, capped at 70 px, so a hub's links fan out instead of forming a straight starburst. A 2000-edge budget caps a deep expansion from a high-degree note.

Degree, stratum, scale domains and coordinate packing use the full included vault and stay fixed as Focus and Steps change.

Compute the neighborhood before folder/search filters, then intersect the two sets. A path can pass through a filtered-out note; do not fabricate an edge across that gap.

In Focus, selecting another note recenters the neighborhood on that note. Turning Focus off restores the existing folder/search scope.

Sections above marked **Shipped behavior** describe the running plugin. The rest of this document, and the acceptance criteria in docs/implementation-plan.md, still describe the original design study and should be read as intent.
