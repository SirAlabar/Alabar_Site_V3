/**
 * LayoutManager - Handles rendering different layout types
 */

import { BaseComponent } from '../components/BaseComponent';
import { Layout } from '../components/common/Layout';


// Module-level variables
let layout: Layout;

/**
 * Initialize layout manager
 */
export function initLayoutManager(): void
{
  layout = new Layout();
}

/**
 * Mount the basic layout structure
 * Creates #header-mount and #content-mount containers
 */
export function mountLayout(): void
{
  const headerMount = document.querySelector('#header-mount');
  const contentMount = document.querySelector('#content-mount');

  // Only mount layout if structure doesn't exist
  if (!headerMount || !contentMount)
  {
    layout.mount('#app');
    console.log('✅ Layout structure created');
  }
}


export function renderDefault(component: BaseComponent): void
{
  const headerMount = document.querySelector('#header-mount');
  const contentMount = document.querySelector('#content-mount');

  // Only mount layout if structure doesn't exist
  if (!headerMount || !contentMount)
  {
    layout.mount('#app');
  }

  // Mount content to existing #content-mount slot
  const contentMountAfter = document.querySelector('#content-mount');
  if (contentMountAfter)
  {
    contentMountAfter.setAttribute('data-route-content', 'true');

    const isHomePage = component.constructor.name === 'HomePage';

    if (isHomePage)
    {
      contentMountAfter.className = '';
      const pageContent = layout.renderPageSection(
        'page-content',
        component.render(),
        true
      );
      contentMountAfter.innerHTML = pageContent;
    }
    else
    {
      contentMountAfter.className = 'flex-1 flex flex-col';
      contentMountAfter.innerHTML = layout.renderPageSection(
        'page-content',
        component.render(),
        false
      );
    }
  }

  // Call component mount if it exists
  if (typeof component.mount === 'function')
  {
    component.mount('#content-mount');
  }
}


/**
 * Show loading screen
 */
export function showLoading(): void
{
  const loading = document.createElement('div');
  loading.id = 'layout-loading';
  loading.className = 'fixed inset-0 bg-rpg-darker/90 flex items-center justify-center z-50';
  loading.innerHTML = `
    <div class="text-center">
      <div class="font-pixel text-2xl mb-4 animate-pixel-blink text-rpg-accent">
        LOADING...
      </div>
      <div class="w-64 h-4 bg-rpg-dark rounded-full overflow-hidden">
        <div class="h-full bg-rpg-accent animate-pulse"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loading);
}

/**
 * Hide loading screen
 */
export function hideLoading(): void
{
  const loading = document.querySelector('#layout-loading');
  if (loading)
  {
    loading.remove();
  }
}

/**
 * Show 404 page
 */
export function show404(): void
{
  const app = document.querySelector('#app')!;
  app.innerHTML = `
    <div class="min-h-screen bg-rpg-darker flex items-center justify-center" data-route-content="true">
      <div class="text-center">
        <h1 class="font-pixel text-6xl text-rpg-accent mb-4">404</h1>
        <p class="font-game text-xl text-gray-400 mb-8">Page not found</p>
        <a href="#/" data-link class="btn-pixel">
          RETURN HOME
        </a>
      </div>
    </div>
  `;
}

// Initialize when first imported
initLayoutManager();