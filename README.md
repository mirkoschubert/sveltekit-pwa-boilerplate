# SvelteKit PWA Boilerplate

A modern, opinionated Progressive Web App (PWA) boilerplate built with the latest web technologies. This template provides everything you need to build fast, reliable, and engaging web applications.

## 🚀 Features

- **🔧 Modern Stack**: SvelteKit 2.0, Svelte 5 with runes, TypeScript (strict mode)
- **🎨 Styling**: Tailwind CSS 4.0 with shadcn-svelte UI components
- **📱 PWA Ready**: Full offline support, install prompts, automatic updates
- **⚡ Performance**: Optimized for Vercel deployment with smart caching
- **🔍 Code Quality**: ESLint, Prettier, TypeScript strict mode
- **🧪 Testing**: Playwright (E2E) and Vitest (unit tests) pre-configured
- **📦 Package Manager**: pnpm for faster installs and better dependency management

## 🛠 Tech Stack

- **Framework**: [SvelteKit](https://svelte.dev/docs/kit) 2.0
- **Language**: [Svelte 5](https://svelte.dev/docs/svelte/introduction) with runes + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.0
- **UI Components**: [shadcn-svelte](https://www.shadcn-svelte.com/)
- **PWA**: Native SvelteKit service workers (no VitePWA)
- **Deployment**: [Vercel Adapter](https://vercel.com/docs/frameworks/full-stack/sveltekit)
- **Testing**: [Playwright](https://playwright.dev/) + [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 22+ (use `fnm use 22`)
- **Package Manager**: pnpm (recommended)

### Installation

1. **Clone or use this template**
   ```sh
   git clone <your-repo-url>
   cd sveltekit-pwa-boilerplate
   ```

2. **Install dependencies**
   ```sh
   pnpm install
   ```

3. **Add PWA icons**
   
   Generate and add these icons to the `/static` directory:
   - `pwa-192x192.png` - 192x192px PWA icon
   - `pwa-512x512.png` - 512x512px PWA icon
   - `pwa-maskable-192x192.png` - 192x192px maskable icon
   - `pwa-maskable-512x512.png` - 512x512px maskable icon
   
   **Recommended tools:**
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
   - [Maskable.app Editor](https://maskable.app/editor)

### Development

```sh
# Start development server
pnpm dev

# Start with network access
pnpm dev --host
```

### Building

```sh
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```sh
# Run all tests
pnpm test

# Unit tests only
pnpm test:unit

# E2E tests only  
pnpm test:e2e

# Run tests in watch mode
pnpm test:unit --watch
```

### Code Quality

```sh
# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm check
```

## 📱 PWA Features

### Automatic Updates
The app automatically checks for updates and prompts users when new versions are available. Updates are seamless and don't require app store approval.

### Offline Support
- All app shell resources are cached
- Fallback to cached content when offline
- Smart cache-first strategy with background updates

### Installation
- Automatic install prompts on supported devices
- Works on desktop and mobile browsers
- Native app-like experience

### Vercel Deployment
Optimized for Vercel with:
- Automatic service worker registration
- Smart caching strategies
- Zero-config deployment

## 🎨 Styling & Components

### Tailwind CSS 4.0
Pre-configured with:
- Modern CSS features
- Optimized for production
- Dark mode support ready

### shadcn-svelte
- High-quality, customizable components
- Accessible by default
- Tree-shakeable imports
- Easy theming

To add components:
```sh
pnpm dlx shadcn-svelte@latest add button
pnpm dlx shadcn-svelte@latest add card
```

## 🔧 Configuration

### TypeScript
Configured in strict mode for maximum type safety. See `tsconfig.json`.

### ESLint & Prettier
Pre-configured for Svelte, TypeScript, and Tailwind CSS. See `eslint.config.js` and `.prettierrc`.

### PWA Manifest
Edit `static/manifest.json` to customize:
- App name and description
- Theme colors
- Display mode
- Icons

### Service Worker
The service worker (`src/service-worker.ts`) handles:
- Asset caching
- Update notifications
- Offline fallbacks

Customize caching strategies as needed for your app.

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Deploy** - Zero configuration needed!
3. **PWA features work automatically**

The Vercel adapter is pre-configured for optimal PWA performance.

### Other Platforms

For other platforms, you may need to:
1. Change the adapter in `svelte.config.js`
2. Adjust service worker paths if needed
3. Ensure static assets are served correctly

## 📁 Project Structure

```
├── src/
│   ├── app.html              # HTML template with PWA meta tags
│   ├── app.css               # Global styles & Tailwind imports
│   ├── service-worker.ts     # PWA service worker
│   ├── lib/
│   │   ├── components/       # Reusable components
│   │   │   └── PWAPrompts.svelte
│   │   └── stores/           # Svelte stores
│   │       └── pwa.ts        # PWA state management
│   └── routes/               # SvelteKit routes
│       ├── +layout.svelte    # Root layout
│       └── +page.svelte      # Homepage
├── static/                   # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── favicon.svg           # App icon
│   └── icons-needed.md       # PWA icon requirements
├── tests/                    # Test files
└── package.json              # Dependencies & scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [SvelteKit](https://svelte.dev/docs/kit) team for the amazing framework
- [shadcn-svelte](https://www.shadcn-svelte.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Vercel](https://vercel.com/) for seamless deployment
