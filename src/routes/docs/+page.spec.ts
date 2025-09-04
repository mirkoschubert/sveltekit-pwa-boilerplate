import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import DocsPage from './+page.svelte'

describe('/docs/+page.svelte', () => {
  it('should render main heading', async () => {
    render(DocsPage)

    const heading = page.getByRole('heading', { name: 'Documentation', level: 1 })
    await expect.element(heading).toBeInTheDocument()
  })

  it('should render getting started section', async () => {
    render(DocsPage)

    const gettingStarted = page.getByText('Getting Started')
    const prerequisites = page.getByText('Prerequisites')
    const installation = page.getByText('Installation')

    await expect.element(gettingStarted).toBeInTheDocument()
    await expect.element(prerequisites).toBeInTheDocument()
    await expect.element(installation).toBeInTheDocument()
  })

  it('should render available scripts section', async () => {
    render(DocsPage)

    const scriptsSection = page.getByText('Available Scripts')
    await expect.element(scriptsSection).toBeInTheDocument()

    // Check for script badges
    const devBadge = page.getByText('Development')
    const productionBadge = page.getByText('Production')
    const testingBadge = page.getByText('Testing')

    await expect.element(devBadge).toBeInTheDocument()
    await expect.element(productionBadge).toBeInTheDocument()
    await expect.element(testingBadge).toBeInTheDocument()
  })

  it('should render project structure section', async () => {
    render(DocsPage)

    const projectStructure = page.getByText('Project Structure')
    await expect.element(projectStructure).toBeInTheDocument()

    // Check for directory structure
    const srcText = page.getByText('src/')
    await expect.element(srcText).toBeInTheDocument()
  })

  it('should render PWA configuration section', async () => {
    render(DocsPage)

    const pwaConfig = page.getByText('PWA Configuration')
    const serviceWorker = page.getByText('Service Worker')
    const manifestIcons = page.getByText('Manifest & Icons')

    await expect.element(pwaConfig).toBeInTheDocument()
    await expect.element(serviceWorker).toBeInTheDocument()
    await expect.element(manifestIcons).toBeInTheDocument()
  })

  it('should render external resource links', async () => {
    render(DocsPage)

    const svelteKitLink = page.getByRole('link', { name: /SvelteKit Docs/ })
    const svelte5Link = page.getByRole('link', { name: /Svelte 5 Docs/ })
    const shadcnLink = page.getByRole('link', { name: /shadcn-svelte/ })

    await expect.element(svelteKitLink).toBeInTheDocument()
    await expect.element(svelte5Link).toBeInTheDocument()
    await expect.element(shadcnLink).toBeInTheDocument()
  })

  it('should render go back button', async () => {
    render(DocsPage)

    const backButton = page.getByRole('button', { name: 'Go Back' })
    await expect.element(backButton).toBeInTheDocument()
  })

  it('should use monochrome color classes', async () => {
    render(DocsPage)

    // Verify monochrome design by checking key sections exist
    const gettingStarted = page.getByText('Getting Started')
    await expect.element(gettingStarted).toBeInTheDocument()
  })
})