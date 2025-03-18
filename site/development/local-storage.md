---
title: Disabling Local Storage
---

# Disabling Local Storage

TypeDoc uses local storage by default to retain operational state information across page loads for components such as side menus, site menus, and generated pages. To comply with certain functional cookie requirements, local storage usage can be toggled using the `window.TypeDoc` object.

To disable local storage, use:

`window.TypeDoc.disableLocalStorage();`

**Note:** Optionally, passing `true`, `window.TypeDoc.disableLocalStorage(true);`, will clear TypeDoc contents from the local storage.

To enable local storage, use:

`window.TypeDoc.enableLocalStorage();`

**Note:** Local storage is enabled by default.
