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

  protected nearbyMonsters: MonsterBase[] = [];
  
  // Death animation
  protected isPlayingDeathAnimation: boolean = false;
  
  // Hurt animation
  protected isPlayingHurtAnimation: boolean = false;
  
  // Animation watchdog - prevents stuck animations
  private lastAnimationFrame: number = 0;
  private framesStuckCount: number = 0;
  private readonly MAX_FRAMES_STUCK = 120; // 2 seconds at 60fps
  
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
    // Animation will be set by moveTowardsTarget
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
    // Allow hurt to interrupt attacks (stagger mechanic)
    if (this.currentState === EntityState.ATTACKING)
    {
      // Clear attacking state and cooldown
      this.attackCooldown = this.attackCooldownMax; // Reset cooldown
      this.setState(EntityState.MOVING);
    }
    
    // Play hurt animation without blocking movement
    if (!this.isPlayingHurtAnimation)
    {
      this.isPlayingHurtAnimation = true;

      // Store current behavior before hurt animation
      const behaviorBeforeHurt = this.behavior;
      
      // Play hurt animation
      this.playAnimation('hurt', this.facingDirection, {
        loop: false,
        speed: 0.2, // Fast hurt animation
        onComplete: () => {
          this.isPlayingHurtAnimation = false;
          
          // Force resume the correct animation based on behavior when hurt started
          if (behaviorBeforeHurt === MonsterBehavior.CHASING || 
              behaviorBeforeHurt === MonsterBehavior.ROAMING ||
              behaviorBeforeHurt === MonsterBehavior.FLEEING)
          {
            this.playAnimation('run', this.facingDirection, {
              loop: true,
              speed: 0.125
            });
          }
          else
          {
            this.playAnimation('idle', this.facingDirection, {
              loop: true,
              speed: 0.08
            });
          }
        }
      });
    }
    // Override in child classes for additional hurt behavior (knockback, etc.)
  }
  
  /**
   * Hook: Called when monster dies
   */
  protected onDeath(): void
  {
    this.setState(EntityState.DEAD);
    this.isPlayingDeathAnimation = true;
    
    // Play death animation
    this.playAnimation('death', this.facingDirection, {
      loop: false,
      speed: 0.12,
      onComplete: () => {
        this.isPlayingDeathAnimation = false;
        // Animation complete - entity can now be removed
      }
    });
    
    // Override in child classes for custom death behavior (drop XP, etc.)
  }
  
/**
 * Prevent monsters from overlapping each other
 */
protected applySeparation(separationDistance = 50): void
{
    if (!this.nearbyMonsters) return;

    let pushX = 0;
    let pushY = 0;

    for (const other of this.nearbyMonsters)
    {
        if (other === this) continue;

        const dx = this.currentPosition.x - other.currentPosition.x;
        const dy = this.currentPosition.y - other.currentPosition.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 0 && dist < separationDistance)
        {
            pushX += dx / dist;
            pushY += dy / dist;
        }
    }

    if (pushX !== 0 || pushY !== 0)
    {
        this.currentPosition.x += pushX * 0.5;
        this.currentPosition.y += pushY * 0.5;

        this.position.set(this.currentPosition.x, this.currentPosition.y);
    }
}



  /**
   * Check if animation is stuck and force reset if needed
   * Safety mechanism to prevent permanent animation freeze
   */
  protected checkAnimationWatchdog(): void
  {
    if (!this.sprite || this.isDead())
    {
      return;
    }
    
    const currentFrame = Math.floor(this.sprite.currentFrame);
    
    // Check if animation is stuck on same frame
    if (currentFrame === this.lastAnimationFrame)
    {
      this.framesStuckCount++;
      
      // Animation stuck for too long - force reset
      if (this.framesStuckCount >= this.MAX_FRAMES_STUCK)
      {
        console.warn('[Monster] Animation STUCK detected! Frame:', currentFrame, 'Forcing reset. Behavior:', MonsterBehavior[this.behavior]);
        
        // Clear flags
        this.isPlayingHurtAnimation = false;
        this.framesStuckCount = 0;
        
        // Force appropriate animation based on behavior
        if (this.behavior === MonsterBehavior.CHASING || 
            this.behavior === MonsterBehavior.ROAMING ||
            this.behavior === MonsterBehavior.FLEEING)
        {
          console.warn('[Monster] Forcing RUN animation');
          this.playAnimation('run', this.facingDirection, {
            loop: true,
            speed: 0.125
          });
        }
        else if (this.behavior === MonsterBehavior.ATTACKING)
        {
          console.warn('[Monster] Forcing attack completion');
          this.onAttackComplete();
        }
        else // IDLE
        {
          console.warn('[Monster] Forcing IDLE animation');
          this.playAnimation('idle', this.facingDirection, {
            loop: true,
            speed: 0.08
          });
        }
      }
    }
    else
    {
      // Animation is progressing normally
      this.framesStuckCount = 0;
      this.lastAnimationFrame = currentFrame;
    }
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
    
    // Check for stuck animations (safety mechanism)
    this.checkAnimationWatchdog();
    
    // Update cooldowns
    this.updateAttackCooldown();
    
    // Freeze during hurt animation (brief stagger effect)
    if (this.isPlayingHurtAnimation)
    {
      return;
    }
    
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

    this.applySeparation();
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

    public setNearbyMonsters(monsters: MonsterBase[]): void
    {
        this.nearbyMonsters = monsters;
    }
    
    /**
     * Check if death animation is complete
     */
    public isDeathAnimationComplete(): boolean
    {
      return this.isDead() && !this.isPlayingDeathAnimation;
    }
}