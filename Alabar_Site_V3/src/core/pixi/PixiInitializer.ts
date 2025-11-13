/**
 * PixiInitializer - Initializes PIXI Application and all managers
 * This is the bridge between the router and the PIXI canvas system
 */

import { Application, Container } from 'pixi.js';
import type { RenderGroups, PageGroups, PixiAppState } from '@core/types';
import { createAssetManager, type AssetManager } from './managers/AssetManager';
import { createContentManager, type ContentManager } from './managers/ContentManager';
import { LoadingUI } from './loading/LoadingUI';

// Global state for PIXI app
const pixiState: PixiAppState = {
  app: null,
  isInitialized: false,
  renderGroups: null
};

// Global managers
let assetManager: AssetManager | null = null;
let contentManager: ContentManager | null = null;
let loadingUI: LoadingUI | null = null;

/**
 * Initialize PIXI Application and load assets
 */
export async function initPixiApp(): Promise<void> {
  if (pixiState.isInitialized) {
    console.log('PIXI app already initialized');
    return;
  }

  console.log('Initializing PIXI application...');

  // Create loading UI
  loadingUI = new LoadingUI();

  // Create asset manager
  assetManager = createAssetManager();

  // Setup callbacks
  assetManager.onProgress = (progress: number) => {
    if (loadingUI) {
      loadingUI.updateProgress(progress);
    }
  };

  assetManager.onComplete = async () => {
    await onAssetsLoaded();
  };

  // Start loading
  await assetManager.loadAllAssets();
}

/**
 * Called when all assets are loaded
 */
async function onAssetsLoaded(): Promise<void> {
  console.log('Assets loaded, initializing PIXI application...');

  if (!loadingUI) return;

  // Show completion
  await loadingUI.showComplete();

  // Initialize PIXI app
  await setupPixiApplication();

  // Hide loading screen
  loadingUI.hide();

  pixiState.isInitialized = true;
  console.log('PIXI application fully initialized');
}

/**
 * Setup PIXI Application and managers
 */
async function setupPixiApplication(): Promise<void> {
  const pixiMount = document.getElementById('pixi-mount');
  if (!pixiMount) {
    console.error('Pixi mount point not found');
    return;
  }

  // Create PIXI application
  const app = new Application();
  await app.init({
    background: 0x000000,
    backgroundAlpha: 0,
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1
  });

  pixiState.app = app;

  // Mount canvas
  pixiMount.appendChild(app.canvas);

  // Create render groups
  const renderGroups = createRenderGroups(app);
  pixiState.renderGroups = renderGroups;

  // Initialize ContentManager
  if (assetManager) {
    contentManager = createContentManager(
      app,
      renderGroups.contentGroup,
      renderGroups.pageGroups,
      assetManager
    );

    // Make contentManager globally accessible
    (window as any).contentManager = contentManager;
  }

  // Setup resize handler
  window.addEventListener('resize', () => {
    if (app.renderer) {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    }
  });

  console.log('PIXI Application setup complete');
}

/**
 * Create render groups for PIXI
 */
function createRenderGroups(app: Application): RenderGroups {
  // Background group
  const backgroundGroup = new Container();
  backgroundGroup.label = 'backgroundGroup';
  backgroundGroup.zIndex = 0;

  // Content group
  const contentGroup = new Container();
  contentGroup.label = 'contentGroup';
  contentGroup.zIndex = 10;
  contentGroup.sortableChildren = true;

  // Main page containers
  const homeContent = new Container();
  homeContent.label = 'homeContent';
  homeContent.visible = true;

  const aboutContent = new Container();
  aboutContent.label = 'aboutContent';
  aboutContent.visible = false;

  const contactContent = new Container();
  contactContent.label = 'contactContent';
  contactContent.visible = false;

  const notFound404Content = new Container();
  notFound404Content.label = 'notFound404Content';
  notFound404Content.visible = false;

  // Projects main container
  const projectsContent = new Container();
  projectsContent.label = 'projectsContent';
  projectsContent.visible = false;
  projectsContent.sortableChildren = true;

  // Project sub-containers
  const projects42Content = new Container();
  projects42Content.label = 'projects42Content';
  projects42Content.visible = false;

  const projectsWebContent = new Container();
  projectsWebContent.label = 'projectsWebContent';
  projectsWebContent.visible = false;

  const projectsMobileContent = new Container();
  projectsMobileContent.label = 'projectsMobileContent';
  projectsMobileContent.visible = false;

  const projectsGamesContent = new Container();
  projectsGamesContent.label = 'projectsGamesContent';
  projectsGamesContent.visible = false;

  // Add project sub-containers to projects main
  projectsContent.addChild(projects42Content);
  projectsContent.addChild(projectsWebContent);
  projectsContent.addChild(projectsMobileContent);
  projectsContent.addChild(projectsGamesContent);

  // Add main containers to content group
  contentGroup.addChild(homeContent);
  contentGroup.addChild(aboutContent);
  contentGroup.addChild(contactContent);
  contentGroup.addChild(projectsContent);
  contentGroup.addChild(notFound404Content);

  // UI group
  const uiGroup = new Container();
  uiGroup.label = 'uiGroup';
  uiGroup.zIndex = 999;

  // Add all groups to stage
  app.stage.addChild(backgroundGroup);
  app.stage.addChild(contentGroup);
  app.stage.addChild(uiGroup);

  app.stage.sortableChildren = true;
  app.stage.sortChildren();

  const pageGroups: PageGroups = {
    homeContent,
    aboutContent,
    contactContent,
    notFound404Content,
    projectsContent,
    projects42Content,
    projectsWebContent,
    projectsMobileContent,
    projectsGamesContent
  };

  return {
    backgroundGroup,
    contentGroup,
    pageGroups,
    uiGroup
  };
}

/**
 * Get PIXI app state
 */
export function getPixiAppState(): PixiAppState {
  return pixiState;
}

/**
 * Get ContentManager
 */
export function getContentManager(): ContentManager | null {
  return contentManager;
}

/**
 * Navigate PIXI content
 */
export function navigatePixiContent(page: string, subpage: string | null = null): void {
  if (contentManager) {
    contentManager.navigateTo(page, subpage);
  } else {
    console.warn('ContentManager not initialized yet');
  }
}
