/**
 * Chest.ts - Destructible chest entity that starts the game
 * Player must break it to begin monster spawning and timer
 * Extends BaseEntity to work with existing collision system
 */

import { Sprite, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { BaseEntity, EntityConfig } from './BaseEntity';

export type ChestType = 'gray' | 'gold' | 'bone';

export interface ChestConfig
{
  x: number;
  y: number;
  type?: ChestType; // Random if not specified
  onBreak?: () => void; // Callback when chest is destroyed
}

export class Chest extends BaseEntity
{
  // Visual feedback
  private isDamaged: boolean = false;
  private damageFlashTimer: number = 0;
  private currentFrame: number = 0; // 0 = normal, 1 = damaged frame
  
  // State
  private isBroken: boolean = false;
  
  // Chest type
  private chestType: ChestType;
  
  // Callback
  private onBreakCallback?: () => void;
  
  // Frame textures
  private normalTexture: Texture | null = null;
  private damagedTexture: Texture | null = null;
  
  constructor(assetManager: AssetManager, config: ChestConfig)
  {
    // Create entity config for BaseEntity
    const entityConfig: EntityConfig = {
      startX: config.x,
      startY: config.y,
      speed: 0, // No movement
      spritesheetKey: 'collectables_spritesheet',
      animationPrefix: 'Chest', // Not used for static sprite
      health: 50
    };
    
    super(assetManager, entityConfig);
    
    this.chestType = config.type || this.getRandomChestType();
    this.onBreakCallback = config.onBreak;
    
    // Override the animated sprite with static chest sprite
    this.initializeChestSprite();
    
    // Scale up the chest
    this.scale.set(2.0, 2.0);
  }
  
  /**
   * Get random chest type
   */
  private getRandomChestType(): ChestType
  {
    const types: ChestType[] = ['gray', 'gold', 'bone'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  /**
   * Get frame names for chest type
   */
  private getFrameNames(): { normal: string; damaged: string }
  {
    // Map chest types to frame prefixes in collectables spritesheet
    const frameMap: Record<ChestType, { normal: string; damaged: string }> = {
      gray: {
        normal: 'Chest_1_0',
        damaged: 'Chest_1_1'
      },
      gold: {
        normal: 'Chest_2_0',
        damaged: 'Chest_2_1'
      },
      bone: {
        normal: 'Chest_3_0',
        damaged: 'Chest_3_1'
      }
    };
    
    return frameMap[this.chestType];
  }
  
  /**
   * Initialize chest sprite (override BaseEntity's animated sprite)
   */
  private initializeChestSprite(): void
  {
    // Remove the animated sprite created by BaseEntity
    if (this.sprite)
    {
      this.removeChild(this.sprite);
      this.sprite.destroy();
      this.sprite = null;
    }
    
    const spritesheet = this.assetManager.getSpritesheet('collectables_spritesheet');
    
    if (!spritesheet || !spritesheet.textures)
    {
      console.error('[Chest] Collectables spritesheet not found');
      return;
    }
    
    const frames = this.getFrameNames();
    
    // Get textures
    this.normalTexture = spritesheet.textures[frames.normal];
    this.damagedTexture = spritesheet.textures[frames.damaged];
    
    if (!this.normalTexture)
    {
      console.error(`[Chest] Normal texture not found: ${frames.normal}`);
      return;
    }
    
    if (!this.damagedTexture)
    {
      console.warn(`[Chest] Damaged texture not found: ${frames.damaged}, using normal texture`);
      this.damagedTexture = this.normalTexture;
    }
    
    // Create static sprite with normal texture
    const staticSprite = new Sprite(this.normalTexture);
    staticSprite.anchor.set(0.5, 0.5);
    
    this.addChild(staticSprite);
    
    // Store reference (cast to avoid type issues)
    this.sprite = staticSprite as any;
  }
  
  /**
   * Override takeDamage to trigger flash animation
   */
  takeDamage(amount: number): void
  {
    if (this.isBroken)
    {
      return;
    }
    
    // Call parent takeDamage
    super.takeDamage(amount);
    
    // Trigger damage flash animation
    this.isDamaged = true;
    this.damageFlashTimer = 0.3; // Flash for 0.3 seconds
    
    console.log(`[Chest] Took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
    
    // Check if chest is broken
    if (this.isDead())
    {
      this.breakChest();
    }
  }
  
  /**
   * Break the chest and trigger game start
   */
  private breakChest(): void
  {
    if (this.isBroken)
    {
      return;
    }
    
    this.isBroken = true;
    
    console.log('[Chest] Chest broken! Starting game...');
    
    // Trigger callback (starts game, spawns monsters, starts timer)
    if (this.onBreakCallback)
    {
      this.onBreakCallback();
    }
  }
  
  /**
   * Update chest (handle damage flash animation)
   * Required by BaseEntity
   */
  update(delta: number): void
  {
    if (this.isBroken)
    {
      return;
    }
    
    // Handle damage flash animation
    if (this.isDamaged && this.damageFlashTimer > 0)
    {
      this.damageFlashTimer -= delta;
      
      // Alternate between frames rapidly (every 0.1 seconds)
      const flashInterval = 0.1;
      const flashCount = Math.floor((0.3 - this.damageFlashTimer) / flashInterval);
      
      if (flashCount % 2 === 0)
      {
        this.showDamagedFrame();
      }
      else
      {
        this.showNormalFrame();
      }
      
      // End damage flash
      if (this.damageFlashTimer <= 0)
      {
        this.isDamaged = false;
        this.damageFlashTimer = 0;
        this.showNormalFrame();
      }
    }
  }
  
  /**
   * Show normal frame (frame 0)
   */
  private showNormalFrame(): void
  {
    if (this.sprite && this.normalTexture)
    {
      (this.sprite as Sprite).texture = this.normalTexture;
      this.currentFrame = 0;
    }
  }
  
  /**
   * Show damaged frame (frame 1)
   */
  private showDamagedFrame(): void
  {
    if (this.sprite && this.damagedTexture)
    {
      (this.sprite as Sprite).texture = this.damagedTexture;
      this.currentFrame = 1;
    }
  }
  
  /**
   * Check if chest is broken
   */
  isChestBroken(): boolean
  {
    return this.isBroken;
  }
  
  /**
   * Cleanup
   */
  destroy(options?: any): void
  {
    this.normalTexture = null;
    this.damagedTexture = null;
    
    super.destroy(options);
  }
}