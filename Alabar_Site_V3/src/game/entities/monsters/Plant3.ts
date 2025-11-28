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
  private readonly SHOOT_COOLDOWN_MAX: number = 2; // 2 seconds
  private readonly SHOOT_RANGE: number = 500; // Longest range
  private readonly PROJECTILE_SPEED: number = 4; // Fastest projectile
  
  // Reference to projectile manager (will be set externally)
  public projectileManager: any = null;
  
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
    this.attackCooldownMax = 1.5; // 1.5 seconds
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
   * Shoot powerful projectile towards target
   */
  private shootAtTarget(): void
  {
    if (!this.target || !this.canShoot())
    {
      return;
    }
    
    console.log('[Plant3] Shooting POWERFUL projectile at target!');
    
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
   * Plant3 AI decision logic
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