/**
 * SiteGame.ts - Interactive website game layer
 */

import { Application, Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Player } from '../entities/Player';

export class SiteGame
{
  private gameApp: Application;
  private assetManager: AssetManager;
  
  // Game container
  private gameContainer: Container;
  
  // Entities
  private player: Player | null = null;
  
  // Game state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Boundaries
  private gameBounds = {
    minX: 100,
    maxX: 0, // Will be set based on screen width
    minY: 0,  // Top of green fields
    maxY: 0   // Will be calculated
  };
  
  constructor(gameApp: Application, assetManager: AssetManager)
  {
    this.gameApp = gameApp;
    this.assetManager = assetManager;
    
    // Create game container
    this.gameContainer = new Container();
    this.gameContainer.label = 'SiteGameContainer';
    this.gameContainer.sortableChildren = true;
    this.gameContainer.position.set(0, 0);
    
    this.gameApp.stage.addChild(this.gameContainer);
    
    this.positionCanvas();
    
    // Calculate initial bounds
    this.updateGameBounds();
    
    // Listen for resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('[SiteGame] Initialized - canvas positioned at green fields');
  }
  
  /**
   * Get the actual background height set by SceneManager
   */
  private getBackgroundHeight(): number
  {
    // SceneManager sets document.body.style.minHeight to the calculated background height
    const bodyMinHeight = document.body.style.minHeight;
    
    if (bodyMinHeight && bodyMinHeight.endsWith('px'))
    {
      const height = parseFloat(bodyMinHeight);
      if (!isNaN(height) && height > 0)
      {
        return height;
      }
    }
    
    // Fallback to screen height if not set yet
    console.warn('[SiteGame] Background height not set yet, using screen height as fallback');
    return this.gameApp.screen.height;
  }
  
  /**
   * Position the canvas element in DOM at 60% of background height
   */
    private positionCanvas(): void
    {
        const bgHeight = this.getBackgroundHeight();

        const gameHeight = bgHeight * 0.50;     

        const canvasY = bgHeight * 0.50;

        const canvasElement = this.gameApp.canvas;
        const canvasParent = canvasElement.parentElement;

        if (canvasParent)
        {
            // container DOM (#pixi-game)
            canvasParent.style.position = "absolute";
            canvasParent.style.top = `${canvasY}px`;
            canvasParent.style.left = `0px`;
            canvasParent.style.width = `100%`;
            canvasParent.style.height = `${gameHeight}px`;

            console.log(`[SiteGame] Canvas parent set to top=${canvasY}px height=${gameHeight}px`);
        }

        this.gameApp.renderer.resize(
            this.gameApp.screen.width,
            gameHeight
        );

        console.log(`[SiteGame] gameApp resized to height=${gameHeight}px`);
    }

  
  /**
   * Calculate game boundaries
   */
  private updateGameBounds(): void
  {
    const screenWidth = this.gameApp.screen.width;
    const bgHeight = this.getBackgroundHeight();

    const greenFieldsHeight = bgHeight * 0.50;

    this.gameBounds = {
      minX: 25,                       // Small left margin
      maxX: screenWidth -25,         // Small right margin
      minY: 25,                       // Small top margin
      maxY: greenFieldsHeight -25   // Small bottom margin
    };
    
    // Update player bounds if player exists
    if (this.player)
    {
      this.player.updateBounds(this.gameBounds);
    }
    
    console.log('[SiteGame] Bounds updated (green fields area):', this.gameBounds);
    console.log(`[SiteGame] Green fields height: ${greenFieldsHeight}px`);
  }
  
  /**
   * Initialize the game
   */
  initialize(): void
  {
    if (this.isRunning)
    {
      console.warn('[SiteGame] Already running');
      return;
    }
    
    // Spawn player
    this.spawnPlayer();
    
    // Start game loop
    this.start();
    
    console.log('[SiteGame] Started');
  }
  
  /**
   * Spawn the player in the green fields area
   */
  private spawnPlayer(): void
  {
    const screenWidth = this.gameApp.screen.width;
    const bgHeight = this.getBackgroundHeight();
    const greenFieldsHeight = bgHeight * 0.50;
    
    const startX = screenWidth * 0.20;
    const startY = greenFieldsHeight * 0.50;
    
    this.player = new Player(this.assetManager, {
      startX: startX,
      startY: startY,
      speed: 2.5,
      bounds: this.gameBounds
    });
    
    this.player.scale.set(2.0, 2.0);
    
    this.player.zIndex = 1000;
    this.gameContainer.addChild(this.player);
    
    console.log(`[SiteGame] Player spawned at (${startX}, ${startY}) in green fields`);
  }
  
  /**
   * Start the game loop
   */
  start(): void
  {
    if (this.isRunning)
    {
      return;
    }
    
    this.isRunning = true;
    this.gameApp.ticker.add(this.update, this);
    
    console.log('[SiteGame] Game loop started');
  }
  
  /**
   * Stop the game loop
   */
  stop(): void
  {
    if (!this.isRunning)
    {
      return;
    }
    
    this.isRunning = false;
    this.gameApp.ticker.remove(this.update, this);
    
    console.log('[SiteGame] Game loop stopped');
  }
  
  /**
   * Pause the game
   */
  pause(): void
  {
    this.isPaused = true;
    console.log('[SiteGame] Paused');
  }
  
  /**
   * Resume the game
   */
  resume(): void
  {
    this.isPaused = false;
    console.log('[SiteGame] Resumed');
  }
  
  /**
   * Main update loop
   */
  private update(ticker: any): void
  {
    if (this.isPaused)
    {
      return;
    }
    
    const delta = ticker.deltaTime;
    
    // Update player
    if (this.player)
    {
      this.player.update(delta);
    }
    
    // TODO: Update enemies
    // TODO: Update chest
    // TODO: Handle collisions
  }
  
  /**
   * Handle window resize
   */
  private handleResize(): void
  {
    // Reposition canvas at green fields start
    this.positionCanvas();
    
    // Update bounds
    this.updateGameBounds();
    
    // Reposition player if out of bounds
    if (this.player)
    {
      const pos = this.player.getPosition();
      const bounds = this.gameBounds;
      
      const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, pos.x));
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, pos.y));
      
      if (clampedX !== pos.x || clampedY !== pos.y)
      {
        this.player.setPosition(clampedX, clampedY);
      }
    }
    
    const bgHeight = this.getBackgroundHeight();
    console.log(`[SiteGame] Resize - Canvas positioned at ${bgHeight * 0.60}px`);
  }
  
  /**
   * Get player instance
   */
  getPlayer(): Player | null
  {
    return this.player;
  }
  
  /**
   * Get game container
   */
  getContainer(): Container
  {
    return this.gameContainer;
  }
  
  /**
   * Check if game is running
   */
  isGameRunning(): boolean
  {
    return this.isRunning;
  }
  
  /**
   * Check if game is paused
   */
  isGamePaused(): boolean
  {
    return this.isPaused;
  }
  
  /**
   * Cleanup and destroy
   */
  destroy(): void
  {
    this.stop();
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.player)
    {
      this.player.destroy();
      this.player = null;
    }
    
    if (this.gameContainer)
    {
      this.gameContainer.destroy({ children: true });
    }
    
    console.log('[SiteGame] Destroyed');
  }
}