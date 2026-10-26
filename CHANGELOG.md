# Changelog

## 1.0.0 — 2026-10-26

First public release.

**Added**

- A collapsible header row at the top of the sidebar's global panel list. Click
  the row to fold every other panel icon away; click again to bring them back.
  The row itself is an ordinary `sidebar.panellist` entry, so it inherits the
  host's own row styling, height and collapsed-rail behaviour.
- The folded state is remembered per browser in `localStorage` and defaults to
  expanded.
- A "Sidebar tidy-up" page under Settings with the same toggle, plus a button
  that opens the dock.

**Hides**

- The `dsh-dock` entry at the sidebar foot. The dock itself is untouched and
  still opens from its own panel or from the Settings page above.

**Design notes**

- Folding is pure CSS driven by a `data-sbf-fold` attribute on `<html>`. Panel
  icons registered by other plugins *after* this one is installed are folded
  automatically — the rule matches on "not my header", not on a list of ids.
- Nothing is patched into another package. Uninstalling restores the stock
  sidebar exactly.
- Every failure path is swallowed: this is a tidying layer, so the worst case
  is "not folded", never a broken sidebar.
