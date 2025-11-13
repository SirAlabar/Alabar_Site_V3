/**
 * ContentManager - Manages PIXI content for different pages
 * Handles view switching by showing/hiding PIXI containers
 */

import type { Application, Container } from 'pixi.js';
import type { PageGroups } from '@core/types';
import type { AssetManager } from './AssetManager';

type ViewInitializer = (container: Container, app: Application, assetManager?: AssetManager) => void;

export class ContentManager {
  private app: Application;
  private contentGroup: Container;
  private pageGroups: PageGroups;
  private assetManager: AssetManager;
  private currentPage: string = 'home';
  private currentSubpage: string | null = null;

  private initialized: Record<string, boolean> = {
    home: false,
    about: false,
    contact: false,
    projects: false,
    notFound: false,
    projects42: false,
    projectsWeb: false,
    projectsMobile: false,
    projectsGames: false
  };

  private views: Record<string, ViewInitializer> = {};

  constructor(
    app: Application,
    contentGroup: Container,
    pageGroups: PageGroups,
    assetManager: AssetManager
  ) {
    this.app = app;
    this.contentGroup = contentGroup;
    this.pageGroups = pageGroups;
    this.assetManager = assetManager;
  }

  /**
   * Initialize ContentManager
   */
  init(): this {
    console.log('ContentManager initialized');
    this.loadViewModules();
    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
    return this;
  }

  /**
   * Load all view modules
   */
  private async loadViewModules(): Promise<void> {
    try {
      // Dynamic imports for view modules
      const [
        homeModule,
        aboutModule,
        contactModule,
        notFoundModule,
        projects42Module,
        projectsWebModule,
        projectsMobileModule,
        projectsGamesModule
      ] = await Promise.all([
        import('@pixi/views/Home'),
        import('@pixi/views/About'),
        import('@pixi/views/Contact'),
        import('@pixi/views/NotFound'),
        import('@pixi/views/Projects42'),
        import('@pixi/views/ProjectsWeb'),
        import('@pixi/views/ProjectsMobile'),
        import('@pixi/views/ProjectsGames')
      ]);

      this.views = {
        home: homeModule.default,
        about: aboutModule.default,
        contact: contactModule.default,
        notFound: notFoundModule.default,
        projects42: projects42Module.default,
        projectsWeb: projectsWebModule.default,
        projectsMobile: projectsMobileModule.default,
        projectsGames: projectsGamesModule.default
      };

      console.log('View modules loaded');
    } catch (error) {
      console.error('Error loading view modules:', error);
    }
  }

  /**
   * Navigate to a specific page or subpage
   */
  navigateTo(page: string, subpage: string | null = null): this {
    // Handle project sub-routes
    if (page === 'projects' && subpage) {
      this.navigateToProjectSubpage(subpage);
      return this;
    }

    // Handle 404
    if (page === '404') {
      this.hideAllMainPages();
      if (!this.initialized.notFound) {
        this.init404Page();
      }
      this.pageGroups.notFound404Content.visible = true;
      this.currentPage = '404';
      this.currentSubpage = null;
      this.render();
      console.log('Navigated to 404 page');
      return this;
    }

    // Handle main page navigation
    const pageContentName = `${page}Content` as keyof PageGroups;
    if (!this.pageGroups[pageContentName]) {
      console.warn(`Page ${page} not found, showing 404`);
      return this.navigateTo('404');
    }

    this.hideAllMainPages();

    if (!this.initialized[page]) {
      this.initPage(page);
    }

    this.pageGroups[pageContentName].visible = true;
    this.currentPage = page;
    this.currentSubpage = null;
    this.render();

    console.log(`Navigated to ${page} page`);
    return this;
  }

  /**
   * Navigate to project subpage
   */
  private navigateToProjectSubpage(subpage: string): void {
    const subpageKey = `projects${subpage.charAt(0).toUpperCase()}${subpage.slice(1)}`;
    const subpageContentName = `${subpageKey}Content` as keyof PageGroups;

    if (!this.pageGroups[subpageContentName]) {
      console.warn(`Project subpage ${subpage} not found`);
      this.navigateTo('projects');
      return;
    }

    this.hideAllMainPages();
    this.pageGroups.projectsContent.visible = true;
    this.hideAllProjectSubpages();

    if (!this.initialized[subpageKey]) {
      this.initProjectSubpage(subpage, subpageKey);
    }

    this.pageGroups[subpageContentName].visible = true;
    this.currentPage = 'projects';
    this.currentSubpage = subpage;
    this.render();

    console.log(`Navigated to projects/${subpage} subpage`);
  }

  /**
   * Hide all main page containers
   */
  private hideAllMainPages(): void {
    const mainPages: (keyof PageGroups)[] = [
      'homeContent',
      'aboutContent',
      'contactContent',
      'projectsContent',
      'notFound404Content'
    ];
    
    mainPages.forEach(pageName => {
      if (this.pageGroups[pageName]) {
        this.pageGroups[pageName].visible = false;
      }
    });
  }

  /**
   * Hide all project subpage containers
   */
  private hideAllProjectSubpages(): void {
    const subPages: (keyof PageGroups)[] = [
      'projects42Content',
      'projectsWebContent',
      'projectsMobileContent',
      'projectsGamesContent'
    ];
    
    subPages.forEach(subPageName => {
      if (this.pageGroups[subPageName]) {
        this.pageGroups[subPageName].visible = false;
      }
    });
  }

  /**
   * Initialize page content
   */
  private initPage(page: string): void {
    if (this.initialized[page]) {
      return;
    }

    console.log(`Initializing ${page} page content`);

    const containerName = `${page}Content` as keyof PageGroups;
    const container = this.pageGroups[containerName];

    if (page === 'home') {
      // Home content is handled by GameInitializer
      this.initialized[page] = true;
      return;
    }

    const view = this.views[page];
    if (view) {
      view(container, this.app, this.assetManager);
    } else {
      console.warn(`No view found for ${page}`);
    }

    this.initialized[page] = true;
  }

  /**
   * Initialize project subpage
   */
  private initProjectSubpage(subpage: string, subpageKey: string): void {
    if (this.initialized[subpageKey]) {
      return;
    }

    console.log(`Initializing projects/${subpage} subpage content`);

    const containerName = `${subpageKey}Content` as keyof PageGroups;
    const container = this.pageGroups[containerName];
    const viewKey = `projects${subpage.charAt(0).toUpperCase()}${subpage.slice(1)}`;

    const view = this.views[viewKey];
    if (view) {
      view(container, this.app, this.assetManager);
    } else {
      console.warn(`No view module found for ${viewKey}`);
    }

    this.initialized[subpageKey] = true;
  }

  /**
   * Initialize 404 page
   */
  private init404Page(): void {
    if (this.initialized.notFound) {
      return;
    }

    const container = this.pageGroups.notFound404Content;
    container.removeChildren();

    const view = this.views.notFound;
    if (view) {
      view(container, this.app, this.assetManager);
    }

    this.initialized.notFound = true;
  }

  /**
   * Force render
   */
  private render(): void {
    this.contentGroup.sortChildren();
    if (this.pageGroups.projectsContent) {
      this.pageGroups.projectsContent.sortChildren();
    }
    this.app.renderer.render(this.app.stage);
  }

  /**
   * Handle resize
   */
  private onResize(): void {
    console.log('Resize event - delegating to view files');
    // Views handle their own responsive behavior
  }

  /**
   * Cleanup
   */
  destroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
    console.log('ContentManager destroyed');
  }
}

/**
 * Create and initialize a ContentManager
 */
export function createContentManager(
  app: Application,
  contentGroup: Container,
  pageGroups: PageGroups,
  assetManager: AssetManager
): ContentManager {
  return new ContentManager(app, contentGroup, pageGroups, assetManager).init();
}
