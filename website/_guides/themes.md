---
layout: 'guide'
title: 'Themes'
menuOrder: 4
---

# Themes

Themes allow you to change the look and feel of the generated documentation. You can use one of the included
themes, modify them to suit your needs or create a fully custom theme. The ``--theme`` parameter allows you to
select a theme when creating a documentation:

```bash
$ typedoc --theme <default|minimal|path/to/theme>
```

You must supply a path to a valid theme directory or a name of a built-in theme. If you don't supply the
``--theme`` parameter, the theme ``default`` will be used.


## Built-in themes

TypeDoc ships with two themes so you can start creating docs right out of the box:

* ``default`` - This is the standard theme used by TypeDoc. It is intended to be used with medium to large
  projects. It creates a single html file for each module, class, interface and enumeration in your project.
  It supports filtering the displayed members by different criteria and it includes a simpled search.

* ``minimal`` - This theme is intended to be used with smaller projects. It is ultra portable as it renders
  the entire documentation into one big html file including all required assets like stylesheets or images.
  Like the default theme, it supports filtering the displayed members by different criteria.


## Custom themes

Creating a custom theme in TypeDoc is pretty easy. Basically you create a directory and overwrite the
components of the ``default`` theme you want to change. All themes extend the default theme, so you only
have to change the parts that don't fit your needs.

This is the basic directory structure of a theme, only the assets directory is mandatory:

```
+ my-theme             // Root directory of your theme
  + assets             // Static assets like *.css or *.js files
  + layouts            // Optional. Layout templates
    - default.hbs      // Optional. Default layout template
  + partials           // Optional. Partials to be used by Handlebar
  + templates          // Optional. Page templates
    - index.hbs        // Optional. Home page template
    - reflection.hbs   // Optional. Definition page template
  - theme.js           // Optional. JavaScript class of the theme
```
