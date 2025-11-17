/**
 * CloudsManager - Creates and manages animated cloud sprites with custom animations
 */

import { Application, Container, Sprite, Spritesheet, Ticker } from 'pixi.js';
import { lerp, boundValue } from '../utils/MathUtils';
import { AssetManager } from './AssetManager';

// Extend Container to include custom properties
interface CloudSprite extends Sprite
{
  animationData?: CloudAnimationData;
  tickerCallback?: ((ticker: Ticker) => void) | null;
  markedForRemoval?: boolean;
  visible: boolean;
}

interface CloudAnimationData
{
  type: AnimationType;
  startTime: number;
  formationTime: number;
  driftDelay: number;
  finalOpacity: number;
  finalScale: number;
  baseScale: number;
  sceneScale: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  driftSlowState: { phase: number };
}

type AnimationType = 'driftLeftToRight' | 'driftRightToLeft' | 'driftDiagonalUp' | 'driftSlow';

interface CloudConfig
{
  minClouds: number;
  maxClouds: number;
  minDistance: number;
  containerHeight: number;
  minScale: number;
  maxScale: number;
  spritesheetName: string;
}

interface FormationSpeed
{
  formationTime: number;
  driftDelay: number;
}

export class CloudsManager
{
  private app: Application;
  private backgroundGroup: Container;
  private assetManager: AssetManager;
  private sceneManager: any; // Will be typed as SceneManager once converted
  
  // Cloud container
  private cloudsContainer: Container;
  
  // Cloud settings
  private config: CloudConfig;
  
  // Animation type probabilities
  private animationTypes: AnimationType[];
  
  // Animation speeds
  private formationSpeeds: FormationSpeed[];
  
  // Opacity levels
  private opacityLevels: number[];
  
  // Collection of active cloud sprites
  private activeCloudSprites: CloudSprite[];
  
  // Setup flags
  private initialized: boolean;
  private initInProgress: boolean;
  private isDestroyed: boolean;
  
  // Current theme
  private currentTheme: string;
  
  // Lifecycle interval
  private cloudLifecycleInterval: number | null;
  
  constructor(app: Application, backgroundGroup: Container, assetManager: AssetManager, sceneManager?: any)
  {
    // Store PixiJS references
    this.app = app;
    this.backgroundGroup = backgroundGroup;
    this.assetManager = assetManager;
    this.sceneManager = sceneManager;
    
    // Cloud container
    this.cloudsContainer = new Container();
    this.cloudsContainer.label = 'clouds';
    this.cloudsContainer.position.set(0, 0);
    this.cloudsContainer.zIndex = -9;
    
    // Add to background group if available
    if (this.backgroundGroup)
    {
      this.backgroundGroup.addChild(this.cloudsContainer);
    }
    
    // Cloud settings
    this.config = {
      minClouds: 3,
      maxClouds: 10,
      minDistance: 100,
      containerHeight: this.getSceneHeight(),
      minScale: 0.5,
      maxScale: 2.5,
      spritesheetName: 'clouds_spritesheet'
    };
    
    // Animation type probabilities
    this.animationTypes = [
      'driftLeftToRight',
      'driftRightToLeft',
      'driftDiagonalUp',
      'driftSlow'
    ];
    
    // Animation speeds (matching CSS classes)
    this.formationSpeeds = [
      { formationTime: 4000, driftDelay: 0 },
      { formationTime: 5000, driftDelay: 1000 },
      { formationTime: 6000, driftDelay: 2000 }
    ];
    
    // Opacity levels
    this.opacityLevels = [0.2, 0.3, 0.5, 0.7, 0.8];
    
    // Collection of active cloud sprites
    this.activeCloudSprites = [];
    
    // Setup flags
    this.initialized = false;
    this.initInProgress = false;
    this.isDestroyed = false;
    
    // Current theme
    this.currentTheme = document.body.getAttribute('data-theme') || 'light';
    
    // Lifecycle interval
    this.cloudLifecycleInterval = null;
  }
  
  /**
   * Initialize the clouds manager
   */
  init(theme?: string): void
  {
    // Prevent multiple simultaneous initialization attempts
    if (this.initInProgress || this.isDestroyed)
    {
      return;
    }
    
    // If already initialized, just refresh the clouds
    if (this.initialized)
    {
      this.refreshClouds();
      return;
    }
    
    this.initInProgress = true;
    
    // Check if we have access to the asset manager and app
    if (!this.assetManager || !this.app)
    {
      console.error('CloudsManager: assetManager or PixiJS app not available');
      this.initInProgress = false;
      return;
    }
    
    // Verify that the clouds spritesheet is loaded
    const cloudsSpritesheet = this.assetManager.getSpritesheet(this.config.spritesheetName);
    if (!cloudsSpritesheet)
    {
      console.warn(`CloudsManager: ${this.config.spritesheetName} not found - will retry later`);
      this.initInProgress = false;
      // Set up a retry mechanism
      setTimeout(() => this.init(theme), 2000);
      return;
    }
    
    // Set current theme from parameter or get from document
    if (theme)
    {
      this.currentTheme = theme;
    }
    else
    {
      this.currentTheme = document.body.getAttribute('data-theme') || 'light';
    }
    
    // Only proceed with cloud creation for light theme
    if (this.currentTheme === 'light')
    {
      // Create initial clouds
      this.refreshClouds();
      // Set up the cloud lifecycle ticker
      this.startCloudLifecycle();
    }
    
    // Set up theme change listeners
    this.setupThemeListeners();
    
    // Listen for window resize
    window.addEventListener('resize', this.onResize.bind(this));
    
    this.initialized = true;
    this.initInProgress = false;
  }
  
  /**
   * Set up theme change listeners
   */
  private setupThemeListeners(): void
  {
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    
    if (this.sceneManager)
    {
      const originalToggleTheme = this.sceneManager.toggleTheme;
      this.sceneManager.toggleTheme = () =>
      {
        originalToggleTheme.call(this.sceneManager);
        
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        
        if (newTheme !== this.currentTheme)
        {
          this.currentTheme = newTheme;
          
          if (newTheme === 'light')
          {
            this.refreshClouds();
          }
          else
          {
            this.hideAllClouds();
          }
        }
      };
    }
    
    const handleThemeToggle = () =>
    {
      setTimeout(() =>
      {
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        
        if (newTheme !== this.currentTheme)
        {
          this.currentTheme = newTheme;
          if (newTheme === 'light')
          {
            this.refreshClouds();
          }
          else
          {
            this.hideAllClouds();
          }
        }
      }, 100);
    };
    
    if (themeToggle)
    {
      themeToggle.addEventListener('click', handleThemeToggle);
    }
    if (themeToggleMobile)
    {
      themeToggleMobile.addEventListener('click', handleThemeToggle);
    }
  }
  
  /**
   * Hide all clouds - used when switching to dark theme
   */
  hideAllClouds(): void
  {
    // Stop the lifecycle interval
    if (this.cloudLifecycleInterval)
    {
      clearInterval(this.cloudLifecycleInterval);
      this.cloudLifecycleInterval = null;
    }
    
    // Safely remove all cloud ticker callbacks
    this.activeCloudSprites.forEach(cloud =>
    {
      if (cloud && cloud.tickerCallback)
      {
        this.app.ticker.remove(cloud.tickerCallback);
        cloud.tickerCallback = null;
      }
    });
    
    // Clear the container
    if (this.cloudsContainer)
    {
      this.cloudsContainer.removeChildren();
    }
    
    // Clear the active sprites array
    this.activeCloudSprites = [];
  }
  
  /**
   * Start the cloud lifecycle management
   */
  private startCloudLifecycle(): void
  {
    // Clear any existing interval first
    if (this.cloudLifecycleInterval)
    {
      clearInterval(this.cloudLifecycleInterval);
    }
    
    // Check cloud lifecycle every 5 seconds
    this.cloudLifecycleInterval = window.setInterval(() =>
    {
      if (this.isDestroyed)
      {
        if (this.cloudLifecycleInterval)
        {
          clearInterval(this.cloudLifecycleInterval);
        }
        return;
      }
      if (this.initialized && this.currentTheme === 'light')
      {
        this.manageCloudLifecycle();
      }
    }, 5000);
  }
  
  /**
   * Manage the cloud lifecycle (add/remove as needed)
   */
  private manageCloudLifecycle(): void
  {
    if (!this.cloudsContainer || this.isDestroyed)
    {
      return;
    }
    
    // Clean up any completed animations
    this.cleanupCompletedClouds();
    
    // Count current visible clouds
    const visibleCount = this.activeCloudSprites.filter(
      cloud => !cloud.markedForRemoval && cloud.visible
    ).length;
    
    // Determine target number of clouds
    const targetCount = this.config.minClouds +
      Math.floor(Math.random() * (this.config.maxClouds - this.config.minClouds + 1));
    
    // Add new clouds if needed
    if (visibleCount < targetCount)
    {
      const newCount = targetCount - visibleCount;
      this.addNewClouds(newCount);
    }
  }
  
  /**
   * Remove clouds that have completed their animations
   */
  private cleanupCompletedClouds(): void
  {
    if (this.isDestroyed)
    {
      return;
    }
    
    // Filter out clouds marked for removal
    this.activeCloudSprites = this.activeCloudSprites.filter(cloud =>
    {
      if (cloud.markedForRemoval)
      {
        if (cloud.parent)
        {
          cloud.parent.removeChild(cloud);
        }
        // Remove ticker callback
        if (cloud.tickerCallback)
        {
          this.app.ticker.remove(cloud.tickerCallback);
          cloud.tickerCallback = null;
        }
        cloud.destroy({ children: true });
        return false;
      }
      return true;
    });
  }
  
  /**
   * Add a batch of new clouds to the scene
   */
  private addNewClouds(count: number): void
  {
    if (!this.cloudsContainer || this.isDestroyed)
    {
      return;
    }
    
    // Screen dimensions for distribution
    const screenWidth = window.innerWidth;
    const containerHeight = this.config.containerHeight;
    
    // Get spritesheet
    const spritesheet = this.assetManager.getSpritesheet(this.config.spritesheetName);
    if (!spritesheet)
    {
      console.warn('CloudsManager: Spritesheet not available');
      return;
    }
    
    // Create clouds
    for (let i = 0; i < count; i++)
    {
      this.createCloud(spritesheet, screenWidth, containerHeight);
    }
  }
  
  /**
   * Create a single cloud sprite
   */
  private createCloud(spritesheet: Spritesheet, screenWidth: number, containerHeight: number): void
  {
    // Get random cloud texture from spritesheet
    const textureNames = Object.keys(spritesheet.textures);
    const randomTextureName = textureNames[Math.floor(Math.random() * textureNames.length)];
    const texture = spritesheet.textures[randomTextureName];
    
    if (!texture)
    {
      return;
    }
    
    // Create sprite
    const cloud = new Sprite(texture) as CloudSprite;
    
    // Random animation type
    const animType = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
    
    // Random formation speed
    const formationSpeed = this.formationSpeeds[Math.floor(Math.random() * this.formationSpeeds.length)];
    
    // Random opacity
    const opacity = this.opacityLevels[Math.floor(Math.random() * this.opacityLevels.length)];
    
    // Random scale
    const baseScale = this.config.minScale + Math.random() * (this.config.maxScale - this.config.minScale);
    const sceneScale = this.getSceneScale();
    const finalScale = baseScale * sceneScale;
    
    // Set initial properties
    cloud.alpha = 0;
    cloud.scale.set(finalScale * 0.8);
    cloud.anchor.set(0.5, 0.5);
    
    // Calculate positions based on animation type
    const startPos = this.calculateStartPosition(animType, screenWidth, containerHeight);
    const endPos = this.calculateEndPosition(animType, startPos.x, startPos.y, screenWidth, containerHeight);
    
    cloud.position.set(startPos.x, startPos.y);
    
    // Store animation data
    cloud.animationData = {
      type: animType,
      startTime: performance.now(),
      formationTime: formationSpeed.formationTime,
      driftDelay: formationSpeed.driftDelay,
      finalOpacity: opacity,
      finalScale: finalScale,
      baseScale: baseScale,
      sceneScale: sceneScale,
      startPosition: startPos,
      endPosition: endPos,
      driftSlowState: { phase: Math.random() * Math.PI * 2 }
    };
    
    // Add to container
    this.cloudsContainer.addChild(cloud);
    this.activeCloudSprites.push(cloud);
    
    // Setup animations
    this.setupCloudAnimations(cloud);
  }
  
  /**
   * Calculate start position for cloud animation
   */
  private calculateStartPosition(animType: AnimationType, screenWidth: number, containerHeight: number): { x: number; y: number }
  {
    let x: number;
    let y: number;
    
    switch (animType)
    {
      case 'driftLeftToRight':
        x = -200;
        y = Math.random() * containerHeight * 0.6;
        break;
        
      case 'driftRightToLeft':
        x = screenWidth + 200;
        y = Math.random() * containerHeight * 0.6;
        break;
        
      case 'driftDiagonalUp':
        x = -200;
        y = containerHeight * 0.4 + Math.random() * containerHeight * 0.4;
        break;
        
      case 'driftSlow':
        x = Math.random() * screenWidth;
        y = Math.random() * containerHeight * 0.5;
        break;
        
      default:
        x = Math.random() * screenWidth;
        y = Math.random() * containerHeight * 0.5;
    }
    
    return { x, y };
  }
  
  /**
   * Calculate end position for cloud animation
   */
  private calculateEndPosition(animType: AnimationType, startX: number, startY: number, screenWidth: number, screenHeight: number): { x: number; y: number }
  {
    switch (animType)
    {
      case 'driftLeftToRight':
        return { x: screenWidth + 200, y: startY };
        
      case 'driftRightToLeft':
        return { x: -200, y: startY };
        
      case 'driftDiagonalUp':
        return { x: screenWidth + 200, y: startY - 200 };
        
      case 'driftSlow':
        // End position not really used for driftSlow, as it oscillates
        return { x: startX, y: startY };
        
      default:
        return { x: screenWidth + 200, y: startY };
    }
  }
  
  /**
   * Refresh clouds (remove all and create new ones)
   */
  private refreshClouds(): void
  {
    this.hideAllClouds();
    
    const targetCount = this.config.minClouds +
      Math.floor(Math.random() * (this.config.maxClouds - this.config.minClouds + 1));
    
    this.addNewClouds(targetCount);
  }
  
  /**
   * Get scene height for cloud distribution
   */
  private getSceneHeight(): number
  {
    const sceneElement = document.getElementById('main-scene');
    if (sceneElement)
    {
      return sceneElement.clientHeight;
    }
    // Fallback: 200vh
    return window.innerHeight * 2;
  }
  
  /**
   * Get scene scale factor
   */
  private getSceneScale(): number
  {
    let scaleFactor = 1.0;
    
    try
    {
      // Try to get scale from background layers
      if (this.sceneManager && this.sceneManager.layers)
      {
        for (const layerId in this.sceneManager.layers)
        {
          if (layerId !== 'background' && layerId !== 'clouds')
          {
            const layer = this.sceneManager.layers[layerId];
            if (layer)
            {
              if (layer.children && layer.children.length > 0)
              {
                const sprite = layer.children[0];
                if (sprite && sprite.width && window.innerWidth > 0)
                {
                  // Use width ratio for scale factor
                  scaleFactor = sprite.width / window.innerWidth;
                  break;
                }
              }
            }
          }
        }
      }
      
      // Fallback to element size comparison
      if (scaleFactor === 1.0)
      {
        const sceneElement = document.getElementById('main-scene');
        if (sceneElement)
        {
          // Get height ratio compared to window
          const sceneHeight = sceneElement.clientHeight;
          const windowHeight = window.innerHeight;
          if (windowHeight > 0)
          {
            scaleFactor = sceneHeight / windowHeight;
          }
        }
      }
      
      // Constrain to reasonable values
      scaleFactor = Math.max(0.25, Math.min(scaleFactor, 1.25));
      
      // Use a smaller factor for clouds so they don't get too large
      scaleFactor = 0.5 + (scaleFactor - 1.0) * 0.4;
    }
    catch (error)
    {
      console.warn('CloudsManager: Error calculating scene scale', error);
    }
    
    return scaleFactor;
  }
  
  /**
   * Setup cloud animations using PixiJS ticker
   */
  private setupCloudAnimations(cloud: CloudSprite): void
  {
    if (this.isDestroyed || !cloud.animationData)
    {
      return;
    }
    
    const animData = cloud.animationData;
    const startTime = animData.startTime;
    
    // Calculate animation durations based on type
    let animationDuration: number;
    switch (animData.type)
    {
      case 'driftLeftToRight':
        animationDuration = 60000; // 60 seconds
        break;
      case 'driftRightToLeft':
        animationDuration = 80000; // 80 seconds
        break;
      case 'driftDiagonalUp':
        animationDuration = 90000; // 90 seconds
        break;
      case 'driftSlow':
        animationDuration = 30000; // 30 seconds per "wave" but actually infinite
        break;
      default:
        animationDuration = 60000;
    }
    
    // Create the animation ticker
    const tickerCallback = (ticker: Ticker) =>
    {
      // Safety check - if cloud is destroyed, removed, or manager is destroyed
      if (this.isDestroyed || !cloud || !cloud.parent)
      {
        this.app.ticker.remove(tickerCallback);
        return;
      }
      
      try
      {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        
        // Phase 1: Formation (fade in and scale)
        if (elapsed <= animData.formationTime)
        {
          const formProgress = elapsed / animData.formationTime;
          // Fade in
          cloud.alpha = formProgress * animData.finalOpacity;
          // Scale up
          const scaleProgress = Math.min(1, formProgress * 1.1);
          cloud.scale.set(
            lerp(animData.finalScale * 0.8, animData.finalScale, scaleProgress)
          );
          return;
        }
        
        // Phase 2: Drift delay (pause before drifting)
        if (elapsed <= animData.formationTime + animData.driftDelay)
        {
          cloud.alpha = animData.finalOpacity;
          cloud.scale.set(animData.finalScale);
          return;
        }
        
        // Phase 3: Drift animation
        const driftStartTime = animData.formationTime + animData.driftDelay;
        const driftElapsed = elapsed - driftStartTime;
        const driftProgress = Math.min(1, driftElapsed / animationDuration);
        
        // Handle different animation types
        switch (animData.type)
        {
          case 'driftLeftToRight':
          case 'driftRightToLeft':
          case 'driftDiagonalUp':
            // Linear movement from start to end position
            cloud.position.x = lerp(animData.startPosition.x, animData.endPosition.x, driftProgress);
            cloud.position.y = lerp(animData.startPosition.y, animData.endPosition.y, driftProgress);
            
            // Fade in/out bell curve
            if (driftProgress < 0.1)
            {
              // Fade in
              cloud.alpha = lerp(0, animData.finalOpacity, driftProgress * 10);
            }
            else if (driftProgress > 0.8)
            {
              // Fade out
              cloud.alpha = lerp(animData.finalOpacity, 0, (driftProgress - 0.8) * 5);
            }
            else
            {
              // Middle section
              cloud.alpha = animData.finalOpacity;
            }
            
            // If animation is complete, mark for removal
            if (driftProgress >= 1)
            {
              cloud.markedForRemoval = true;
              cloud.visible = false;
              this.app.ticker.remove(tickerCallback);
              cloud.tickerCallback = null;
            }
            break;
            
          case 'driftSlow':
            // Oscillating movement
            animData.driftSlowState.phase += 0.001; // Slow phase increment
            const offsetX = Math.sin(animData.driftSlowState.phase) * 50; // 50px amplitude
            cloud.position.x = animData.startPosition.x + offsetX;
            
            // Alpha pulsing effect
            const alphaOffset = Math.sin(animData.driftSlowState.phase) * 0.3;
            cloud.alpha = animData.finalOpacity + alphaOffset;
            break;
        }
      }
      catch (error)
      {
        console.warn('CloudsManager: Error in cloud animation', error);
        this.app.ticker.remove(tickerCallback);
        // Mark cloud for removal on error
        if (cloud)
        {
          cloud.markedForRemoval = true;
          cloud.visible = false;
          cloud.tickerCallback = null;
        }
      }
    };
    
    // Add to ticker
    this.app.ticker.add(tickerCallback);
    
    // Store ticker callback for later removal
    cloud.tickerCallback = tickerCallback;
  }
  
  /**
   * Handle window resize events
   */
  private onResize(): void
  {
    if (this.isDestroyed)
    {
      return;
    }
    
    this.config.containerHeight = this.getSceneHeight();
    
    if (this.currentTheme === 'light' && this.initialized)
    {
      this.updateCloudScaling();
      this.refreshClouds();
    }
  }
  
  /**
   * Update cloud scaling without completely refreshing
   */
  private updateCloudScaling(): void
  {
    if (this.isDestroyed)
    {
      return;
    }
    
    const sceneScale = this.getSceneScale();
    const newContainerHeight = this.getSceneHeight();
    
    // Update all existing clouds
    this.activeCloudSprites.forEach(cloud =>
    {
      if (cloud && cloud.animationData && !cloud.markedForRemoval)
      {
        try
        {
          // Calculate new scale using the original base scale and the new scene scale
          const baseScale = cloud.animationData.baseScale ||
            (cloud.animationData.finalScale / cloud.animationData.sceneScale || 1.0);
          
          // Store the new values
          cloud.animationData.sceneScale = sceneScale;
          cloud.animationData.baseScale = baseScale;
          cloud.animationData.finalScale = baseScale * sceneScale;
          
          // Apply the new scale if we're past the formation phase
          const elapsed = performance.now() - cloud.animationData.startTime;
          if (elapsed >= cloud.animationData.formationTime)
          {
            // Apply the new scale directly
            cloud.scale.set(cloud.animationData.finalScale);
          }
          else
          {
            // Still in formation phase, keep the partial scale
            const formProgress = elapsed / cloud.animationData.formationTime;
            const scaleProgress = Math.min(1, formProgress * 1.2);
            cloud.scale.set(
              lerp(cloud.animationData.finalScale * 0.8, cloud.animationData.finalScale, scaleProgress)
            );
          }
          
          // Update position for vertical scaling
          const verticalRatio = cloud.position.y / this.config.containerHeight;
          cloud.position.y = verticalRatio * newContainerHeight;
        }
        catch (error)
        {
          console.warn('CloudsManager: Error updating cloud scale', error);
        }
      }
    });
    
    this.config.containerHeight = newContainerHeight;
  }
  
  /**
   * Destroy all resources
   */
  destroy(): void
  {
    console.log('CloudsManager: Destroying');
    this.isDestroyed = true;
    
    // Clear interval
    if (this.cloudLifecycleInterval)
    {
      clearInterval(this.cloudLifecycleInterval);
      this.cloudLifecycleInterval = null;
    }
    
    // Remove all cloud sprites
    if (this.cloudsContainer)
    {
      // Remove all ticker callbacks first
      this.activeCloudSprites.forEach(cloud =>
      {
        if (cloud && cloud.tickerCallback)
        {
          this.app.ticker.remove(cloud.tickerCallback);
          cloud.tickerCallback = null;
        }
      });
      
      // Clear container
      this.cloudsContainer.removeChildren();
    }
    
    // Remove resize listener
    window.removeEventListener('resize', this.onResize.bind(this));
    
    // Clear arrays
    this.activeCloudSprites = [];
  }
}