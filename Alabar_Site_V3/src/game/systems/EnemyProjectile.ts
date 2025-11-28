/**
 * EnemyProjectile.ts - Base class for enemy projectiles
 * Handles movement, animation, and collision detection for ranged enemy attacks
 */

import { AnimatedSprite, Container, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';

export interface EnemyProjectileConfig
{
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  spritesheetKey: string;
  animationName: string;
  range?: number;
  pierceCount?: number;
}

export class EnemyProjectile extends Container
{
  private assetManager: AssetManager;
  private sprite: AnimatedSprite | null = null;
  
  private velocityX: number = 0;
  private velocityY: number = 0;
  private speed: number;
  private damage: number;
  
  private distanceTraveled: number = 0;
  private maxRange: number;
  
  private pierceCount: number;
  private pierceRemaining: number;
  
  private isAlive: boolean = true;
  
  constructor(assetManager: AssetManager, config: EnemyProjectileConfig)
  {
    super();
    
    this.assetManager = assetManager;
    this.speed = config.speed;
    this.damage = config.damage;
    this.maxRange = config.range ?? 800;
    this.pierceCount = config.pierceCount ?? 0;
    this.pierceRemaining = this.pierceCount;
    
    this.position.set(config.startX, config.startY);
    
    this.calculateVelocity(config.startX, config.startY, config.targetX, config.targetY);
    
    this.initializeSprite(config.spritesheetKey, config.animationName);
  }
  
  /**
   * Calculate velocity based on direction to target
   */
  private calculateVelocity(startX: number, startY: number, targetX: number, targetY: number): void
  {
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0)
    {
      this.velocityX = this.speed;
      this.velocityY = 0;
      return;
    }
    
    this.velocityX = (dx / distance) * this.speed;
    this.velocityY = (dy / distance) * this.speed;
  }
  
  /**
   * Initialize projectile sprite with animation
   */
  private initializeSprite(spritesheetKey: string, animationName: string): void
  {
    const spritesheet = this.assetManager.getSpritesheet(spritesheetKey);
    
    if (!spritesheet || !spritesheet.animations)
    {
      console.error(`[EnemyProjectile] Spritesheet not found: ${spritesheetKey}`);
      return;
    }
    
    const frames = spritesheet.animations[animationName];
    
    if (!frames || frames.length === 0)
    {
      console.error(`[EnemyProjectile] Animation not found: ${animationName}`);
      return;
    }
    
    this.sprite = new AnimatedSprite(frames);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.animationSpeed = 0.15;
    this.sprite.loop = true;
    this.sprite.play();
    
    this.addChild(this.sprite);
  }
  
  /**
   * Update projectile position
   */
  update(delta: number): void
  {
    if (!this.isAlive)
    {
      return;
    }
    
    const moveDistance = this.speed * delta * 60;
    
    const moveX = (this.velocityX / this.speed) * moveDistance;
    const moveY = (this.velocityY / this.speed) * moveDistance;
    
    this.position.x += moveX;
    this.position.y += moveY;
    
    this.distanceTraveled += Math.sqrt(moveX * moveX + moveY * moveY);
    
    if (this.distanceTraveled >= this.maxRange)
    {
      this.destroy();
    }
  }
  
  /**
   * Handle collision with player
   */
  onHitPlayer(): boolean
  {
    if (!this.isAlive)
    {
      return false;
    }
    
    if (this.pierceRemaining > 0)
    {
      this.pierceRemaining--;
      return false;
    }
    
    this.destroy();
    return true;
  }
  
  /**
   * Get projectile damage
   */
  getDamage(): number
  {
    return this.damage;
  }
  
  /**
   * Get projectile position
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
   * Check if projectile is alive
   */
  isProjectileAlive(): boolean
  {
    return this.isAlive;
  }
  
  /**
   * Destroy projectile
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