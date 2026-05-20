# Mobile Responsiveness Check

Check the given component (or all components in `src/components/` and `src/app/` if no argument) for mobile responsiveness issues.

For each file, review:
1. **Text sizes** — are font sizes too large on small screens (320–375px)? Look for fixed `text-[Xpx]` without a smaller mobile variant.
2. **Layout** — does every row/flex container have `flex-wrap` or a mobile fallback? Check grids have `grid-cols-1` as base.
3. **Overflow** — any fixed widths that could overflow on narrow screens?
4. **Touch targets** — are buttons and links at least 44×44px?
5. **Modal / Drawer** — do they use bottom-sheet pattern on mobile (`items-end sm:items-center`)?
6. **i18n** — any hardcoded French/Russian/English strings that bypass the translation system?
7. **Spacing** — `px-6` or more on mobile sides? Enough padding so content doesn't touch screen edges?

Report findings as a table: | File | Issue | Severity (low/medium/high) | Suggested fix |

Then ask the user which issues to fix.
