# PWA Icon Generation

## Automated Generation (Recommended)

Run this command to automatically generate all PWA icons from the `static/favicon.svg`:

```bash
pnpm run icons:generate
```

This will create:
- All required PNG icons in various sizes (192x192, 512x512, etc.)
- Apple touch icons
- Favicon variations
- Maskable icons
- Update `manifest.json` with correct icon paths
- Update `src/app.html` with icon references

## Manual Generation (Alternative)

If you prefer manual generation, create these files in `/static`:

- `pwa-192x192.png` - 192x192px PWA icon
- `pwa-512x512.png` - 512x512px PWA icon  
- `pwa-maskable-192x192.png` - 192x192px maskable icon
- `pwa-maskable-512x512.png` - 512x512px maskable icon

**Tools for manual generation:**
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://maskable.app/editor (for maskable icons)

## Notes

- The automated generator uses `pwa-asset-generator`
- Source file: `static/favicon.svg`
- Background color: white with 10% padding
- All icons are optimized for web use