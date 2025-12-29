/**
 * SiteGame.ts - Interactive website game layer
 * With Drop System and Pickup Integration
 */

import { Application, Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Player } from '../entities/Player';
import { MonsterBase } from '../entities/monsters/MonsterBase';
import { CollisionSystem } from '../systems/Collision';
import { DropManager, MonsterType } from '../systems/DropManager';
import { PickupBase } from '../entities/PickupBase';
import { CrystalPickup } from '../entities/Crystal';
import { FoodPickup, FoodTier } from '../entities/Food';
import { EnemySpawner } from '../systems/EnemySpawner';
import { EnemyProjectileManager } from '../systems/EnemyProjectileManager';
import { PowerManager } from '../systems/PowerManager';
import { LevelUpUI } from '../ui/LevelUpUI';
import { WeaponSystem } from '../systems/WeaponSystem';
import { AreaEffectSystem } from '../systems/AreaEffectSystem';
import { Chest } from '../entities/Chest';
import { GameTimer } from '../ui/GameTimer';

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
  private enemySpawner!: EnemySpawner;
  private enemyProjectileManager!: EnemyProjectileManager;
  private enemyProjectileContainer!: Container;
  private powerManager!: PowerManager;
  private levelUpUI!: LevelUpUI;
  private weaponSystem!: WeaponSystem;
  private playerProjectileContainer!: Container;
  private areaEffectSystem!: AreaEffectSystem;
  private areaEffectContainer!: Container;
  
  // Entities
  private player: Player | null = null;
  private monsters: MonsterSpawnData[] = [];
  private pickups: PickupBase[] = [];
  private chest: Chest | null = null;
  private chestMonsterData: MonsterSpawnData | null = null; // Track chest in monsters array
  
  // UI
  private gameTimer: GameTimer | null = null;
  
  // Game state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private gameStarted: boolean = false; // True after chest is broken
  
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
    
    // Initialize player projectile system (weapons and powers)
    this.playerProjectileContainer = new Container();
    this.playerProjectileContainer.label = 'PlayerProjectiles';
    this.playerProjectileContainer.zIndex = 700;
    this.gameContainer.addChild(this.playerProjectileContainer);
    
    this.weaponSystem = new WeaponSystem(
      this.assetManager,
      this.playerProjectileContainer
    );
    
   
    // Initialize area effect system (aura, explosion, magic field)
    this.areaEffectContainer = new Container();
    this.areaEffectContainer.label = 'AreaEffects';
    this.areaEffectContainer.zIndex = 650;
    this.gameContainer.addChild(this.areaEffectContainer);
    
    this.areaEffectSystem = new AreaEffectSystem(
      this.assetManager,
      this.areaEffectContainer
    );
    
    // NOW connect all systems to player (after they're all created)
    if (this.player)
    {
      this.player.setWeaponSystem(this.weaponSystem);
      this.player.setAreaEffectSystem(this.areaEffectSystem);
      
      // Provide monster targeting for powers
      this.player.getNearestMonsters = (count: number) => {
        return this.getNearestMonstersToPlayer(count);
      };
    }
    
    // Initialize enemy projectile system
    this.enemyProjectileContainer = new Container();
    this.enemyProjectileContainer.label = 'EnemyProjectiles';
    this.enemyProjectileContainer.zIndex = 600;
    this.gameContainer.addChild(this.enemyProjectileContainer);
    
    this.enemyProjectileManager = new EnemyProjectileManager(
      this.assetManager,
      this.enemyProjectileContainer,
      this.player!
    );
    
    // Initialize enemy spawner (but don't start it yet)
    this.enemySpawner = new EnemySpawner({
      assetManager: this.assetManager,
      player: this.player!,
      bounds: this.gameBounds,
      spawnRadius: 400
    });
    
    // Connect projectile manager to spawner (for plant projectiles)
    this.enemySpawner.setProjectileManager(this.enemyProjectileManager);
    
    // Initialize game timer
    this.gameTimer = new GameTimer();
    this.gameTimer.zIndex = 10000;
    
    // Position at top-center of game container
    const containerWidth = this.gameApp.screen.width;
    this.gameTimer.position.set(containerWidth / 2, 20);
    
    this.gameContainer.addChild(this.gameTimer);
    this.gameTimer.hide(); // Hidden until chest breaks
    
    // Spawn starter chest at center
    this.spawnStarterChest();
    
    // Start game loop (but game hasn't "started" until chest breaks)
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
      speed: 2.0,
      bounds: this.gameBounds,
      onLevelUp: (_newLevel: number) => {
        this.pause();
        const cards = this.powerManager.generateLevelUpCards();
        if (cards.length > 0)
        {
          this.levelUpUI.show(cards, this.gameApp.screen.width, this.gameApp.screen.height);
        }
        else
        {
          this.resume();
        }
      }
    });
    
    this.player.scale.set(2.0, 2.0);
    this.player.zIndex = 1000;
    this.gameContainer.addChild(this.player);
    
    // Initialize power manager
    this.powerManager = new PowerManager(this.player);
    
    // Initialize level-up UI
    this.levelUpUI = new LevelUpUI(this.assetManager, {
      onCardSelected: (powerUpId: string) => {
        this.powerManager.addPowerUp(powerUpId);
        this.resume();
      }
    });
    this.levelUpUI.zIndex = 10000;
    this.gameContainer.addChild(this.levelUpUI);
  }
  
  /**
   * Spawn starter chest at center of game area
   */
  private spawnStarterChest(): void
  {
    const containerWidth = this.gameApp.screen.width;
    const bgHeight = this.getBackgroundHeight();
    const greenFieldsHeight = bgHeight * 0.50;
    
    // Center of game container
    const centerX = containerWidth / 2;
    const centerY = greenFieldsHeight / 2;
    
    this.chest = new Chest(this.assetManager, {
      x: centerX,
      y: centerY,
      onBreak: () => {
        this.onChestBreak();
      }
    });
    
    this.chest.zIndex = 500;
    this.gameContainer.addChild(this.chest);
    
    // Add chest to monsters array so collision system handles it
    this.chestMonsterData = {
      monster: this.chest as any, // Chest extends BaseEntity like monsters
      monsterType: 'Chest' as any,
      respawnTimer: 0
    };
    this.monsters.push(this.chestMonsterData);
    
    console.log('[SiteGame] Starter chest spawned at center. Attack it to begin!');
  }
  
  /**
   * Called when chest is broken - starts the actual game
   */
  private onChestBreak(): void
  {
    console.log('[SiteGame] Chest broken! Starting game...');
    
    // Remove chest from monsters array
    if (this.chestMonsterData)
    {
      const index = this.monsters.indexOf(this.chestMonsterData);
      if (index !== -1)
      {
        this.monsters.splice(index, 1);
      }
      this.chestMonsterData = null;
    }
    
    // Remove chest from game container
    if (this.chest)
    {
      this.gameContainer.removeChild(this.chest);
      this.chest.destroy();
      this.chest = null;
    }
    
    // Level up player
    if (this.player)
    {
      this.player.addXP(this.player.getXPNeeded());
      console.log('[SiteGame] Player leveled up to level', this.player.getLevel());
    }
    
    // Start game timer
    if (this.gameTimer)
    {
      this.gameTimer.show();
      this.gameTimer.start();
    }
    
    // Mark game as started (enables monster spawning)
    this.gameStarted = true;
  }
  
//   /**
//    * Get random spawn position within bounds
//    */
//   private getRandomSpawnPosition(): { x: number; y: number }
//   {
//     const margin = 25; // Keep away from edges
    
//     const x = this.gameBounds.minX + margin + 
//               Math.random() * (this.gameBounds.maxX - this.gameBounds.minX - margin * 2);
//     const y = this.gameBounds.minY + margin + 
//               Math.random() * (this.gameBounds.maxY - this.gameBounds.minY - margin * 2);
    
//     return { x, y };
//   }
  
  /**
   * Spawn pickup from drop result
   */
  private spawnPickup(x: number, y: number, monsterType: MonsterType): void
  {
    // Roll for drop
    const drop = this.dropManager.rollDrop(monsterType);
    
    if (drop.type === 'none')
    {
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
    }
    
    pickup.zIndex = 100;
    
    this.gameContainer.addChild(pickup);
    this.pickups.push(pickup);
  }
  
  /**
   * Update monsters
   */
  private updateMonsters(delta: number): void
  {
    // Get new monsters from enemy spawner
    const newMonsters = this.enemySpawner.update(delta);
    
    for (const monster of newMonsters)
    {
      monster.scale.set(2.0, 2.0);
      monster.zIndex = 500;
      
      this.gameContainer.addChild(monster);
      
      // Add to monsters array with type
      const monsterType = monster.constructor.name as MonsterType;
      
      this.monsters.push({
        monster: monster,
        monsterType: monsterType,
        respawnTimer: 0
      });
    }
    
    for (let i = this.monsters.length - 1; i >= 0; i--)
    {
      const spawnData = this.monsters[i];
      
      // Check if monster is dead
      if (spawnData.monster.isDead())
      {
        // Wait for death animation to complete before removing
        if (spawnData.monster.isDeathAnimationComplete())
        {
          // Spawn pickup at death position (only once)
          if (spawnData.respawnTimer === 0)
          {
            const deathPos = spawnData.monster.getPosition();
            this.spawnPickup(deathPos.x, deathPos.y, spawnData.monsterType);
          }
          
          // Remove dead monster immediately (no respawn)
          this.gameContainer.removeChild(spawnData.monster);
          spawnData.monster.destroy();
          this.monsters.splice(i, 1);
        }
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
    
    const delta = ticker.deltaTime / 60;
    
    // Update chest if it exists (only visual updates)
    if (this.chest)
    {
      this.chest.update(delta);
    }
    
    // Update player
    if (this.player)
    {
      this.player.update(delta);
      
      // Get alive monsters (includes chest if it exists)
      const aliveMonsters = this.monsters
        .filter(s => !s.monster.isDead())
        .map(s => s.monster);
      
      // Check player attack collision (impact frames)
      // This automatically hits chest AND monsters
      if (this.player.isPlayerAttacking())
      {
        const hitMonsters = this.collisionSystem.applyAttackDamageOnImpactFrames(
          this.player,
          aliveMonsters
        );
        
        // Debug logging
        if (hitMonsters.length > 0)
        {
          console.log(`[Attack] Hit ${hitMonsters.length} entities at impact frame!`);
        }
      }
      
      // Apply monster touch damage to player (DPS model)
      // Only if game has started (chest doesn't damage player)
      if (this.gameStarted)
      {
        this.collisionSystem.applyTouchDamage(this.player, aliveMonsters, delta);
      }
    }
    
    // Only update monsters if game has started
    if (this.gameStarted)
    {
      // Update monsters (includes enemy spawner)
      this.updateMonsters(delta);
      
      // Get alive monsters for projectile collision
      const aliveMonsters = this.monsters
        .map(m => m.monster)
        .filter(m => m && !m.isDead());
      
      // Update weapon system (projectiles + collision with monsters)
      if (this.weaponSystem)
      {
        this.weaponSystem.update(delta, aliveMonsters);
      }
      
      // Update area effect system (aura, explosion, magic field)
      if (this.areaEffectSystem)
      {
        this.areaEffectSystem.update(delta, aliveMonsters);
      }
      
      // Update enemy projectiles (handles collision with player)
      this.enemyProjectileManager.update(delta);
    }
    
    // Update power manager (active powers)
    if (this.powerManager)
    {
      this.powerManager.update(delta);
    }
    
    // Update level-up UI animations
    if (this.levelUpUI && this.levelUpUI.visible)
    {
      this.levelUpUI.update(delta);
    }
    
    // Update game timer
    if (this.gameTimer)
    {
      this.gameTimer.update(delta);
    }
    
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
    
    // Update timer position
    if (this.gameTimer)
    {
      const containerWidth = this.gameApp.screen.width;
      this.gameTimer.position.set(containerWidth / 2, 20);
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
   * Get N nearest monsters to player (for power targeting)
   */
  private getNearestMonstersToPlayer(count: number): Array<{ x: number; y: number }>
  {
    if (!this.player)
    {
      return [];
    }
    
    const playerPos = this.player.getPosition();
    const aliveMonsters = this.monsters
      .map(m => m.monster)
      .filter(m => m && !m.isDead());
    
    // Calculate distances
    const monstersWithDistance = aliveMonsters.map(monster => {
      const pos = monster.getPosition();
      const dx = pos.x - playerPos.x;
      const dy = pos.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return {
        x: pos.x,
        y: pos.y,
        distance: distance
      };
    });
    
    // Sort by distance and take N nearest
    monstersWithDistance.sort((a, b) => a.distance - b.distance);
    
    return monstersWithDistance
      .slice(0, count)
      .map(m => ({ x: m.x, y: m.y }));
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
    
    // Cleanup power system
    if (this.powerManager)
    {
      this.powerManager.reset();
    }
    
    if (this.levelUpUI)
    {
      this.levelUpUI.destroy();
    }
    
    // Cleanup chest
    if (this.chest)
    {
      this.gameContainer.removeChild(this.chest);
      this.chest.destroy();
      this.chest = null;
    }
    
    this.chestMonsterData = null;
    
    // Cleanup game timer
    if (this.gameTimer)
    {
      this.gameContainer.removeChild(this.gameTimer);
      this.gameTimer.destroy();
      this.gameTimer = null;
    }
    
    // Cleanup weapon system
    if (this.weaponSystem)
    {
      this.weaponSystem.clearAll();
    }
    
    if (this.playerProjectileContainer)
    {
      this.gameContainer.removeChild(this.playerProjectileContainer);
      this.playerProjectileContainer.destroy({ children: true });
    }
    
    // Cleanup area effect system
    if (this.areaEffectSystem)
    {
      this.areaEffectSystem.clearAll();
    }
    
    if (this.areaEffectContainer)
    {
      this.gameContainer.removeChild(this.areaEffectContainer);
      this.areaEffectContainer.destroy({ children: true });
    }
    
    // Cleanup enemy projectiles
    if (this.enemyProjectileManager)
    {
      this.enemyProjectileManager.clearAll();
    }
    
    if (this.enemyProjectileContainer)
    {
      this.gameContainer.removeChild(this.enemyProjectileContainer);
      this.enemyProjectileContainer.destroy({ children: true });
    }
    
    // Reset enemy spawner
    if (this.enemySpawner)
    {
      this.enemySpawner.reset();
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