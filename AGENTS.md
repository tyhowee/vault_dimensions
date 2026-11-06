# Repository scope

This repository holds a working Obsidian plugin, Vault Dimensions. It began as a design study; the design documents under docs/ still describe the original intent and have not all caught up with the shipped code. Read README.md for current behavior and docs/design.md before changing direction. The user wants meaningful spatial dimensions for folder structure, dates, and link counts, with a clean utilitarian interface.

The plugin is installed and running in the user's live vault at `/Users/thowe/Documents/Obsidian Second Brain`, under `.obsidian/plugins/vault-dimensions/`. That install directory is the only writable target there. The vault's notes, folders, Bases and other configuration stay read-only for this project, and private note content must never be copied into this repository or its fixtures.

Use fictional data for prototypes and fixtures. Changes are developed against the installed copy and then mirrored back here; keep the two byte-identical. docs/implementation-plan.md remains the plan of record for the parts not yet built.

Keep prototype behavior and planned behavior clearly distinguished. Do not claim visual or runtime verification that has not been completed.

Five navigation strata, arranged horizontally by folder (default) or created date. Preserve: stratum-based dot sizing, zoom-gated labels, Steps driving both edge depth and Focus breadth, and dynamic inheritance of the active Obsidian theme.

Three sections of docs/hierarchy.md were rewritten to match the code (Dot size, Label visibility and zoom, Focus and steps). The rest of docs/, including the acceptance criteria in docs/implementation-plan.md, still reflects the earlier design and should be read as intent rather than as a description of the build.
