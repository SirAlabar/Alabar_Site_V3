/**
 * AreaEffect.ts - Visual area damage effect (aura, explosion, magic field)
 */

import { Container, AnimatedSprite } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';

export interface AreaEffectConfig
{
  x: number;
  y: number;
  radius: number;
  damage: number;
  duration: number; // How long effect lasts (seconds)
  tickRate: number; // How often it damages (seconds)
  animationName: string;
  spritesheetKey: string;
  scale?: number;
  followTarget?: { getPosition: () => { x: number; y: number } }; // For following player (aura)
}

export class AreaEffect extends Container
{
  private sprite: AnimatedSprite | null = null;
  private radius: number;
  private damage: number;
  private duration: number;
  private tickRate: number;
  private elapsed: number = 0;
  private tickTimer: number = 0;
  private isAlive: boolean = true;
  private followTarget?: { getPosition: () => { x: number; y: number } };
  
  constructor(assetManager: AssetManager, config: AreaEffectConfig)
  {
    super();
    
    this.radius = config.radius;
    this.damage = config.damage;
    this.duration = config.duration;
    this.tickRate = config.tickRate;
    this.followTarget = config.followTarget;
    
    this.position.set(config.x, config.y);
    
    console.log(`[AreaEffect] Creating effect at (${config.x}, ${config.y}) - animation: ${config.animationName}`);
    
    this.initializeSprite(assetManager, config.spritesheetKey, config.animationName, config.scale);
  }
  
  /**
   * Initialize animated sprite
   */
  private initializeSprite(assetManager: AssetManager, spritesheetKey: string, animationName: string, scale?: number): void
  {
    const spritesheet = assetManager.getSpritesheet(spritesheetKey);
    
    if (!spritesheet || !spritesheet.animations)
    {
      console.error(`[AreaEffect] Spritesheet not found: ${spritesheetKey}`);
      return;
    }
    
    const frames = spritesheet.animations[animationName];
    
    if (!frames || frames.length === 0)
    {
      console.error(`[AreaEffect] Animation not found: ${animationName} in ${spritesheetKey}`);
      console.log('[AreaEffect] Available animations:', Object.keys(spritesheet.animations));
      return;
    }
    
    console.log(`[AreaEffect] Creating sprite with ${frames.length} frames, animation: ${animationName}`);
    
    this.sprite = new AnimatedSprite(frames);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.2;
    this.sprite.loop = true;
    this.sprite.play();
    
    if (scale)
    {
      this.sprite.scale.set(scale);
    }
    
    this.addChild(this.sprite);
    
    console.log(`[AreaEffect] Sprite created successfully`);
  }
  
  /**
   * Update effect
   */
  update(delta: number): void
  {
    if (!this.isAlive) return;
    
    // Follow target if specified (for aura)
    if (this.followTarget)
    {
      const pos = this.followTarget.getPosition();
      this.position.set(pos.x, pos.y);
    }
    
    this.elapsed += delta;
    this.tickTimer += delta;
    
    // Check if expired
    if (this.elapsed >= this.duration)
    {
      this.destroy();
    }
  }
  
  /**
   * Check if should damage this tick
   */
  shouldDamage(): boolean
  {
    if (this.tickTimer >= this.tickRate)
    {
      this.tickTimer = 0;
      return true;
    }
    return false;
  }
  
  /**
   * Get damage radius
   */
  getRadius(): number
  {
    return this.radius;
  }
  
  /**
   * Get damage amount
   */
  getDamage(): number
  {
    return this.damage;
  }
  
  /**
   * Get position
   */
  getPosition(): { x: number; y: number }
  {
    if (!this.position)
    {
      return { x: 0, y: 0 };
    }
    
    return {
      x: this.position.x,
      y: this.position.y
    };
  }
  
  /**
   * Check if alive
   */
  isEffectAlive(): boolean
  {
    return this.isAlive;
  }
  
  /**
   * Destroy effect
   */
  destroy(options?: any): void
  {
    this.isAlive = false;
    
    if (this.sprite)
    {
      this.sprite.destroy();
      this.sprite = null;
    }
    
    super.destroy(options);
  }
}