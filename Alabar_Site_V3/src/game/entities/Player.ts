/**
 * Player.ts - Player entity extending BaseEntity
 * With XP and Leveling System Integration
 */

import { AssetManager } from '../../managers/AssetManager';
import { InputManager, Direction } from '../core/Input';
import { BaseEntity, EntityConfig, EntityState, FacingDirection } from './BaseEntity';
import { HPBar } from "../ui/HPBar";
import { XPManager } from '../systems/XP';

// Player-specific states
enum PlayerState
{
  WALKING,
  STANDING,
  IDLE_PLAYING,
  ATTACKING,
  HURT
}

interface PlayerConfig
{
  startX: number;
  startY: number;
  speed: number;
  health?: number;
  damage?: number;
  attackRange?: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class Player extends BaseEntity
{
  // Input manager
  private inputManager: InputManager;
  
  // XP Manager
  private xpManager: XPManager;
  
  // Player-specific state machine
  private playerState: PlayerState = PlayerState.STANDING;
  private lastDirection: Direction = null;
  
  // Standing state timer
  private standingTimer: number = 0;
  private readonly STANDING_DURATION = 300; // 5 seconds at 60fps
  
  // Combat stats (player-specific)
  private damage: number;
  private attackRange: number;
  
  private hpBar: HPBar;

  // Attack tracking
  private attackImpactFrames: number[] = [2, 3]; // Frames where attack hitbox is active
  private monstersHitThisAttack: Set<any> = new Set(); // Track hit monsters per attack
  
  constructor(assetManager: AssetManager, config: PlayerConfig)
  {
    // Call BaseEntity constructor with EntityConfig
    const entityConfig: EntityConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: config.speed,
      spritesheetKey: 'player_spritesheet',
      animationPrefix: 'Leo_Hero',
      health: config.health ?? 80,
      bounds: config.bounds
    };
    
    super(assetManager, entityConfig);

    this.hpBar = new HPBar();
    this.addChild(this.hpBar);
    
    if (this.sprite) 
    {
        this.hpBar.y = this.sprite.height * 0.25;
        this.hpBar.x = -(this.hpBar.width / 2);
    }

    this.inputManager = InputManager.getInstance();
    
    // Initialize player-specific combat stats
    this.damage = config.damage ?? 8;
    this.attackRange = config.attackRange ?? 50;
    
    // Initialize XP Manager
    this.xpManager = new XPManager({
      startingLevel: 1,
      startingXP: 0,
      onLevelUp: (newLevel: number) => {
        console.log(`[Player] LEVEL UP! Now level ${newLevel}`);
        // TODO: Trigger level-up card selection UI
      }
    });
    
    // Initialize player to standing state
    this.transitionToStanding();
  }
  
  /**
   * Add XP to player
   */
  addXP(amount: number): void
  {
    this.xpManager.addXP(amount);
    
    // TODO: Update XP bar UI when we have it
    // const progress = this.xpManager.getXPProgress();
    // this.xpBar.update(progress, this.xpManager.getLevel());
  }
  
  /**
   * Get current level
   */
  getLevel(): number
  {
    return this.xpManager.getLevel();
  }
  
  /**
   * Get current XP
   */
  getCurrentXP(): number
  {
    return this.xpManager.getCurrentXP();
  }
  
  /**
   * Get XP needed for next level
   */
  getXPNeeded(): number
  {
    return this.xpManager.getXPNeeded();
  }
  
  /**
   * Convert input direction to facing direction
   */
  private directionToFacing(direction: Direction): FacingDirection
  {
    switch (direction)
    {
      case 'up':
        return 'Back';
      case 'down':
        return 'Front';
      case 'left':
        return 'Left';
      case 'right':
        return 'Right';
      default:
        return this.facingDirection;
    }
  }
  
  /**
   * Get player state name for debugging
   */
  private getPlayerStateName(): string
  {
    switch (this.playerState)
    {
      case PlayerState.WALKING: return 'WALKING';
      case PlayerState.STANDING: return 'STANDING';
      case PlayerState.IDLE_PLAYING: return 'IDLE_PLAYING';
      case PlayerState.ATTACKING: return 'ATTACKING';
      case PlayerState.HURT: return 'HURT';
      default: return 'UNKNOWN';
    }
  }
  
  /**
   * Transition to WALKING state
   */
  private transitionToWalking(newDirection: FacingDirection): void
  {
    this.playAnimation('walk', newDirection, {
      loop: true,
      speed: 0.125
    });
    
    this.playerState = PlayerState.WALKING;
    this.setState(EntityState.MOVING);
  }
  
  /**
   * Transition to STANDING state
   */
  private transitionToStanding(): void
  {
    this.playAnimation('idle', this.facingDirection, {
      loop: false,
      speed: 0.04
    });
    
    this.stopAnimation(0);
    
    this.standingTimer = this.STANDING_DURATION;
    this.playerState = PlayerState.STANDING;
    this.setState(EntityState.IDLE);
  }
  
  /**
   * Transition to IDLE_PLAYING state
   */
  private transitionToIdlePlaying(): void
  {
    this.playAnimation('idle', this.facingDirection, {
      loop: false,
      speed: 0.08,
      onComplete: () => {
        this.transitionToStanding();
      }
    });
    
    this.playerState = PlayerState.IDLE_PLAYING;
    this.setState(EntityState.IDLE);
  }
  
  /**
   * Transition to HURT state
   */
  private transitionToHurt(): void
  {
    this.playAnimation('hurt', this.facingDirection, {
      loop: false,
      speed: 0.15,
      onComplete: () => {
        this.transitionToStanding();
      }
    });
    
    this.playerState = PlayerState.HURT;
    this.setState(EntityState.HURT);
  }
  
  /**
   * Transition to ATTACKING state
   */
  private transitionToAttacking(): void
  {
    const frames = this.getAnimationFrames('atk', this.facingDirection);
    if (frames.length === 0)
    {
      return;
    }
    
    const frameCount = frames.length;
    
    // Reset hit list for new attack
    this.monstersHitThisAttack.clear();
    
    this.playAnimation('atk', this.facingDirection, {
      loop: false,
      speed: frameCount / 48,
      onComplete: () => {
        this.transitionToStanding();
      }
    });
    
    this.playerState = PlayerState.ATTACKING;
    this.setState(EntityState.ATTACKING);
  }
  
  /**
   * Handle attack input
   */
  private handleAttack(): void
  {
    // Can only attack from non-attacking states
    if (this.playerState === PlayerState.ATTACKING)
    {
      return;
    }
    
    if (this.inputManager.isAttackPressed())
    {
      this.transitionToAttacking();
    }
  }
  
  /**
   * Handle movement input
   */
  private handleMovement(): void
  {
    const direction = this.inputManager.getDirection();
    
    if (direction)
    {
      // Player is moving
      const newFacing = this.directionToFacing(direction);
      this.lastDirection = direction;
      
      // Calculate and apply new position
      const newPos = this.movementSystem.calculateNewPosition(
        this.currentPosition,
        direction
      );
      
      this.currentPosition = newPos;
      this.position.set(newPos.x, newPos.y);
      
      // Only change animation if NOT attacking or hurt
      if (this.playerState !== PlayerState.ATTACKING && 
          this.playerState !== PlayerState.HURT)
      {
        if (this.playerState !== PlayerState.WALKING || newFacing !== this.facingDirection)
        {
          this.transitionToWalking(newFacing);
        }
      }
    }
    else
    {
      // Only transition to standing if NOT attacking or hurt
      if (this.playerState === PlayerState.WALKING)
      {
        if (this.lastDirection)
        {
          this.facingDirection = this.directionToFacing(this.lastDirection);
        }
        
        this.transitionToStanding();
      }
    }
  }
  
  /**
   * Update STANDING state
   */
  private updateStandingState(): void
  {
    if (this.standingTimer > 0)
    {
      this.standingTimer--;
      
      if (this.standingTimer === 0)
      {
        this.transitionToIdlePlaying();
      }
    }
  }
  
  /**
   * Main update loop (implementation of BaseEntity abstract method)
   */
  update(_delta: number): void
  {
    // Don't update if dead
    if (this.isDead())
    {
      return;
    }
    
    // Update state-specific logic
    if (this.playerState === PlayerState.STANDING)
    {
      this.updateStandingState();
    }
    
    // Handle input (respecting state restrictions)
    this.handleAttack();
    this.handleMovement();
  }
  
  /**
   * Check if player is attacking
   */
  isPlayerAttacking(): boolean
  {
    return this.playerState === PlayerState.ATTACKING;
  }
  
  /**
   * Get current player state (for debugging)
   */
  getCurrentPlayerState(): string
  {
    return this.getPlayerStateName();
  }
  
  /**
   * Get player damage value
   */
  getDamage(): number
  {
    return this.damage;
  }
  
  /**
   * Get player attack range
   */
  getAttackRange(): number
  {
    return this.attackRange;
  }
  
  /**
   * Check if currently at impact frame (hitbox is active)
   */
  isAtAttackImpactFrame(): boolean
  {
    if (!this.isPlayerAttacking() || !this.sprite)
    {
      return false;
    }
    
    const currentFrame = Math.floor(this.sprite.currentFrame);
    return this.attackImpactFrames.includes(currentFrame);
  }
  
  /**
   * Check if monster was already hit during this attack
   */
  hasHitMonster(monster: any): boolean
  {
    return this.monstersHitThisAttack.has(monster);
  }
  
  /**
   * Mark monster as hit during this attack
   */
  markMonsterAsHit(monster: any): void
  {
    this.monstersHitThisAttack.add(monster);
  }
  
  /**
   * Get list of monsters hit this attack (for debugging)
   */
  getMonstersHitThisAttack(): Set<any>
  {
    return this.monstersHitThisAttack;
  }
  
  /**
   * Override takeDamage to add player death handling and hurt animation
   */
  takeDamage(amount: number): void
  {
    if (this.isDead())
    {
      return;
    }
    
    super.takeDamage(amount);

    const hpPercent = this.getHealth() / this.getMaxHealth();
    this.hpBar.update(hpPercent);
    
    if (this.isDead())
    {
      this.onPlayerDeath();
    }
    else
    {
      // Play hurt animation only if not attacking or already hurt
      if (this.playerState !== PlayerState.HURT && 
          this.playerState !== PlayerState.ATTACKING)
      {
        this.transitionToHurt();
      }
    }
  }
  
  /**
   * Handle player death
   */
  private onPlayerDeath(): void
  {
    this.playerState = PlayerState.STANDING;
    this.stopAnimation(0);
  }
}