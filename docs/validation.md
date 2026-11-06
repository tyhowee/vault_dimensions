# Validation

November 5, 2026. This is a design prototype, not an installed plugin.

- JavaScript syntax check passed.
- A temporary Node DOM harness executed the actual embedded script and exercised all three presets, folder filtering, alias search, zero results, grouped-note selection, clearing the group, axis changes, and theme state.
- Geometry was generated at desktop and narrow widths without undefined or nonfinite coordinates. This is not a visual overflow or touch-target check.
- Fixture checks confirmed reciprocal adjacency bookkeeping, distinct-neighbor totals, exclusion of self-links, and modification dates not preceding known creation dates.
- The mockup contains no external script, stylesheet, image, or network dependency. Its content security policy blocks network connections.
- Browser visual verification could not be completed: the browser access host was unavailable, and the native browser fallback timed out. Typography, hit targets, responsive layout, and real keyboard behavior still need a browser review.
- No Obsidian runtime integration, installation, large-vault benchmark, or accessibility audit has been performed.

The temporary harness is a design-session check, not a shipped plugin test suite. The planned implementation acceptance criteria are in `implementation-plan.md`.

## Hierarchy, focus, sizing, and theme follow-up

- Syntax and actual-script execution passed with the expanded 39-note fictional fixture.
- All five strata are represented. Checked explicit hub precedence, declared child-map promotion, ordinary high-degree notes, zero-link notes, distinct-neighbor counts, and bounded monotonic dot size.
- Checked 1/2/3-hop neighborhoods, the isolated seed, deduplication through cycles, membership monotonicity, and unchanged selected coordinates when Focus is toggled.
- Exercised folder/search intersections, direct-neighbor-only title eligibility, selected-label presence, zoom/Fit, all 16 demonstrated axis combinations, grouped-note selection, and narrow-width coordinate generation.
- Exercised preview appearance state for system/light/dark. CSS consumes native Obsidian tokens with preview-only fallback palettes. Native Obsidian theme switching still requires the actual plugin and fixture-vault validation.
- Label placement measures text with canvas in a browser. The temporary DOM harness uses estimated metrics, so these checks do not establish real-font collision behavior or visual quality. Browser review remains outstanding.
