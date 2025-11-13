/**
 * Router - Main routing system with PIXI content support
 * Adapted from Transcendence router with hybrid DOM + PIXI capabilities
 */

import {
  renderDefault,
  renderPixi,
  renderGame,
  renderMinimal,
  showLoading,
  hideLoading,
  show404
} from './LayoutManager';
import { mountHeader, setupGameHeaderEvents } from './HeaderManager';
import type { RouteConfig, RouteConfigMap } from '@core/types';

/**
 * Singleton RouterState
 */
class RouterState {
  private static instance: RouterState;

  public currentRoute: any = null;
  public isInitialized = false;
  public isNavigating = false;

  private currentPageInstance: any = null;
  private clickListener: ((e: Event) => void) | null = null;
  private hashChangeListener: ((e: HashChangeEvent) => void) | null = null;

  private constructor() {}

  static getInstance(): RouterState {
    if (!RouterState.instance) {
      RouterState.instance = new RouterState();
    }
    return RouterState.instance;
  }

  setCurrentPageInstance(instance: any): void {
    this.currentPageInstance = instance;
  }

  cleanupCurrentPage(): void {
    if (this.currentPageInstance) {
      if (typeof this.currentPageInstance.dispose === 'function') {
        this.currentPageInstance.dispose();
      } else if (typeof this.currentPageInstance.cleanup === 'function') {
        this.currentPageInstance.cleanup();
      }
      this.currentPageInstance = null;
    }
  }

  cleanup(): void {
    this.cleanupCurrentPage();

    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
      this.clickListener = null;
    }

    if (this.hashChangeListener) {
      window.removeEventListener('hashchange', this.hashChangeListener);
      this.hashChangeListener = null;
    }
  }

  setEventListeners(
    clickListener: (e: Event) => void,
    hashChangeListener: (e: HashChangeEvent) => void
  ): void {
    this.cleanup();
    this.clickListener = clickListener;
    this.hashChangeListener = hashChangeListener;
    document.addEventListener('click', clickListener);
    window.addEventListener('hashchange', hashChangeListener);
  }
}

/**
 * Route configuration
 */
const routeConfig: RouteConfigMap = {
  '/': {
    component: () => import('@pages/HomePage'),
    title: 'Home - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/about': {
    component: () => import('@pages/AboutPage'),
    title: 'About - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/contact': {
    component: () => import('@pages/ContactPage'),
    title: 'Contact - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/projects/42': {
    component: () => import('@pages/Projects42Page'),
    title: '42 Projects - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/projects/web': {
    component: () => import('@pages/ProjectsWebPage'),
    title: 'Web Projects - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/projects/mobile': {
    component: () => import('@pages/ProjectsMobilePage'),
    title: 'Mobile Projects - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/projects/games': {
    component: () => import('@pages/ProjectsGamesPage'),
    title: 'Game Projects - Alabar',
    layout: 'pixi',
    headerType: 'default'
  },
  '/404': {
    component: () => import('@pages/NotFoundPage'),
    title: '404 - Alabar',
    layout: 'pixi',
    headerType: 'none'
  }
};

// Get singleton instance
const routerState = RouterState.getInstance();

/**
 * Get current path from hash
 */
function getCurrentPath(): string {
  const hash = window.location.hash.slice(1); // Remove '#'
  return hash || '/';
}

/**
 * Parse route and extract page/subpage for PIXI
 */
function parseRoutePath(path: string): { page: string; subpage: string | null } {
  const cleanPath = path.replace(/^\//, '');
  const segments = cleanPath.split('/');

  if (segments.length === 0 || segments[0] === '') {
    return { page: 'home', subpage: null };
  }

  if (segments[0] === 'projects' && segments[1]) {
    return { page: 'projects', subpage: segments[1] };
  }

  if (segments[0] === '404') {
    return { page: '404', subpage: null };
  }

  return { page: segments[0], subpage: null };
}

/**
 * Parse route config
 */
function parseRoute(path: string): RouteConfig {
  // Try exact match
  if (routeConfig[path]) {
    return routeConfig[path];
  }

  // Return 404
  return routeConfig['/404'];
}

/**
 * Main navigation function
 */
export async function navigateTo(path: string): Promise<void> {
  if (routerState.isNavigating) {
    return;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (routerState.currentRoute && routerState.currentRoute.path === cleanPath) {
    return;
  }

  routerState.isNavigating = true;
  routerState.cleanupCurrentPage();

  const route = parseRoute(cleanPath);
  const { page, subpage } = parseRoutePath(cleanPath);

  document.title = route.title;

  // Update hash
  if (window.location.hash !== `#${cleanPath}`) {
    window.location.hash = cleanPath;
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

  try {
    showLoading();

    const moduleImport = await route.component();
    const ComponentClass = moduleImport.default || moduleImport;
    const component = new ComponentClass();

    routerState.setCurrentPageInstance(component);

    // Render with appropriate layout
    renderWithLayout(component, route.layout, page, subpage);

    // Mount header
    mountHeader(route.headerType, '#header-mount');

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    requestAnimationFrame(() => {
      setupGameHeaderEvents();
      updateActiveNavLinks();
    });

    routerState.currentRoute = { ...route, path: cleanPath };
  } catch (error) {
    console.error('Error during navigation:', error);
    show404();
  } finally {
    hideLoading();
    routerState.isNavigating = false;
  }
}

/**
 * Render with layout - handles both DOM and PIXI layouts
 */
function renderWithLayout(
  component: any,
  layoutType: string,
  page: string,
  subpage: string | null
): void {
  switch (layoutType) {
    case 'pixi':
      renderPixi(component, page, subpage);
      break;
    case 'game':
      renderGame(component);
      break;
    case 'minimal':
      renderMinimal(component);
      break;
    default:
      renderDefault(component);
  }
}

/**
 * Update active nav links
 */
function updateActiveNavLinks(): void {
  const currentPath = getCurrentPath();

  document.querySelectorAll('[data-link]').forEach(link => {
    const href = link.getAttribute('href');

    if (!href) {
      return;
    }

    const linkPath = href.replace('#', '');

    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Handle link clicks
 */
function handleLinkClick(e: Event): void {
  const target = e.target as HTMLElement;

  if (!target) {
    return;
  }

  const link = target.closest('a') as HTMLAnchorElement;

  if (!link) {
    return;
  }

  const href = link.getAttribute('href');

  if (!href) {
    return;
  }

  if (link.hasAttribute('data-link')) {
    e.preventDefault();
    e.stopPropagation();

    if (href && !routerState.isNavigating) {
      const path = href.replace('#', '');
      navigateTo(path);
    }
  }
}

/**
 * Handle hash change
 */
function handleHashChange(_e: HashChangeEvent): void {
  if (!routerState.isNavigating) {
    const path = getCurrentPath();
    navigateTo(path);
  }
}

/**
 * Initialize router
 */
export function initRouter(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initRouter());
    return;
  }

  // Prevent double initialization
  if (routerState.isInitialized) {
    return;
  }

  routerState.isInitialized = true;

  // Make router globally available
  (window as any).navigateTo = navigateTo;

  // Setup event listeners
  routerState.setEventListeners(handleLinkClick, handleHashChange);

  // Load initial page (don't navigate yet, PIXI needs to initialize first)
  const currentPath = getCurrentPath();
  const existingContent = document.querySelector('[data-route-content]');

  if (!existingContent) {
    setTimeout(() => {
      if (!routerState.currentRoute) {
        navigateTo(currentPath);
      }
    }, 100);
  }
}

/**
 * Get current route
 */
export function getCurrentRoute(): any {
  return routerState.currentRoute;
}

/**
 * Cleanup router (for testing/hot reload)
 */
export function destroyRouter(): void {
  routerState.cleanup();
  routerState.isInitialized = false;
  routerState.currentRoute = null;
  routerState.isNavigating = false;
}
