/**
 * Plant1.ts - Plant monster implementation
 */

import { AssetManager } from '../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from './BaseEntity';

export interface Plant1Config
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

export class Plant1 extends MonsterBase
{
  // Ranged attack properties
  private shootCooldown: number = 0;
  private readonly SHOOT_COOLDOWN_MAX: number = 120; // 2 seconds
  private readonly SHOOT_RANGE: number = 400; // Will shoot when player is within 400 units
  private readonly MOVEMENT_CHANCE: number = 0.05; // 5% chance to reposition per frame
  
  constructor(assetManager: AssetManager, config: Plant1Config)
  {
    // Define Plant1-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.40, // Very slow
      spritesheetKey: 'plant1_spritesheet',
      animationPrefix: 'Plant1',
      health: 30,
      damage: 3.5,
      attackRange: 400, // Ranged attack range
      detectionRange: 500,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Attack cooldown for shooting
    this.attackCooldownMax = 120; // 2 seconds between shots
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
    
    console.log('[Plant1] Shooting at target!');
    
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
      // Apply damage directly
      this.target.takeDamage(this.damage * 0.016); // ~1 damage per second at 60fps
    }
  }
  
  /**
   * Occasionally reposition
   */
  private occasionallyReposition(): void
  {
    if (Math.random() < this.MOVEMENT_CHANCE)
    {
      // Move very slightly in a random direction
      const randomAngle = Math.random() * Math.PI * 2;
      const moveDistance = 20;
      
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
   * Plant1 AI decision logic
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
