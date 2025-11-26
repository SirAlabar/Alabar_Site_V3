/**
 * SiteGame.ts - Interactive website game layer
 * With Drop System and Pickup Integration
 */

import { Application, Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Player } from '../entities/Player';
import { MonsterBase } from '../entities/Monsters/MonsterBase';
import { Slime1 } from '../entities/Monsters/Slime1';
import { CollisionSystem } from '../systems/Collision';
import { DropManager, MonsterType } from '../systems/DropManager';
import { PickupBase } from '../entities/PickupBase';
import { CrystalPickup } from '../entities/Crystal';
import { FoodPickup, FoodTier } from '../entities/Food';

interface MonsterSpawnData
{
  monster: MonsterBase;
  monsterType: MonsterType;
  respawnTimer: number;
}

export class SiteGame
{
  private gameApp: Application;
  private assetManager: AssetManager;
  
  // Game container
  private gameContainer: Container;
  
  // Systems
  private collisionSystem: CollisionSystem;
  private dropManager: DropManager;
  
  // Entities
  private player: Player | null = null;
  private monsters: MonsterSpawnData[] = [];
  private pickups: PickupBase[] = [];
  private readonly MAX_MONSTERS = 5;
  
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
    
    // Initialize systems
    this.collisionSystem = new CollisionSystem({
      playerRadius: 20,
      monsterRadius: 25,
      projectileRadius: 8,
      xpRadius: 30
    });
    
    this.dropManager = new DropManager();
    
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
   * Position the canvas element in DOM at 50% of background height
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
    
    // Update monster bounds
    for (const spawnData of this.monsters)
    {
      if (spawnData.monster)
      {
        spawnData.monster.updateBounds(this.gameBounds);
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
    
    // Spawn initial monster (Slime1 for testing)
    this.spawnMonster('Slime1');
    
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
      speed: 1.5,
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
    const margin = 25; // Keep away from edges
    
    const x = this.gameBounds.minX + margin + 
              Math.random() * (this.gameBounds.maxX - this.gameBounds.minX - margin * 2);
    const y = this.gameBounds.minY + margin + 
              Math.random() * (this.gameBounds.maxY - this.gameBounds.minY - margin * 2);
    
    return { x, y };
  }
  
  /**
   * Spawn a monster at random position
   * Currently only spawns Slime1 for testing
   */
  private spawnMonster(monsterType: MonsterType): void
  {
    if (this.monsters.length >= this.MAX_MONSTERS)
    {
      return;
    }
    
    const spawnPos = this.getRandomSpawnPosition();
    
    let monster: MonsterBase;
    
    // For now, only spawn Slime1 for testing drops
    switch (monsterType)
    {
      case 'Slime1':
      default:
        monster = new Slime1(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.gameBounds
        });
        break;
    }
    
    monster.scale.set(2.0, 2.0);
    monster.zIndex = 500;
    
    // Set player as target
    if (this.player)
    {
      monster.setTarget(this.player);
    }
    
    this.gameContainer.addChild(monster);
    
    this.monsters.push({
      monster: monster,
      monsterType: monsterType,
      respawnTimer: 0
    });
    
    console.log(`[SiteGame] ${monsterType} spawned at`, spawnPos);
  }
  
  /**
   * Spawn pickup from drop result
   */
  private spawnPickup(x: number, y: number, monsterType: MonsterType): void
  {
    // Roll for drop
    const drop = this.dropManager.rollDrop(monsterType);
    
    if (drop.type === 'none')
    {
      console.log(`[SiteGame] ${monsterType} dropped nothing`);
      return;
    }
    
    let pickup: PickupBase;
    
    if (drop.type === 'crystal')
    {
      pickup = new CrystalPickup(this.assetManager, {
        x: x,
        y: y,
        tier: drop.tier!,
        xpValue: drop.xpValue!,
        particleContainer: this.gameContainer
      });
      
      console.log(`[SiteGame] Spawned Crystal Tier ${drop.tier} (${drop.xpValue} XP) at (${x}, ${y})`);
    }
    else // food
    {
      // Map heal percent to food tier
      let foodTier: FoodTier = 'eggs';
      
      if (drop.healPercent === 0.50) foodTier = 'bacon';
      else if (drop.healPercent === 0.40) foodTier = 'ribs';
      else if (drop.healPercent === 0.30) foodTier = 'steak';
      else if (drop.healPercent === 0.20) foodTier = 'chiken_leg';
      else if (drop.healPercent === 0.10) foodTier = 'eggs';
      else if (drop.healPercent === -0.05) foodTier = 'worm';
      
      pickup = new FoodPickup(this.assetManager, {
        x: x,
        y: y,
        tier: foodTier,
        particleContainer: this.gameContainer
      });
      
      console.log(`[SiteGame] Spawned Food ${foodTier} at (${x}, ${y})`);
    }
    
    pickup.zIndex = 100;
    
    this.gameContainer.addChild(pickup);
    this.pickups.push(pickup);
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
   * Update monsters
   */
  private updateMonsters(delta: number): void
  {
    for (let i = this.monsters.length - 1; i >= 0; i--)
    {
      const spawnData = this.monsters[i];
      
      // Check if monster is dead
      if (spawnData.monster.isDead())
      {
        // Wait for death animation to complete before hiding
        if (spawnData.monster.isDeathAnimationComplete())
        {
          // Start respawn timer if not already started
          if (spawnData.respawnTimer === 0)
          {
            spawnData.respawnTimer = this.getRandomRespawnDelay();
            console.log(`[SiteGame] ${spawnData.monsterType} death animation complete, respawning in`, Math.floor(spawnData.respawnTimer / 60), 'seconds');
            
            // Spawn pickup at death position
            const deathPos = spawnData.monster.getPosition();
            this.spawnPickup(deathPos.x, deathPos.y, spawnData.monsterType);
            
            // Hide the dead monster
            spawnData.monster.visible = false;
          }
          
          // Update respawn timer
          spawnData.respawnTimer--;
          
          // Respawn monster
          if (spawnData.respawnTimer <= 0)
          {
            // Remove dead monster
            this.gameContainer.removeChild(spawnData.monster);
            spawnData.monster.destroy();
            this.monsters.splice(i, 1);
            
            // Spawn new monster
            this.spawnMonster(spawnData.monsterType);
            console.log(`[SiteGame] ${spawnData.monsterType} respawned!`);
          }
        }
        // Death animation still playing - don't update or move
      }
      else
      {
        // Update nearby monsters for separation
        spawnData.monster.setNearbyMonsters(
            this.monsters
                .filter(s => !s.monster.isDead())
                .map(s => s.monster)
        );
        
        // Update alive monster
        spawnData.monster.update(delta);
      }
    }
    
    // Spawn additional monsters if below max
    if (this.monsters.length < this.MAX_MONSTERS)
    {
      // Only count alive monsters
      const aliveMonsters = this.monsters.filter(s => !s.monster.isDead()).length;
      
      if (aliveMonsters < this.MAX_MONSTERS)
      {
        this.spawnMonster('Slime1'); // Only Slime1 for now
      }
    }
  }
  
  /**
   * Update pickups (magnet + collision)
   */
  private updatePickups(_delta: number): void
  {
    if (!this.player)
    {
      return;
    }
    
    for (let i = this.pickups.length - 1; i >= 0; i--)
    {
      const pickup = this.pickups[i];
      
      // Skip if already picked up
      if (pickup.wasPickedUp())
      {
        continue;
      }
      
      // Update pickup (age/lifetime)
      pickup.update(_delta);
      
      // Get player position
      const playerPos = this.player.getPosition();
      
      // Update magnet behavior
      pickup.updateMagnet(playerPos.x, playerPos.y);
      
      // Check collision with player
      const pickupPos = pickup.getPosition();
      const dx = playerPos.x - pickupPos.x;
      const dy = playerPos.y - pickupPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const collisionDistance = this.collisionSystem['playerRadius'] + pickup.getPickupRadius();
      
      if (distance <= collisionDistance)
      {
        // Pickup collected!
        pickup.onPickup(this.player);
        
        // Remove from array
        this.gameContainer.removeChild(pickup);
        pickup.destroy();
        this.pickups.splice(i, 1);
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
      
      // Get alive monsters
      const aliveMonsters = this.monsters
        .filter(s => !s.monster.isDead())
        .map(s => s.monster);
      
      // Check player attack collision (impact frames)
      if (this.player.isPlayerAttacking())
      {
        const hitMonsters = this.collisionSystem.applyAttackDamageOnImpactFrames(
          this.player,
          aliveMonsters
        );
        
        // Debug logging
        if (hitMonsters.length > 0)
        {
          console.log(`[Attack] Hit ${hitMonsters.length} monsters at impact frame!`);
        }
      }
      
      // Apply monster touch damage to player (DPS model)
      this.collisionSystem.applyTouchDamage(this.player, aliveMonsters, delta);
    }
    
    // Update monsters
    this.updateMonsters(delta);
    
    // Update pickups
    this.updatePickups(delta);
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
    
    // Cleanup monsters
    for (const spawnData of this.monsters)
    {
      if (spawnData.monster)
      {
        this.gameContainer.removeChild(spawnData.monster);
        spawnData.monster.destroy();
      }
    }
    this.monsters = [];
    
    // Cleanup pickups
    for (const pickup of this.pickups)
    {
      if (pickup)
      {
        this.gameContainer.removeChild(pickup);
        pickup.destroy();
      }
    }
    this.pickups = [];
    
    if (this.gameContainer)
    {
      this.gameContainer.destroy({ children: true });
    }
  }
}