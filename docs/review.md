# Review guide

Reload `mockups/index.html` or the local preview. All examples are fictional.

1. The default Hierarchy over time view shows all five strata. Navigation overview is selected; inspect "Why this stratum" to see its three declared child maps.
2. Switch to Hierarchy by folder. The five layers stay fixed while the horizontal axis becomes folders.
3. Select Home or Project hub from the list. These are explicitly designated entry points. A heavily linked ordinary note remains in Linked notes and has a larger dot.
4. Look at the titles: only the selected note and its direct neighbors qualify. Some neighbors stay unlabeled when their titles would overlap. Hover/focus a mark or use the list for its name.
5. Use + to zoom. Labels stay readable, spacing increases, and dense categorical/date cells can unpack into individual dots. Fit restores the overview.
6. Turn on Focus. Change Steps from 1 to 2 to 3. The neighborhood expands while strata, coordinates, and dot-size scales remain stable. Dotted paths explain outer-hop connections. Selecting a new note recenters Focus.
7. Filter to a folder while focused. The neighborhood summary reports how many members remain visible. Use Reset to restore the initial demo.
8. Preview appearance follows your operating system by default. Try Light and Dark overrides. In the eventual Obsidian plugin this control is absent: the view follows Obsidian's active theme automatically.

Prototype coverage: three presets and other axis combinations; five rule-based strata and explanations; bounded degree sizing; direct-neighbor label eligibility and collision culling; zoom/Fit; Focus with 1–3 steps; folder and title/alias/path search; selection; exact values; grouped-note lists; connection navigation; empty states; preview appearance.

Deferred: actual Obsidian integration and settings, native note opening, automatic lifecycle handling of Obsidian theme changes, zoom-range Back history, expandable folder hierarchy, saved views, full keyboard spatial navigation, more dimensions, and large-vault rendering. State is held only in page memory. Browser visual and accessibility review remains necessary.
