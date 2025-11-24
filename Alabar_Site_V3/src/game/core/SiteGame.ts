/**
 * SiteGame.ts - Interactive website game layer
 */

import { Application, Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Player } from '../entities/Player';
import { Slime1 } from '../entities/Slime1';

interface SlimeSpawnData
{
  slime: Slime1;
  respawnTimer: number;
}

export class SiteGame
{
  private gameApp: Application;
  private assetManager: AssetManager;
  
  // Game container
  private gameContainer: Container;
  
  // Entities
  private player: Player | null = null;
  private slimes: SlimeSpawnData[] = [];
  private readonly MAX_SLIMES = 30;
  
  // Spawn settings
  private readonly RESPAWN_DELAY_MIN = 180; // 3 seconds at 60fps
  private readonly RESPAWN_DELAY_MAX = 300; // 5 seconds at 60fps
  
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
    }

    this.gameApp.renderer.resize(
      this.gameApp.screen.width,
      gameHeight
    );
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
      maxX: screenWidth - 25,         // Small right margin
      minY: 25,                       // Small top margin
      maxY: greenFieldsHeight - 25   // Small bottom margin
    };
    
    // Update player bounds if player exists
    if (this.player)
    {
      this.player.updateBounds(this.gameBounds);
    }
    
    // Update slime bounds
    for (const spawnData of this.slimes)
    {
      if (spawnData.slime)
      {
        spawnData.slime.updateBounds(this.gameBounds);
      }
    }
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
    
    // Spawn initial slime
    this.spawnSlime();
    
    // Start game loop
    this.start();
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
  }
  
  /**
   * Get random spawn position within bounds
   */
  private getRandomSpawnPosition(): { x: number; y: number }
  {
    const margin = 100; // Keep away from edges
    
    const x = this.gameBounds.minX + margin + 
              Math.random() * (this.gameBounds.maxX - this.gameBounds.minX - margin * 2);
    const y = this.gameBounds.minY + margin + 
              Math.random() * (this.gameBounds.maxY - this.gameBounds.minY - margin * 2);
    
    return { x, y };
  }
  
  /**
   * Spawn a slime at random position
   */
  private spawnSlime(): void
  {
    if (this.slimes.length >= this.MAX_SLIMES)
    {
      return;
    }
    
    const spawnPos = this.getRandomSpawnPosition();
    
    const slime = new Slime1(this.assetManager, {
      startX: spawnPos.x,
      startY: spawnPos.y,
      bounds: this.gameBounds
    });
    
    slime.scale.set(2.0, 2.0);
    slime.zIndex = 500;
    
    // Set player as target
    if (this.player)
    {
      slime.setTarget(this.player);
    }
    
    this.gameContainer.addChild(slime);
    
    this.slimes.push({
      slime: slime,
      respawnTimer: 0
    });
    
    console.log('[SiteGame] Slime spawned at', spawnPos);
  }
  
  /**
   * Get random respawn delay
   */
  private getRandomRespawnDelay(): number
  {
    return this.RESPAWN_DELAY_MIN + 
           Math.random() * (this.RESPAWN_DELAY_MAX - this.RESPAWN_DELAY_MIN);
  }
  
  /**
   * Update slimes
   */
  private updateSlimes(delta: number): void
  {
    for (let i = this.slimes.length - 1; i >= 0; i--)
    {
      const spawnData = this.slimes[i];
      
      // Check if slime is dead
      if (spawnData.slime.isDead())
      {
        // Start respawn timer if not already started
        if (spawnData.respawnTimer === 0)
        {
          spawnData.respawnTimer = this.getRandomRespawnDelay();
          console.log('[SiteGame] Slime died, respawning in', Math.floor(spawnData.respawnTimer / 60), 'seconds');
        }
        
        // Update respawn timer
        spawnData.respawnTimer--;
        
        // Respawn slime
        if (spawnData.respawnTimer <= 0)
        {
          // Remove dead slime
          this.gameContainer.removeChild(spawnData.slime);
          spawnData.slime.destroy();
          this.slimes.splice(i, 1);
          
          // Spawn new slime
          this.spawnSlime();
        }
      }
      else
      {
        spawnData.slime.setNearbyMonsters(
            this.slimes
                .filter(s => !s.slime.isDead())
                .map(s => s.slime)
        );
        // Update alive slime
        spawnData.slime.update(delta);
      }
    }
    
    // Spawn additional slimes if below max
    if (this.slimes.length < this.MAX_SLIMES)
    {
      // Only count alive slimes
      const aliveSlimes = this.slimes.filter(s => !s.slime.isDead()).length;
      
      if (aliveSlimes < this.MAX_SLIMES)
      {
        this.spawnSlime();
      }
    }
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
  }
  
  /**
   * Pause the game
   */
  pause(): void
  {
    this.isPaused = true;
  }
  
  /**
   * Resume the game
   */
  resume(): void
  {
    this.isPaused = false;
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
    
    // Update slimes
    this.updateSlimes(delta);
    
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
    
    // Cleanup slimes
    for (const spawnData of this.slimes)
    {
      if (spawnData.slime)
      {
        this.gameContainer.removeChild(spawnData.slime);
        spawnData.slime.destroy();
      }
    }
    this.slimes = [];
    
    if (this.gameContainer)
    {
      this.gameContainer.destroy({ children: true });
    }
  }
}