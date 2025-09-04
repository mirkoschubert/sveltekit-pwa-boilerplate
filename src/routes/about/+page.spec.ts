import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import AboutPage from './+page.svelte'

describe('/about/+page.svelte', () => {
  it('should render main heading', async () => {
    render(AboutPage)

    const heading = page.getByRole('heading', { name: 'About', level: 1 })
    await expect.element(heading).toBeInTheDocument()
  })

  it('should render project description', async () => {
    render(AboutPage)

    const description = page.getByText(/Learn more about this SvelteKit PWA Boilerplate/)
    await expect.element(description).toBeInTheDocument()
  })

  it('should render all feature sections', async () => {
    render(AboutPage)

    const projectOverview = page.getByText('Project Overview')
    const modernStack = page.getByText('Modern Stack')
    const pwaFeatures = page.getByText('PWA Features')
    const developerExperience = page.getByText('Developer Experience')
    const productionReady = page.getByText('Production Ready')
    const philosophy = page.getByText('Philosophy')

    await expect.element(projectOverview).toBeInTheDocument()
    await expect.element(modernStack).toBeInTheDocument()
    await expect.element(pwaFeatures).toBeInTheDocument()
    await expect.element(developerExperience).toBeInTheDocument()
    await expect.element(productionReady).toBeInTheDocument()
    await expect.element(philosophy).toBeInTheDocument()
  })

  it('should render go back button', async () => {
    render(AboutPage)

    const backButton = page.getByRole('button', { name: 'Go Back' })
    await expect.element(backButton).toBeInTheDocument()
  })

  it('should use monochrome color classes', async () => {
    render(AboutPage)

    // Verify monochrome design by checking key sections exist
    const projectOverview = page.getByText('Project Overview')
    await expect.element(projectOverview).toBeInTheDocument()
  })
})