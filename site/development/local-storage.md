---
title: Disabling Local Storage
---

# Disabling Local Storage

TypeDoc uses local storage by default to retain operational state information across page loads for components such as side menus, site menus, and generated pages. To comply with certain functional cookie requirements, local storage usage can be toggled using the `window.TypeDoc` object.

To disable local storage, use:

`window.TypeDoc.disableLocalStorage();`

**Note:** Disabling local storage will clear its contents.

To enable local storage, use:

`window.TypeDoc.enableLocalStorage();`

**Note:** Local storage is enabled by default.

To disable local storage without clearing it, use:

`window.TypeDoc.disableWritingLocalStorage();`
