/**
 * Router - History API based routing (no hash)
 * Handles clean URLs: /, /about, /projects/42, etc.
 */

import { BaseComponent } from '../components/BaseComponent';

interface Route
{
  path: string;
  component: () => BaseComponent;
  exact?: boolean;
}

export class Router
{
  private static instance: Router;
  private routes: Route[] = [];
  private currentPath: string = '';
  private currentComponent: BaseComponent | null = null;
  
  private constructor() {}
  
  static getInstance(): Router
  {
    if (!Router.instance)
    {
      Router.instance = new Router();
    }
    return Router.instance;
  }
  
  /**
   * Initialize router and set up listeners
   */
  initialize(): void
  {
    // Register routes
    this.registerRoutes();
    
    // Listen for browser back/forward
    window.addEventListener('popstate', () =>
    {
      this.handleRoute();
    });
    
    // Listen for internal navigation clicks
    this.attachLinkListeners();
    
    // Handle initial route
    this.handleRoute();
    
    console.log('Router initialized');
  }
  
  /**
   * Register all application routes
   */
  private registerRoutes(): void
  {
    this.routes = [
      // Home
      {
        path: '/',
        component: () => this.loadPage('HomePage'),
        exact: true
      },
      // About
      {
        path: '/about',
        component: () => this.loadPage('AboutPage'),
        exact: true
      },
      // Contact
      {
        path: '/contact',
        component: () => this.loadPage('ContactPage'),
        exact: true
      },
      // Projects - Main
      {
        path: '/projects',
        component: () => this.loadPage('ProjectsPage'),
        exact: true
      },
      // Projects - 42 School
      {
        path: '/projects/42',
        component: () => this.loadPage('Projects42Page'),
        exact: true
      },
      // Projects - Web
      {
        path: '/projects/web',
        component: () => this.loadPage('ProjectsWebPage'),
        exact: true
      },
      // Projects - Mobile
      {
        path: '/projects/mobile',
        component: () => this.loadPage('ProjectsMobilePage'),
        exact: true
      },
      // Projects - Games
      {
        path: '/projects/games',
        component: () => this.loadPage('ProjectsGamesPage'),
        exact: true
      }
    ];
  }
  
  /**
   * Navigate to a new route
   */
  navigateTo(path: string): void
  {
    // Update browser history
    window.history.pushState({}, '', path);
    
    // Handle the route
    this.handleRoute();
  }
  
  /**
   * Handle current route
   */
  private handleRoute(): void
  {
    const path = window.location.pathname;
    this.currentPath = path;
    
    // Find matching route
    const route = this.findRoute(path);
    
    if (route)
    {
      this.loadRoute(route);
    }
    else
    {
      // 404 - Not Found
      this.load404();
    }
  }
  
  /**
   * Find route that matches path
   */
  private findRoute(path: string): Route | null
  {
    for (const route of this.routes)
    {
      if (route.exact)
      {
        // Exact match
        if (route.path === path)
        {
          return route;
        }
      }
      else
      {
        // Prefix match
        if (path.startsWith(route.path))
        {
          return route;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Load a route's component
   */
  private loadRoute(route: Route): void
  {
    // Cleanup previous component
    if (this.currentComponent && this.currentComponent.cleanup)
    {
      this.currentComponent.cleanup();
    }
    else if (this.currentComponent && this.currentComponent.dispose)
    {
      this.currentComponent.dispose();
    }
    
    // Load new component
    this.currentComponent = route.component();
    
    // Mount to content area
    this.mountComponent(this.currentComponent);
    
    console.log(`Route: ${route.path}`);
  }
  
  /**
   * Load 404 page
   */
  private load404(): void
  {
    console.warn(`Route not found: ${this.currentPath}`);
    
    // Cleanup previous component
    if (this.currentComponent && this.currentComponent.cleanup)
    {
      this.currentComponent.cleanup();
    }
    
    // Load 404 component
    this.currentComponent = this.loadPage('NotFoundPage');
    this.mountComponent(this.currentComponent);
  }
  
  /**
   * Mount component to DOM
   */
  private mountComponent(component: BaseComponent): void
  {
    const contentMount = document.getElementById('content-mount');
    
    if (!contentMount)
    {
      console.error('Content mount element not found');
      return;
    }
    
    // Render component HTML
    contentMount.innerHTML = component.render();
    
    // Call mount lifecycle if exists
    if (component.mount)
    {
      component.mount('#content-mount');
    }
  }
  
  /**
   * Lazy load page component (placeholder for now)
   */
  private loadPage(pageName: string): BaseComponent
  {
    // TODO: Import actual page components when they exist
    // For now, return a simple placeholder component
    
    return {
      render: () => `
        <div class="min-h-screen flex items-center justify-center bg-rpg-darker text-rpg-text">
          <div class="text-center">
            <h1 class="font-pixel text-4xl text-rpg-accent mb-4">${pageName}</h1>
            <p class="font-game text-lg">This page is under construction.</p>
            <a href="/" data-link class="inline-block mt-6 px-6 py-3 bg-rpg-accent text-rpg-darker font-pixel rounded hover:bg-rpg-accent-hover transition-colors">
              â† Back to Home
            </a>
          </div>
        </div>
      `
    };
  }
  
  /**
   * Attach listeners to all navigation links
   */
  private attachLinkListeners(): void
  {
    document.addEventListener('click', (e: MouseEvent) =>
    {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]') as HTMLAnchorElement;
      
      if (link)
      {
        e.preventDefault();
        const href = link.getAttribute('href');
        
        if (href)
        {
          this.navigateTo(href);
        }
      }
    });
  }
  
  /**
   * Get current path
   */
  getCurrentPath(): string
  {
    return this.currentPath;
  }
  
  /**
   * Cleanup
   */
  destroy(): void
  {
    if (this.currentComponent && this.currentComponent.cleanup)
    {
      this.currentComponent.cleanup();
    }
    
    // Remove event listeners would go here
    window.removeEventListener('popstate', () => this.handleRoute());
  }
}