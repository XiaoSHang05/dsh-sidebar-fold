# Changelog

## 1.0.1 — 2026-10-28

**Removed**

- The rule that hid the `dsh-dock` sidebar entry, and the "Open the dock"
  button on the Settings page. Hiding another plugin's sidebar entry was a
  personal preference that did not belong in a general-purpose plugin: anyone
  who installed this one silently lost a control they might have wanted.

  The plugin now touches nothing but its own header row. It declares no
  dependency on `dsh-dock` and requires no module from it.

## 1.0.0 — 2026-10-26

First public release.

**Added**

- A collapsible header row at the top of the sidebar's global panel list. Click
  the row to fold every other panel icon away; click again to bring them back.
  The row itself is an ordinary `sidebar.panellist` entry, so it inherits the
  host's own row styling, height and collapsed-rail behaviour.
- The folded state is remembered per browser in `localStorage` and defaults to
  expanded.
- A "Sidebar tidy-up" page under Settings with the same toggle.

**Design notes**

- Folding is pure CSS driven by a `data-sbf-fold` attribute on `<html>`. Panel
  icons registered by other plugins *after* this one is installed are folded
  automatically — the rule matches on "not my header", not on a list of ids.
- Nothing is patched into another package. Uninstalling restores the stock
  sidebar exactly.
- Every failure path is swallowed: this is a tidying layer, so the worst case
  is "not folded", never a broken sidebar.
