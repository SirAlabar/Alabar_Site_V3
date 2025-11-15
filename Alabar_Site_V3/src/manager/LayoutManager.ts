/**
 * LayoutManager - Handles rendering different layout types
 * Includes special 'pixi' layout for canvas-based content
 */

import { BaseComponent } from '@components/BaseComponent';
import { Layout } from '@components/common/Layout';
import { getPixiAppState, navigatePixiContent } from '@pixi/PixiInitializer';

// Module-level variables
let layout: Layout;

/**
 * Initialize layout manager
 */
export function initLayoutManager(): void {
  layout = new Layout();
}

/**
 * Render default layout (with header)
 */
export function renderDefault(component: BaseComponent): void {
  const headerMount = document.querySelector('#header-mount');
  const contentMount = document.querySelector('#content-mount');

  // Only mount layout if structure doesn't exist
  if (!headerMount || !contentMount) {
    layout.mount('#app');
  }

  // Mount content to existing #content-mount slot
  const contentMountAfter = document.querySelector('#content-mount');
  if (contentMountAfter) {
    contentMountAfter.setAttribute('data-route-content', 'true');

    const isHomePage = component.constructor.name === 'HomePage';

    if (isHomePage) {
      contentMountAfter.className = '';
      const pageContent = layout.renderPageSection(
        'page-content',
        component.render(),
        true
      );
      contentMountAfter.innerHTML = pageContent;
    } else {
      contentMountAfter.className = 'flex-1 flex flex-col pt-20';
      contentMountAfter.innerHTML = layout.renderPageSection(
        'page-content',
        component.render(),
        false
      );
    }
  }

  // Call component mount if it exists
  if (typeof component.mount === 'function') {
    component.mount('#content-mount');
  }
}

/**
 * Render PIXI layout (canvas-based content)
 * This is the special layout that works with PIXI containers
 */
export function renderPixi(component: BaseComponent, page: string, subpage: string | null = null): void {
  const app = document.querySelector('#app')!;

  // Check if PIXI is initialized
  const pixiState = getPixiAppState();
  if (!pixiState.isInitialized) {
    console.error('PIXI not initialized yet');
    return;
  }

  // Clear app container (keep pixi-mount separate)
  app.innerHTML = `
    <div class="h-screen w-screen" data-route-content="true">
      <!-- PIXI canvas is in #pixi-mount -->
    </div>
  `;

  // Navigate PIXI content
  navigatePixiContent(page, subpage);

  // Call component mount if needed (for DOM overlays)
  if (typeof component.mount === 'function') {
    component.mount('#app');
  }
}

/**
 * Render game layout (fullscreen, no header)
 */
export function renderGame(component: BaseComponent): void {
  const app = document.querySelector('#app')!;

  app.innerHTML = `
    <div class="h-screen overflow-hidden" data-route-content="true">
      <main class="h-full">
        <div id="game-content" class="h-full"></div>
      </main>
    </div>
  `;

  mountComponent(component, '#game-content');
}

/**
 * Render minimal layout (no navigation, just content)
 */
export function renderMinimal(component: BaseComponent): void {
  const app = document.querySelector('#app')!;

  app.innerHTML = `
    <div class="min-h-screen bg-rpg-darker" data-route-content="true">
      <div id="minimal-content" class="min-h-screen flex items-center justify-center"></div>
    </div>
  `;

  mountComponent(component, '#minimal-content');
}

/**
 * Mount component helper
 */
function mountComponent(component: BaseComponent, selector: string): void {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container ${selector} not found`);
    return;
  }

  // Render component HTML
  container.innerHTML = component.render();

  // Call mount if component has it
  if (typeof component.mount === 'function') {
    component.mount(selector);
  }
}

/**
 * Show loading screen
 */
export function showLoading(): void {
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
export function hideLoading(): void {
  const loading = document.querySelector('#layout-loading');
  if (loading) {
    loading.remove();
  }
}

/**
 * Show 404 page
 */
export function show404(): void {
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
