/**
 * Plant3.ts - Plant monster implementation
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Plant3Config
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

export class Plant3 extends MonsterBase
{
  // Ranged attack properties (strongest plant)
  private shootCooldown: number = 0;
  private readonly SHOOT_COOLDOWN_MAX: number = 90; // 1.5 seconds
  private readonly SHOOT_RANGE: number = 500; // Longest range
  private readonly MOVEMENT_CHANCE: number = 0.10; // Most mobile plant
  
  constructor(assetManager: AssetManager, config: Plant3Config)
  {
    // Define Plant3-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.50, // Fastest plant
      spritesheetKey: 'plant3_spritesheet',
      animationPrefix: 'Plant3',
      health: 70, // Very tanky!
      damage: 6,
      attackRange: 500, // Longest ranged attack
      detectionRange: 600,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Fastest attack cooldown among plants
    this.attackCooldownMax = 90; // 1.5 seconds
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
   * Shoot powerful projectile towards target
   */
  private shootAtTarget(): void
  {
    if (!this.target || !this.canShoot())
    {
      return;
    }
    
    console.log('[Plant3] Shooting POWERFUL projectile at target!');
    
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
      // Apply strongest plant damage
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
      // Move in a random direction
      const randomAngle = Math.random() * Math.PI * 2;
      const moveDistance = 30;
      
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
   * Plant3 AI decision logic
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
