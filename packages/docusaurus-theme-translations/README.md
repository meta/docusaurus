# `@docusaurus/theme-translations`

This package includes default translations for labels (like the pagination "Next" / "Previous") used by official Docusaurus themes.

## For Docusaurus users:

Please help us provide exhaustive translations:

- add new translation by running `pnpm --filter @docusaurus/theme-translations run update %new_lang_code%`, then edit generated JSON files
- double-check existent `language.json` file for bad or missing translations

## For maintainers:

After updating the theme code, you can "synchronize" the translations by running:

```bash
pnpm --filter @docusaurus/theme-translations run update
```

Then, ask contributors to translate the newly added labels on this [issue](https://github.com/facebook/docusaurus/issues/3526)
