# Claude Code Instructions

This document contains specific instructions for Claude Code when working on this SvelteKit PWA Boilerplate project.

## Project Overview

This is a modern, opinionated Progressive Web App (PWA) boilerplate built with:

- **SvelteKit 2.0** with **Svelte 5** (runes) and **TypeScript strict mode**
- **Tailwind CSS 4.0** with **shadcn-svelte** UI components
- **Native PWA implementation** (without VitePWA)
- **pnpm** as package manager
- **Node.js 22** (use `fnm use 22`)

## Code Standards & Preferences

### Code Style

- **No semicolons** (configured in Prettier)
- **2 spaces indentation** (not tabs)
- **TypeScript strict mode** - always maintain type safety
- **SIMPLE solutions** - avoid overengineering
- **Only minimal comments** unless explicitly requested
- **No Emojis**

### Package Management

- **Always use `pnpm`** instead of npm or yarn
- **Never use `npx`** - use `pnpm dlx` instead
- **Node.js 22** - ensure `fnm use 22` is active

### Interactive Commands

- **NEVER run interactive commands** - always ask user to run them
- Interactive commands include:
  - `pnpm create svelte`
  - `pnpm dlx shadcn-svelte@latest init`
  - `pnpm dev` (development server)
  - `pnpm preview` (preview server)
  - Any command that starts a server
  - Any deployment commands
- Always tell the user what options to select for interactive commands

### File Organization

- Keep components in `src/lib/components/`
- Keep stores in `src/lib/stores/`
- Keep utilities in `src/lib/utils/`
- PWA-related files in `src/` root (service-worker.ts)
- Static assets in `static/`

### PWA Implementation

- **Use native SvelteKit service workers** (no VitePWA)
- **Vercel-optimized** caching strategies
- **Seamless updates** - no "double refresh" problem
- **Install prompts** and offline support
- Service worker should use SvelteKit's `$service-worker` module with `build`, `files`, `prerendered`, `version`

## Development Workflow

### Available Scripts

```bash
pnpm dev          # Start dev server (user runs this)
pnpm build        # Build for production
pnpm preview      # Preview build (user runs this)
pnpm test         # Run all tests
pnpm test:unit    # Unit tests
pnpm test:e2e     # E2E tests
pnpm lint         # Lint code
pnpm format       # Format code
pnpm check        # TypeScript check
pnpm icons:generate # Generate PWA icons from favicon.svg
```

### Git Workflow

- Always initialize git repository
- Use conventional commit messages
- Include "🤖 Generated with Claude Code" in commit footer
- Commit frequently with meaningful messages

### Testing

- **Playwright** for E2E tests
- **Vitest** for unit and component tests
- Always check if tests pass before committing
- Run `pnpm lint`, `pnpm check` and `pnpm build` before final commits

## Technology-Specific Guidelines

### SvelteKit & Svelte 5

- Use **runes** (`$state`, `$derived`, `$effect`) instead of legacy reactive declarations
- Prefer `let { children } = $props()` over `$$slots`
- Use `{@render children?.()}` for slot rendering
- Keep service worker in `src/service-worker.ts`

### Tailwind CSS

- Use **Tailwind CSS 4.0** features
- Configure for production optimization
- Use utility classes, avoid custom CSS when possible
- Dark mode support ready but not implemented by default

### shadcn-svelte

- Add components with `pnpm dlx shadcn-svelte@latest add <component>`
- Components are in `src/lib/components/ui/`
- Use tree-shakeable imports
- Customize components as needed

### TypeScript

- **Strict mode always enabled**
- Use proper typing for all functions and components
- No `any` types - use proper interfaces
- Type all props with `$props<{...}>()`

## PWA Requirements

### Service Worker

- Use SvelteKit's native service worker implementation
- Cache app shell, static files, and prerendered pages
- Implement smart update mechanism (no double refresh)
- Handle offline scenarios gracefully

### Manifest & Icons

- Complete `manifest.json` with all required fields
- Generate icons with `pnpm run icons:generate`
- Include all necessary meta tags in `app.html`
- Support install prompts and app-like behavior

### Update System

- Automatic update detection
- User-friendly update prompts
- Seamless background updates
- Handle Vercel deployment updates correctly

## Deployment

### Vercel (Primary)

- **@sveltejs/adapter-vercel** is pre-configured
- Zero-config deployment
- PWA features work automatically
- Optimized for Vercel's edge network

### Other Platforms

- May need adapter changes in `svelte.config.js`
- Ensure service worker paths are correct
- Verify static asset serving

## Common Pitfalls to Avoid

1. **Don't use VitePWA** - use native SvelteKit service workers
2. **Don't run interactive commands** - always ask user
3. **Don't add unnecessary dependencies** - keep it simple
4. **Don't break TypeScript strict mode** - maintain type safety
5. **Don't create overengineered solutions** - prefer simplicity
6. **Don't forget to test PWA features** in production builds
7. **Don't commit without running linting and type checking**

## When Making Changes

1. **Read this file first** to understand project structure
2. **Maintain existing patterns** and conventions
3. **Test thoroughly** especially PWA functionality
4. **Update documentation** if adding new features
5. **Use the todo system** for complex multi-step tasks
6. **Follow semantic commit conventions**
7. **Always commit changes** after successful completion:
   - Run `git add -A && git commit -m "descriptive message"`
   - Include "🤖 Generated with Claude Code" in commit footer
   - Use conventional commit format (fix:, feat:, refactor:, etc.)

## Emergency Recovery

If something breaks:

1. Check `pnpm check` for TypeScript errors
2. Run `pnpm lint` for style issues
3. Verify service worker syntax in browser DevTools
4. Test PWA installation and updates manually
5. Check Vercel deployment logs if deployed

---

**Remember**: This is an opinionated boilerplate focused on simplicity, modern practices, and excellent PWA functionality. Maintain this philosophy in all changes and additions.
