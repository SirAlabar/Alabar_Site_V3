/**
 * App.ts - Main application singleton
 * Manages Pixi application and overall app state
 * 
 * MINIMAL VERSION - Router, AssetManager, SceneManager commented until needed
 */

import { Application } from 'pixi.js';
import { initLayoutManager, mountLayout } from './manager/LayoutManager';
import { initHeaderManager, mountHeader } from './manager/HeaderManager';
// import { Router } from './router/Router';
// import { AssetManager } from './managers/AssetManager';
// import { SceneManager } from './managers/SceneManager';

export class App
{
  private static instance: App;
  
  private pixiApp: Application | null = null;
  // private router: Router | null = null;
  // private assetManager: AssetManager | null = null;
  // private sceneManager: SceneManager | null = null;
  private isInitialized = false;
  
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
      // Initialize Pixi Application
      await this.initPixi();
      
      // Initialize Layout Manager
      this.initLayout();
      
      // Initialize Header Manager
      this.initHeader();
      
      // TODO: Uncomment when AssetManager is ready
      // await this.initAssets();
      
      // TODO: Uncomment when SceneManager is ready
      // this.initSceneManager();
      
      // TODO: Uncomment when Router is ready
      // this.initRouter();
      
      this.isInitialized = true;
      console.log('✅ App initialized successfully');
    }
    catch (error)
    {
      console.error('Failed to initialize App:', error);
      throw error;
    }
  }
  
  private async initPixi(): Promise<void>
  {
    const pixiMount = document.getElementById('pixi-mount');
    if (!pixiMount)
    {
      throw new Error('Pixi mount element not found');
    }
    
    // Create Pixi Application
    this.pixiApp = new Application();
    
    // Initialize the application
    await this.pixiApp.init(
    {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a2e, // RPG dark blue
      antialias: false, // Pixel art style
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      powerPreference: 'high-performance'
    });
    
    // Add canvas to DOM
    pixiMount.appendChild(this.pixiApp.canvas);
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('✅ Pixi initialized');
  }
  
  private initLayout(): void
  {
    // Initialize the manager (creates Layout instance)
    initLayoutManager();
    
    // Mount the layout structure (#header-mount, #content-mount)
    mountLayout();
    
    console.log('✅ Layout Manager initialized');
  }
  
  private initHeader(): void
  {
    // Initialize the manager (creates Header instance)
    initHeaderManager();
    
    // Mount default header
    mountHeader('default');
    
    console.log('✅ Header Manager initialized');
  }
  
  private handleResize(): void
  {
    if (!this.pixiApp) return;
    
    this.pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
    
    // TODO: Uncomment when SceneManager is ready
    /*
    if (this.sceneManager)
    {
      this.sceneManager.handleResize(window.innerWidth, window.innerHeight);
    }
    */
  }
  
  // TODO: Uncomment when AssetManager is ready
  /*
  private async initAssets(): Promise<void>
  {
    this.assetManager = AssetManager.getInstance();
    
    // Set loading progress callback
    this.assetManager.onProgress = (progress: number) =>
    {
      this.updateLoadingProgress(progress);
    };
    
    // Load all assets
    await this.assetManager.loadAll();
    
    console.log('✅ Assets loaded');
  }
  
  private updateLoadingProgress(progress: number): void
  {
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar)
    {
      loadingBar.style.width = `${progress * 100}%`;
    }
  }
  */
  
  // TODO: Uncomment when SceneManager is ready
  /*
  private initSceneManager(): void
  {
    if (!this.pixiApp)
    {
      throw new Error('Pixi app not initialized');
    }
    
    this.sceneManager = SceneManager.getInstance();
    this.sceneManager.initialize(this.pixiApp);
    
    console.log('✅ Scene Manager initialized');
  }
  */
  
  // TODO: Uncomment when Router is ready
  /*
  private initRouter(): void
  {
    this.router = Router.getInstance();
    this.router.initialize();
    
    console.log('✅ Router initialized');
  }
  */
  
  // Public getters
  getPixiApp(): Application | null
  {
    return this.pixiApp;
  }
  
  // TODO: Uncomment when needed
  /*
  getRouter(): Router | null
  {
    return this.router;
  }
  
  getAssetManager(): AssetManager | null
  {
    return this.assetManager;
  }
  
  getSceneManager(): SceneManager | null
  {
    return this.sceneManager;
  }
  */
  
  // Cleanup
  destroy(): void
  {
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // TODO: Uncomment when needed
    /*
    if (this.router)
    {
      this.router.destroy();
    }
    
    if (this.sceneManager)
    {
      this.sceneManager.destroy();
    }
    */
    
    if (this.pixiApp)
    {
      this.pixiApp.destroy(true, { children: true });
    }
    
    this.isInitialized = false;
  }
}