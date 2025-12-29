/**
 * Router.ts - History API based routing with dynamic imports
 * No hash routing - clean URLs: /, /about, /projects, etc.
 */

import { renderDefault } from '../managers/LayoutManager';
import { mountHeader } from '../managers/HeaderManager';

// Singleton router state
class RouterState
{
  private static instance: RouterState;
  
  public currentRoute: any = null;
  public isInitialized = false;
  public isNavigating = false;
  
  private currentPageInstance: any = null;
  private clickListener: ((e: Event) => void) | null = null;
  private popstateListener: ((e: PopStateEvent) => void) | null = null;
  
  private constructor()
  {}
  
  static getInstance(): RouterState
  {
    if (!RouterState.instance)
    {
      RouterState.instance = new RouterState();
    }
    return RouterState.instance;
  }
  
  setCurrentPageInstance(instance: any): void
  {
    this.currentPageInstance = instance;
  }
  
  cleanupCurrentPage(): void
  {
    if (this.currentPageInstance)
    {
      if (typeof this.currentPageInstance.dispose === 'function')
      {
        this.currentPageInstance.dispose();
      }
      else if (typeof this.currentPageInstance.cleanup === 'function')
      {
        this.currentPageInstance.cleanup();
      }
      else if (typeof this.currentPageInstance.destroy === 'function')
      {
        this.currentPageInstance.destroy();
      }
      this.currentPageInstance = null;
    }
  }
  
  cleanup(): void
  {
    this.cleanupCurrentPage();
    
    if (this.clickListener)
    {
      document.removeEventListener('click', this.clickListener);
      this.clickListener = null;
    }
    
    if (this.popstateListener)
    {
      window.removeEventListener('popstate', this.popstateListener);
      this.popstateListener = null;
    }
  }
  
  setEventListeners(clickListener: (e: Event) => void, popstateListener: (e: PopStateEvent) => void): void
  {
    this.cleanup();
    this.clickListener = clickListener;
    this.popstateListener = popstateListener;
    document.addEventListener('click', clickListener);
    window.addEventListener('popstate', popstateListener);
  }
}

// Route configuration with dynamic imports
const routeConfig: Record<string, any> =
{
  '/':
  {
    component: () => import('../pages/HomePage'),
    title: 'Home - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/about':
  {
    component: () => import('../pages/AboutPage'),
    title: 'About - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/contact':
  {
    component: () => import('../pages/ContactPage'),
    title: 'Contact - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/projects':
  {
    component: () => import('../pages/ProjectsPage'),
    title: 'Projects - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/projects/42':
  {
    component: () => import('../pages/ProjectsCorePage'),
    title: '42 School Projects - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/projects/web':
  {
    component: () => import('../pages/ProjectsWebPage'),
    title: 'Web Projects - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/projects/mobile':
  {
    component: () => import('../pages/ProjectsMobilePage'),
    title: 'Mobile Projects - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/projects/games':
  {
    component: () => import('../pages/ProjectsGamesPage'),
    title: 'Game Projects - ALABAR V3',
    layout: 'default',
    headerType: 'default'
  },
  '/404':
  {
    component: () => import('../pages/NotFoundPage'),
    title: '404 - Page Not Found',
    layout: 'default',
    headerType: 'default'
  }
};

// Get singleton instance
const routerState = RouterState.getInstance();

/**
 * Get current path without query params
 */
function getCurrentPath(): string
{
  return window.location.pathname || '/';
}

/**
 * Parse route - find matching route config
 */
function parseRoute(path: string): any
{
  // Try exact match first
  if (routeConfig[path])
  {
    return routeConfig[path];
  }
  
  // Return 404 if no match
  return routeConfig['/404'];
}

/**
 * Main navigation function
 */
export async function navigateTo(path: string): Promise<void>
{
  // Prevent concurrent navigation
  if (routerState.isNavigating)
  {
    return;
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const pathname = cleanPath.split('?')[0];
  
  // Skip if already on this route
  if (routerState.currentRoute && routerState.currentRoute.path === pathname)
  {
    return;
  }
  
  routerState.isNavigating = true;
  
  // Cleanup previous page
  routerState.cleanupCurrentPage();
  
  // Parse route
  const route = parseRoute(pathname);
  
  // Update document title
  document.title = route.title;
  
  // Update browser history
  if (window.location.pathname !== pathname)
  {
    window.history.pushState({ path: pathname }, '', pathname);
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  
  try
  {
    // Dynamic import the component
    const moduleImport = await route.component();
    const ComponentClass = moduleImport.default || moduleImport[Object.keys(moduleImport)[0]];
    
    // Create instance
    const component = new ComponentClass();
    
    // Store instance for cleanup
    routerState.setCurrentPageInstance(component);
    
    // Render with layout
    renderWithLayout(component, route.layout);
    
    // Mount header (if not game layout)
    if (route.layout !== 'game')
    {
      mountHeader(route.headerType, '#header-mount');
    }
    
    // Update active nav links
    requestAnimationFrame(() =>
    {
      updateActiveNavLinks();
    });
    
    // Store current route
    routerState.currentRoute = { ...route, path: pathname };
  }
  catch (error)
  {
    console.error('Navigation error:', error);
    
    // Show 404 on error
    show404();
  }
  finally
  {
    routerState.isNavigating = false;
  }
}

/**
 * Render component with specified layout
 */
function renderWithLayout(component: any, layoutType: string): void
{
  switch (layoutType)
  {
    case 'default':
      renderDefault(component);
      break;
    // TODO: Add other layout types when ready
    // case 'game':
    //   renderGame(component);
    //   break;
    default:
      renderDefault(component);
  }
}

/**
 * Update active navigation links
 */
function updateActiveNavLinks(): void
{
  const currentPath = getCurrentPath();
  
  document.querySelectorAll('[data-link]').forEach(link =>
  {
    const href = link.getAttribute('href');
    
    if (!href)
    {
      return;
    }
    
    if (href === currentPath)
    {
      link.classList.add('active');
    }
    else
    {
      link.classList.remove('active');
    }
  });
}

/**
 * Handle link clicks for SPA navigation
 */
function handleLinkClick(e: Event): void
{
  const target = e.target as HTMLElement;
  
  if (!target)
  {
    return;
  }
  
  const link = target.closest('a[data-link]') as HTMLAnchorElement;
  
  if (!link)
  {
    return;
  }
  
  const href = link.getAttribute('href');
  
  if (!href)
  {
    return;
  }
  
  // Prevent default and navigate
  e.preventDefault();
  e.stopPropagation();
  
  if (!routerState.isNavigating)
  {
    navigateTo(href);
  }
}

/**
 * Handle browser back/forward
 */
function handlePopState(_e: PopStateEvent): void
{
  if (!routerState.isNavigating)
  {
    const path = getCurrentPath();
    navigateTo(path);
  }
}

/**
 * Show 404 page
 */
function show404(): void
{
  const contentMount = document.getElementById('content-mount');
  
  if (!contentMount)
  {
    return;
  }
  
  contentMount.innerHTML = `
    <div class="min-h-screen flex items-center justify-center text-rpg-text">
      <div class="text-center">
        <h1 class="font-pixel text-6xl text-rpg-accent mb-4">404</h1>
        <p class="font-game text-xl text-gray-400 mb-8">Page not found</p>
        <a href="/" data-link class="inline-block px-6 py-3 bg-rpg-accent text-rpg-darker font-pixel rounded hover:bg-rpg-accent-hover transition-colors">
          ⚔️ Back to Home
        </a>
      </div>
    </div>
  `;
}

/**
 * Initialize router
 */
export function initRouter(): void
{
  // Prevent double initialization
  if (routerState.isInitialized)
  {
    return;
  }
  
  routerState.isInitialized = true;
  
  // Make router globally available
  (window as any).navigateTo = navigateTo;
  
  // Setup event listeners
  routerState.setEventListeners(handleLinkClick, handlePopState);
  
  // Load initial page
  const currentPath = getCurrentPath();
  const existingContent = document.querySelector('[data-route-content]');
  
  if (!existingContent)
  {
    setTimeout(() =>
    {
      if (!routerState.currentRoute)
      {
        navigateTo(currentPath);
      }
    }, 100);
  }
}

/**
 * Get current route
 */
export function getCurrentRoute(): any
{
  return routerState.currentRoute;
}

/**
 * Add new route dynamically
 */
export function addRoute(path: string, config: any): void
{
  routeConfig[path] = config;
}

/**
 * Destroy router (cleanup)
 */
export function destroyRouter(): void
{
  routerState.cleanup();
  routerState.isInitialized = false;
  routerState.currentRoute = null;
  routerState.isNavigating = false;
}

/**
 * Router singleton class for external use
 */
export class Router
{
  private static instance: Router;
  
  private constructor()
  {}
  
  static getInstance(): Router
  {
    if (!Router.instance)
    {
      Router.instance = new Router();
    }
    return Router.instance;
  }
  
  initialize(): void
  {
    initRouter();
  }
  
  navigateTo(path: string): void
  {
    navigateTo(path);
  }
  
  getCurrentRoute(): any
  {
    return getCurrentRoute();
  }
  
  destroy(): void
  {
    destroyRouter();
  }
}