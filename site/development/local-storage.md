---
title: Disabling Local Storage
---

# Disabling Local Storage

TypeDoc uses local storage by default to retain operational state information across page loads for components
such as side menus, site menus and generated pages. To comply with certain functional cookie requirements, local
storage usage can be disabled either programmatically by modifying a data attribute on the `document`, or through
a checkbox in the settings menu.

**Note:** Enabling this feature will clear the local storage of the contents.

## Programmatically

Local storage can be disabled by setting the `disableLocalStorage` attribute in the `dataset` property
of the `document.documentElement`.

Specifically, use: `document.documentElement.dataset.disableLocalStorage`.

**Note:** This attribute expects a boolean value, defaulting to `false`.

## Checkbox

A checkbox exists under the settings menu to allow for toggling of this functionality without directly modifying
the data attribute. By default, this checkbox is hidden. To reveal it, change the display value of the CSS class
on the wrapper `div`: `td-disable-local-storage-toggle`.
