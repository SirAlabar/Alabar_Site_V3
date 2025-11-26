/**
 * Plant2.ts - Plant monster implementation
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Plant2Config
{
  startX: number;
  startY: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class Plant2 extends MonsterBase
{
  // Ranged attack properties
  private shootCooldown: number = 0;
  private readonly SHOOT_COOLDOWN_MAX: number = 100; // 1.67 seconds
  private readonly SHOOT_RANGE: number = 450;
  private readonly MOVEMENT_CHANCE: number = 0.07;
  
  constructor(assetManager: AssetManager, config: Plant2Config)
  {
    // Define Plant2-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.45, // Slightly faster than Plant1
      spritesheetKey: 'plant2_spritesheet',
      animationPrefix: 'Plant2',
      health: 45,
      damage: 5,
      attackRange: 450, // Longer ranged attack
      detectionRange: 550,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Faster attack cooldown
    this.attackCooldownMax = 100; // 1.67 seconds
  }
  
  /**
   * Update shoot cooldown
   */
  private updateShootCooldown(): void
  {
    if (this.shootCooldown > 0)
    {
      this.shootCooldown--;
    }
  }
  
  /**
   * Check if can shoot
   */
  private canShoot(): boolean
  {
    return this.shootCooldown === 0 && 
           this.currentState !== EntityState.ATTACKING;
  }
  
  /**
   * Shoot projectile towards target
   */
  private shootAtTarget(): void
  {
    if (!this.target || !this.canShoot())
    {
      return;
    }
    
    console.log('[Plant2] Shooting stronger projectile at target!');
    
    // Play attack animation
    this.playAnimation('atk', this.facingDirection, {
      loop: false,
      speed: 0.15,
      onComplete: () => {
        this.setState(EntityState.IDLE);
      }
    });
    
    this.setState(EntityState.ATTACKING);
    this.shootCooldown = this.SHOOT_COOLDOWN_MAX;
    
    // For now, just do instant damage when in range
    const distance = this.getDistanceToTarget();
    if (distance <= this.SHOOT_RANGE)
    {
      this.target.takeDamage(this.damage * 0.016);
    }
  }
  
  /**
   * Occasionally reposition
   */
  private occasionallyReposition(): void
  {
    if (Math.random() < this.MOVEMENT_CHANCE)
    {
      // Move slightly in a random direction
      const randomAngle = Math.random() * Math.PI * 2;
      const moveDistance = 25;
      
      const newX = this.currentPosition.x + Math.cos(randomAngle) * moveDistance;
      const newY = this.currentPosition.y + Math.sin(randomAngle) * moveDistance;
      
      // Apply bounds
      const bounds = this.movementSystem.getBounds();
      const clampedX = bounds ? Math.max(bounds.minX, Math.min(bounds.maxX, newX)) : newX;
      const clampedY = bounds ? Math.max(bounds.minY, Math.min(bounds.maxY, newY)) : newY;
      
      this.setPosition(clampedX, clampedY);
    }
  }
  
  /**
   * Plant2 AI decision logic
   */
  protected makeAIDecision(): void
  {
    // Can't make decisions while attacking
    if (this.currentState === EntityState.ATTACKING)
    {
      return;
    }
    
    // Update shoot cooldown
    this.updateShootCooldown();
    
    // No target = idle
    if (!this.target)
    {
      if (this.behavior !== MonsterBehavior.IDLE)
      {
        this.transitionToIdle();
      }
      return;
    }
    
    const distance = this.getDistanceToTarget();
    
    // Target in shoot range - shoot!
    if (distance <= this.SHOOT_RANGE && this.canShoot())
    {
      // Face target
      const direction = this.getDirectionToTarget();
      const newFacing = this.directionToFacing(direction.x, direction.y);
      this.facingDirection = newFacing;
      
      // Shoot
      this.shootAtTarget();
    }
    else
    {
      // Stay mostly idle, occasionally reposition
      if (this.behavior !== MonsterBehavior.IDLE)
      {
        this.transitionToIdle();
      }
      
      this.occasionallyReposition();
    }
  }
}
