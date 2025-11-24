/**
 * MonsterBase.ts - Abstract base class for all monster entities
 */

import { AssetManager } from '../../managers/AssetManager';
import { BaseEntity, EntityConfig, EntityState, FacingDirection } from './BaseEntity';

export enum MonsterBehavior
{
  IDLE,
  ROAMING,
  CHASING,
  ATTACKING,
  FLEEING
}

export interface MonsterConfig
{
  startX: number;
  startY: number;
  speed: number;
  spritesheetKey: string;
  animationPrefix: string; // e.g., "Slime", "Orc", "Goblin"
  health: number;
  damage: number;
  attackRange: number;
  detectionRange: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export abstract class MonsterBase extends BaseEntity
{
  // Monster stats
  protected damage: number;
  protected attackRange: number;
  protected detectionRange: number;
  
  // AI behavior
  protected behavior: MonsterBehavior = MonsterBehavior.IDLE;
  protected target: BaseEntity | null = null;
  
  // Attack cooldown
  protected attackCooldown: number = 0;
  protected attackCooldownMax: number = 60; // 1 second at 60fps
  
  // Movement
  protected moveDirection: { x: number; y: number } = { x: 0, y: 0 };
  
  constructor(assetManager: AssetManager, config: MonsterConfig)
  {
    // Call BaseEntity constructor
    const entityConfig: EntityConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: config.speed,
      spritesheetKey: config.spritesheetKey,
      animationPrefix: config.animationPrefix,
      health: config.health,
      bounds: config.bounds
    };
    
    super(assetManager, entityConfig);
    
    // Initialize monster-specific stats
    this.damage = config.damage;
    this.attackRange = config.attackRange;
    this.detectionRange = config.detectionRange;
    
    // Start in idle state
    this.transitionToIdle();
  }
  
  /**
   * Set target entity (usually the player)
   */
  setTarget(target: BaseEntity | null): void
  {
    this.target = target;
  }
  
  /**
   * Get target entity
   */
  getTarget(): BaseEntity | null
  {
    return this.target;
  }
  
  /**
   * Calculate distance to target
   */
  protected getDistanceToTarget(): number
  {
    if (!this.target)
    {
      return Infinity;
    }
    
    const targetPos = this.target.getPosition();
    const dx = targetPos.x - this.currentPosition.x;
    const dy = targetPos.y - this.currentPosition.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Calculate direction to target
   */
  protected getDirectionToTarget(): { x: number; y: number }
  {
    if (!this.target)
    {
      return { x: 0, y: 0 };
    }
    
    const targetPos = this.target.getPosition();
    const dx = targetPos.x - this.currentPosition.x;
    const dy = targetPos.y - this.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0)
    {
      return { x: 0, y: 0 };
    }
    
    return {
      x: dx / distance,
      y: dy / distance
    };
  }
  
  /**
   * Convert movement direction to facing direction
   */
  protected directionToFacing(dx: number, dy: number): FacingDirection
  {
    // Prioritize horizontal movement
    if (Math.abs(dx) > Math.abs(dy))
    {
      return dx > 0 ? 'Right' : 'Left';
    }
    else
    {
      return dy > 0 ? 'Front' : 'Back';
    }
  }
  
  /**
   * Check if target is in detection range
   */
  protected isTargetInDetectionRange(): boolean
  {
    return this.getDistanceToTarget() <= this.detectionRange;
  }
  
  /**
   * Check if target is in attack range
   */
  protected isTargetInAttackRange(): boolean
  {
    return this.getDistanceToTarget() <= this.attackRange;
  }
  
  /**
   * Transition to IDLE state
   */
  protected transitionToIdle(): void
  {
    this.playAnimation('idle', this.facingDirection, {
      loop: true,
      speed: 0.08
    });
    
    this.behavior = MonsterBehavior.IDLE;
    this.setState(EntityState.IDLE);
    this.moveDirection = { x: 0, y: 0 };
  }
  
  /**
   * Transition to ROAMING state
   */
  protected transitionToRoaming(): void
  {
    this.behavior = MonsterBehavior.ROAMING;
    this.setState(EntityState.MOVING);
  }
  
  /**
   * Transition to CHASING state
   */
  protected transitionToChasing(): void
  {
    this.behavior = MonsterBehavior.CHASING;
    this.setState(EntityState.MOVING);
  }
  
  /**
   * Transition to ATTACKING state
   */
  protected transitionToAttacking(): void
  {
    this.playAnimation('atk', this.facingDirection, {
      loop: false,
      speed: 0.15,
      onComplete: () => {
        this.onAttackComplete();
      }
    });
    
    this.behavior = MonsterBehavior.ATTACKING;
    this.setState(EntityState.ATTACKING);
    this.attackCooldown = this.attackCooldownMax;
  }
  
  /**
   * Move towards target
   */
  protected moveTowardsTarget(): void
  {
    if (!this.target)
    {
      return;
    }
    
    const direction = this.getDirectionToTarget();
    this.moveDirection = direction;
    
    // Calculate new position using movement system
    const speed = this.movementSystem.getSpeed();
    const dx = direction.x * speed;
    const dy = direction.y * speed;
    
    // Apply bounds checking
    const bounds = this.movementSystem.getBounds();
    const newX = bounds ? Math.max(
      bounds.minX,
      Math.min(bounds.maxX, this.currentPosition.x + dx)
    ) : this.currentPosition.x + dx;
    
    const newY = bounds ? Math.max(
      bounds.minY,
      Math.min(bounds.maxY, this.currentPosition.y + dy)
    ) : this.currentPosition.y + dy;
    
    this.setPosition(newX, newY);
    
    // Update facing direction and animation
    const newFacing = this.directionToFacing(direction.x, direction.y);
    if (newFacing !== this.facingDirection || this.currentState !== EntityState.MOVING)
    {
      this.playAnimation('run', newFacing, {
        loop: true,
        speed: 0.125
      });
    }
  }
  
  /**
   * Take damage - override to add hurt behavior hook
   */
  takeDamage(amount: number): void
  {
    if (this.isDead())
    {
      return;
    }
    
    super.takeDamage(amount);
    
    if (this.isDead())
    {
      this.onDeath();
    }
    else
    {
      this.onHurt();
    }
  }
  
  /**
   * Check if monster can attack
   */
  protected canAttack(): boolean
  {
    return this.attackCooldown === 0 && 
           this.behavior !== MonsterBehavior.ATTACKING &&
           this.currentState !== EntityState.ATTACKING;
  }
  
  /**
   * Update attack cooldown
   */
  protected updateAttackCooldown(): void
  {
    if (this.attackCooldown > 0)
    {
      this.attackCooldown--;
    }
  }
  
  /**
   * Hook: Called when attack animation completes
   */
  protected onAttackComplete(): void
  {
    // Default: return to chasing or idle
    if (this.target && this.isTargetInDetectionRange())
    {
      this.transitionToChasing();
    }
    else
    {
      this.transitionToIdle();
    }
  }
  
  /**
   * Hook: Called when monster takes damage
   */
  protected onHurt(): void
  {
    // Override in child classes for custom hurt behavior
  }
  
  /**
   * Hook: Called when monster dies
   */
  protected onDeath(): void
  {
    this.setState(EntityState.DEAD);
    // Override in child classes for custom death behavior
  }
  
  /**
   * Abstract AI decision method - must be implemented by specific monsters
   */
  protected abstract makeAIDecision(): void;
  
  /**
   * Main update loop
   */
  update(_delta: number): void
  {
    // Don't update if dead
    if (!this.isAlive())
    {
      return;
    }
    
    // Update cooldowns
    this.updateAttackCooldown();
    
    // Make AI decision
    this.makeAIDecision();
    
    // Execute behavior
    switch (this.behavior)
    {
      case MonsterBehavior.CHASING:
        this.moveTowardsTarget();
        break;
        
      case MonsterBehavior.ROAMING:
        // Override in child classes for custom roaming
        break;
        
      case MonsterBehavior.FLEEING:
        // Override in child classes for custom fleeing
        break;
    }
  }
  
  /**
   * Get monster stats for debugging
   */
  getStats(): { health: number; maxHealth: number; damage: number; behavior: string }
  {
    return {
      health: this.getHealth(),
      maxHealth: this.getMaxHealth(),
      damage: this.damage,
      behavior: MonsterBehavior[this.behavior]
    };
  }
}