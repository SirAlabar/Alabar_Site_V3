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
  private readonly SHOOT_COOLDOWN_MAX: number = 3; // 3 seconds
  private readonly SHOOT_RANGE: number = 450;
  private readonly PROJECTILE_SPEED: number = 3.5; // Slightly faster
  
  // Reference to projectile manager (will be set externally)
  public projectileManager: any = null;
  
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
    this.attackCooldownMax = 1.67; // 1.67 seconds
  }
  
  /**
   * Update shoot cooldown
   */
  private updateShootCooldown(delta: number): void
  {
    if (this.shootCooldown > 0)
    {
      this.shootCooldown -= delta;
      if (this.shootCooldown < 0)
      {
        this.shootCooldown = 0;
      }
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
    
    // Set state FIRST
    this.setState(EntityState.ATTACKING);
    this.shootCooldown = this.SHOOT_COOLDOWN_MAX;
    
    // Play attack animation
    this.playAnimation('atk', this.facingDirection, {
      loop: false,
      speed: 0.15,
      onComplete: () => {
        // Transition back to idle
        this.setState(EntityState.IDLE);
        this.transitionToIdle();
      }
    });
    
    // Spawn flower projectile
    if (this.projectileManager && this.target)
    {
      const targetPos = this.target.getPosition();
      
      this.projectileManager.spawnFlowerProjectile(
        this.currentPosition.x,
        this.currentPosition.y,
        targetPos.x,
        targetPos.y,
        this.damage,
        this.PROJECTILE_SPEED
      );
    }
  }
  
  /**
   * Plant2 AI decision logic
   */
  protected makeAIDecision(delta: number): void
  {
    // Can't make decisions while attacking
    if (this.currentState === EntityState.ATTACKING)
    {
      return;
    }
    
    // Update shoot cooldown
    this.updateShootCooldown(delta);
    
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
      // Stay idle - plants are stationary
      if (this.behavior !== MonsterBehavior.IDLE)
      {
        this.transitionToIdle();
      }
    }
  }
}