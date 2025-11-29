/**
 * Projectile.ts - Universal projectile class
 * Handles movement, animation, and collision detection for ALL projectiles
 * (Player weapons, player powers, enemy attacks)
 */

import { AnimatedSprite, Container, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';

export interface ProjectileConfig
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
  scale?: number;
  isWeapon?: boolean; // True for weapons (single frame + rotation), false for powers (multi-frame animation)
}

export class Projectile extends Container
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
  
  // Weapon rotation
  private isWeapon: boolean = false;
  private rotationSpeed: number = 0;
  
  constructor(assetManager: AssetManager, config: ProjectileConfig)
  {
    super();
    
    this.assetManager = assetManager;
    this.speed = config.speed;
    this.damage = config.damage;
    this.maxRange = config.range ?? 800;
    this.pierceCount = config.pierceCount ?? 0;
    this.pierceRemaining = this.pierceCount;
    this.isWeapon = config.isWeapon ?? false;
    
    this.position.set(config.startX, config.startY);
    
    this.calculateVelocity(config.startX, config.startY, config.targetX, config.targetY);
    
    this.initializeSprite(config.spritesheetKey, config.animationName, config.scale);
    
    // Set rotation speed for weapons (faster weapons spin faster)
    if (this.isWeapon)
    {
      this.rotationSpeed = this.speed * 0.15; // Adjust multiplier for desired spin speed
    }
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
    
    // For powers (non-weapons), face movement direction
    // For weapons, don't set rotation here - it will spin continuously
    if (!this.isWeapon)
    {
      const angle = Math.atan2(dy, dx);
      this.rotation = angle;
    }
  }
  
  /**
   * Initialize projectile sprite with animation or single frame
   */
  private initializeSprite(spritesheetKey: string, animationName: string, scale?: number): void
  {
    const spritesheet = this.assetManager.getSpritesheet(spritesheetKey);
    
    if (!spritesheet)
    {
      console.error(`[Projectile] Spritesheet not found: ${spritesheetKey}`);
      return;
    }
    
    let frames: Texture[] = [];
    
    if (this.isWeapon)
    {
      // Weapons use single frame (e.g., "Weapon_axe_0")
      if (!spritesheet.textures)
      {
        console.error(`[Projectile] Spritesheet has no textures: ${spritesheetKey}`);
        return;
      }
      
      const texture = spritesheet.textures[animationName];
      
      if (!texture)
      {
        console.error(`[Projectile] Weapon frame not found: ${animationName}`);
        return;
      }
      
      // Create single-frame "animation"
      frames = [texture];
    }
    else
    {
      // Powers use multi-frame animations (e.g., "Power_windcut_lvl1")
      if (!spritesheet.animations)
      {
        console.error(`[Projectile] Spritesheet has no animations: ${spritesheetKey}`);
        return;
      }
      
      frames = spritesheet.animations[animationName];
      
      if (!frames || frames.length === 0)
      {
        console.error(`[Projectile] Animation not found: ${animationName}`);
        return;
      }
    }
    
    this.sprite = new AnimatedSprite(frames);
    this.sprite.anchor.set(0.5, 0.5);
    
    if (this.isWeapon)
    {
      // Weapons don't play animation (single frame)
      this.sprite.animationSpeed = 0;
      this.sprite.loop = false;
      this.sprite.gotoAndStop(0);
    }
    else
    {
      // Powers play their animation
      this.sprite.animationSpeed = 0.15;
      this.sprite.loop = true;
      this.sprite.play();
    }
    
    if (scale)
    {
      this.sprite.scale.set(scale);
    }
    
    this.addChild(this.sprite);
  }
  
  /**
   * Update projectile position and rotation
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
    
    // Apply rotation for weapons (spinning effect)
    if (this.isWeapon)
    {
      this.rotation += this.rotationSpeed * delta;
    }
    
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
   * Handle collision with enemy (for player projectiles)
   */
  onHitEnemy(): boolean
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