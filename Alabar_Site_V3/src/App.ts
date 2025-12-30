/**
 * App.ts - Main application singleton
 * Multi-App Architecture: Background, Game, Cursor layers
 * Game only initializes on home page
 */

import { Application, Container } from 'pixi.js';
import { initLayoutManager, mountLayout } from './managers/LayoutManager';
import { initHeaderManager, mountHeader } from './managers/HeaderManager';
import { AssetManager } from './managers/AssetManager';
import { LoadingUI } from './components/LoadingUI';
import { Router } from './router/Router';
import { SceneManager } from './managers/SceneManager';
import { CloudsManager } from './managers/CloudsManager';
import { CursorEffectComponent } from './components/CursorEffectComponent';
import { SiteGame } from '../src/game/core/SiteGame';

export class App
{
  private static instance: App;
  
  // Three separate PIXI applications
  private bgApp: Application | null = null;      // Layer 1: Backgrounds
  private gameApp: Application | null = null;    // Layer 2: Game
  private cursorApp: Application | null = null;  // Layer 3: Cursor FX
  
  private siteGame: SiteGame | null = null;  
  private assetManager: AssetManager | null = null;
  private loadingUI: LoadingUI | null = null;
  private router: Router | null = null;
  private sceneManager: SceneManager | null = null;
  private cursorEffect: CursorEffectComponent | null = null;
  private isInitialized = false;
  private gameInitialized = false;
  
  private constructor() {}
  
  static getInstance(): App
  {
    if (!App.instance)
    {
      App.instance = new App();
    }
    return App.instance;
  }
  
  async initialize(): Promise<void>
  {
    if (this.isInitialized)
    {
      console.warn('App already initialized');
      return;
    }
    
    try
    {
      // Show loading screen FIRST
      this.showLoading();

      // Initialize Layout Manager
      this.initLayout();

      // Initialize three PIXI applications
      await this.initPixiApps();
      
      // Load all assets with progress tracking
      await this.initAssets();
      
      // Show completion animation
      await this.loadingUI?.showComplete();
      
      // Initialize Header Manager
      this.initHeader();
      
      // Initialize Scene Manager (Backgrounds)
      this.initSceneManager();

      // Initialize Cursor Manager
      this.initCursorManager();

      // NOTE: Game is NOT initialized here anymore
      // It will be initialized when navigating to home page
      
      // Initialize Router
      this.initRouter();
      
      // Hide loading screen
      this.hideLoading();
      
      this.isInitialized = true;
    }
    catch (error)
    {
      console.error('Failed to initialize App:', error);
      this.hideLoading();
      throw error;
    }
  }
  
  private showLoading(): void
  {
    this.loadingUI = new LoadingUI();
  }
  
  private hideLoading(): void
  {
    if (this.loadingUI)
    {
      this.loadingUI.hide();
      this.loadingUI = null;
    }
  }
  
  /**
   * Initialize all three PIXI applications
   */
  private async initPixiApps(): Promise<void>
  {
    // Get mount points
    const bgMount = document.getElementById('pixi-bg');
    const gameMount = document.getElementById('pixi-game');
    const cursorMount = document.getElementById('pixi-cursor');
    
    if (!bgMount || !gameMount || !cursorMount)
    {
      throw new Error('PIXI mount elements not found');
    }
    
    // PIXI App 1: Background Layer (non-interactive)
    this.bgApp = new Application();
    await this.bgApp.init(
    {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a2e,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      powerPreference: 'high-performance'
    });
    bgMount.appendChild(this.bgApp.canvas);
    
    // PIXI App 2: Game Layer (interactive canvas)
    this.gameApp = new Application();
    await this.gameApp.init(
    {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0, // Transparent
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      powerPreference: 'high-performance'
    });
    gameMount.appendChild(this.gameApp.canvas);
    
    // PIXI App 3: Cursor & FX Layer (non-interactive overlay)
    this.cursorApp = new Application();
    await this.cursorApp.init(
    {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0, // Transparent
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      powerPreference: 'low-power'
    });
    cursorMount.appendChild(this.cursorApp.canvas);
    
    // Enable sorting on all stages
    this.bgApp.stage.sortableChildren = true;
    this.gameApp.stage.sortableChildren = true;
    this.cursorApp.stage.sortableChildren = true;
    
    // Setup resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  private async initAssets(): Promise<void>
  {
    this.assetManager = AssetManager.getInstance();
    
    // Set loading progress callback (expects 0-1 range)
    this.assetManager.onProgress = (progress: number) =>
    {
      if (this.loadingUI)
      {
        this.loadingUI.updateProgress(progress);
      }
    };
    
    // Set completion callback
    this.assetManager.onComplete = () =>
    {
      console.log('[OK] All assets loaded');
    };
    
    // Load all assets
    await this.assetManager.loadAll();
  }
  
  private initLayout(): void
  {
    // Initialize the manager (creates Layout instance)
    initLayoutManager();
    
    // Mount the layout structure (#header-mount, #content-mount)
    mountLayout();
  }
  
  private initHeader(): void
  {
    // Initialize the manager (creates Header instance)
    initHeaderManager();
    
    // Mount default header
    mountHeader('default');
  }
  
  /**
   * Initialize the game (called when navigating to home page)
   */
  initializeGame(): void
  {
    if (this.gameInitialized)
    {
      console.warn('[App] Game already initialized');
      return;
    }
    
    if (!this.gameApp || !this.assetManager)
    {
      console.error('[App] Cannot init game - dependencies missing');
      return;
    }
    
    console.log('[App] Initializing game for home page...');
    
    this.siteGame = new SiteGame(this.gameApp, this.assetManager);
    this.siteGame.initialize();
    this.gameInitialized = true;
  }
  
  /**
   * Destroy the game (called when leaving home page)
   */
  destroyGame(): void
  {
    if (!this.gameInitialized)
    {
      return;
    }
    
    console.log('[App] Destroying game (leaving home page)...');
    
    if (this.siteGame)
    {
      this.siteGame.destroy();
      this.siteGame = null;
    }
    
    this.gameInitialized = false;
  }
  
  /**
   * Check if game is currently initialized
   */
  isGameInitialized(): boolean
  {
    return this.gameInitialized;
  }
  
  private handleResize(): void
  {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Resize all three PIXI apps
    if (this.bgApp)
    {
      this.bgApp.renderer.resize(width, height);
    }
    
    if (this.gameApp)
    {
      this.gameApp.renderer.resize(width, height);
    }
    
    if (this.cursorApp)
    {
      this.cursorApp.renderer.resize(width, height);
    }
    
    // Update scene manager (backgrounds)
    if (this.sceneManager)
    {
      this.sceneManager.handleResize();
    }
  }
  
  /**
   * Initialize Scene Manager (backgrounds in bgApp)
   */
  private initSceneManager(): void
  {
    if (!this.bgApp)
    {
      throw new Error('Background app not initialized');
    }
    
    // Create background group container
    const backgroundGroup = new Container();
    backgroundGroup.zIndex = -10;
    backgroundGroup.sortableChildren = true;
    this.bgApp.stage.addChild(backgroundGroup);
    
    // Create SceneManager first
    this.sceneManager = new SceneManager(this.assetManager!);
    
    // Create CloudsManager with SceneManager reference
    const cloudsManager = new CloudsManager(
      this.bgApp,
      backgroundGroup,
      this.assetManager!,
      this.sceneManager
    );
    
    // Link CloudsManager to SceneManager
    this.sceneManager.setCloudsManager(cloudsManager);
    
    // Set background group and initialize
    this.sceneManager.setBackgroundGroup(backgroundGroup, this.bgApp);
  }
  
  /**
   * Initialize Cursor Manager (cursor effects in cursorApp)
   */
  private initCursorManager(): void
  {
    if (!this.cursorApp || !this.assetManager)
    {
      throw new Error('Cannot initialize Cursor Manager - dependencies missing');
    }
    
    // Initialize cursor effects on dedicated app
    this.cursorEffect = new CursorEffectComponent(
      this.cursorApp,
      this.cursorApp.stage, // Use stage directly
      this.assetManager,
      {
        particlesEnabled: true,
        cursorSize: 32,
        particlesCount: 2,
        particlesLifespan: 60
      }
    );
  }
  
  private initRouter(): void
  {
    this.router = Router.getInstance();
    this.router.initialize();
  }
  
  // Public getters
  getBgApp(): Application | null
  {
    return this.bgApp;
  }
  
  getGameApp(): Application | null
  {
    return this.gameApp;
  }
  
  getCursorApp(): Application | null
  {
    return this.cursorApp;
  }
  
  getAssetManager(): AssetManager | null
  {
    return this.assetManager;
  }
  
  getRouter(): Router | null
  {
    return this.router;
  }
  
  getSceneManager(): SceneManager | null
  {
    return this.sceneManager;
  }
  
  getSiteGame(): SiteGame | null
  {
    return this.siteGame;
  }
  
  // Cleanup
  destroy(): void
  {
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.cursorEffect)
    {
      this.cursorEffect.destroy();
      this.cursorEffect = null;
    }
    
    if (this.router)
    {
      this.router.destroy();
    }
    
    if (this.sceneManager)
    {
      this.sceneManager.destroy();
    }
    
    if (this.bgApp)
    {
      this.bgApp.destroy(true, { children: true });
    }
    
    if (this.gameApp)
    {
      this.gameApp.destroy(true, { children: true });
    }
    
    if (this.cursorApp)
    {
      this.cursorApp.destroy(true, { children: true });
    }

    // Destroy game if it exists
    this.destroyGame();
    
    this.isInitialized = false;
  }
}