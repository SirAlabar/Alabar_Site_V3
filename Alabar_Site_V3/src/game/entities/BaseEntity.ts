/**
 * BaseEntity.ts - Abstract base class for all living entities (Player, Monsters, NPCs)
 */

import { AnimatedSprite, Container, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { MovementSystem, Position } from '../systems/Movement';

// Common entity states
export enum EntityState
{
  IDLE,
  MOVING,
  ATTACKING,
  HURT,
  DEAD
}

export type FacingDirection = 'Front' | 'Back' | 'Left' | 'Right';

export interface EntityConfig
{
  startX: number;
  startY: number;
  speed: number;
  spritesheetKey: string;
  animationPrefix: string; // e.g., "Leo_Hero", "Slime", "Orc"
  health: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export abstract class BaseEntity extends Container
{
  // Core components
  protected assetManager: AssetManager;
  protected movementSystem: MovementSystem;
  
  // Animation
  protected sprite: AnimatedSprite | null = null;
  protected facingDirection: FacingDirection = 'Front';
  protected spritesheetKey: string;
  protected animationPrefix: string;
  
  // State
  protected currentState: EntityState = EntityState.IDLE;
  
  // Position
  protected currentPosition: Position;
  
  // Health
  protected health: number;
  protected maxHealth: number;
  
  constructor(assetManager: AssetManager, config: EntityConfig)
  {
    super();
    
    this.assetManager = assetManager;
    this.spritesheetKey = config.spritesheetKey;
    this.animationPrefix = config.animationPrefix;
    
    // Initialize movement system
    this.movementSystem = new MovementSystem({
      speed: config.speed,
      bounds: config.bounds
    });
    
    // Set starting position
    this.currentPosition = {
      x: config.startX,
      y: config.startY
    };
    
    this.position.set(this.currentPosition.x, this.currentPosition.y);
    
    // Initialize health
    this.health = config.health;
    this.maxHealth = config.health;
    
    // Initialize sprite
    this.initializeSprite();
  }
  
  /**
   * Initialize entity sprite with animations
   */
  protected initializeSprite(): void
  {
    const spritesheet = this.assetManager.getSpritesheet(this.spritesheetKey);
    
    if (!spritesheet)
    {
      console.error(`Spritesheet not found: ${this.spritesheetKey}`);
      return;
    }
    
    // Create animated sprite with idle front frame as default
    const idleFrames = this.getAnimationFrames('idle', 'Front');
    if (idleFrames.length === 0)
    {
      console.error(`No idle frames found for entity: ${this.animationPrefix}`);
      return;
    }
    
    this.sprite = new AnimatedSprite(idleFrames);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.animationSpeed = 0.08;
    this.sprite.loop = true;
    this.sprite.play();
    
    this.addChild(this.sprite);
  }
  
  /**
   * Get animation frames for a specific state and direction
   * Uses naming convention: <prefix>_<state>_<direction>
   * Examples: "Leo_Hero_idle_down", "Slime1_run_left", "Orc_attack_up"
   */
  protected getAnimationFrames(state: string, direction: FacingDirection): Texture[]
  {
    const spritesheet = this.assetManager.getSpritesheet(this.spritesheetKey);
    if (!spritesheet || !spritesheet.animations)
    {
      return [];
    }
    
    // Convert FacingDirection to lowercase direction
    const directionMap: Record<FacingDirection, string> = {
      'Front': 'down',
      'Back': 'up',
      'Left': 'left',
      'Right': 'right'
    };
    
    const animDirection = directionMap[direction];
    const animationName = `${this.animationPrefix}_${state}_${animDirection}`;
    const frames = spritesheet.animations[animationName];
    
    if (!frames || frames.length === 0)
    {
      console.warn(`Animation not found: ${animationName}`);
      return [];
    }
    
    return frames;
  }
  
  /**
   * Play animation for given state and direction
   */
  protected playAnimation(
    state: string,
    direction: FacingDirection,
    options: {
      loop?: boolean;
      speed?: number;
      onComplete?: () => void;
    } = {}
  ): void
  {
    if (!this.sprite)
    {
      return;
    }
    
    const frames = this.getAnimationFrames(state, direction);
    if (frames.length === 0)
    {
      return;
    }
    
    // Update textures
    this.sprite.textures = frames;
    
    // Apply options
    if (options.loop !== undefined)
    {
      this.sprite.loop = options.loop;
    }
    
    if (options.speed !== undefined)
    {
      this.sprite.animationSpeed = options.speed;
    }
    
    // Set onComplete callback
    if (options.onComplete)
    {
      this.sprite.onComplete = options.onComplete;
    }
    else
    {
      this.sprite.onComplete = undefined;
    }
    
    // Update facing direction
    this.facingDirection = direction;
    
    // Play animation
    this.sprite.gotoAndPlay(0);
  }
  
  /**
   * Stop animation at specific frame
   */
  protected stopAnimation(frame: number = 0): void
  {
    if (!this.sprite)
    {
      return;
    }
    
    this.sprite.gotoAndStop(frame);
  }
  
  /**
   * Get entity position
   */
  getPosition(): Position
  {
    return { ...this.currentPosition };
  }
  
  /**
   * Set entity position
   */
  setPosition(x: number, y: number): void
  {
    this.currentPosition = { x, y };
    this.position.set(x, y);
  }
  
  /**
   * Move entity by delta
   */
  protected moveBy(dx: number, dy: number): void
  {
    this.currentPosition.x += dx;
    this.currentPosition.y += dy;
    this.position.set(this.currentPosition.x, this.currentPosition.y);
  }
  
  /**
   * Get facing direction
   */
  getFacingDirection(): FacingDirection
  {
    return this.facingDirection;
  }
  
  /**
   * Set facing direction
   */
  setFacingDirection(direction: FacingDirection): void
  {
    this.facingDirection = direction;
  }
  
  /**
   * Get current state
   */
  getCurrentState(): EntityState
  {
    return this.currentState;
  }
  
  /**
   * Set current state
   */
  protected setState(state: EntityState): void
  {
    this.currentState = state;
  }
  
  /**
   * Update movement bounds (useful for screen resize)
   */
  updateBounds(bounds: { minX: number; maxX: number; minY: number; maxY: number }): void
  {
    this.movementSystem.setBounds(bounds);
  }
  
  /**
   * Get state name for debugging
   */
  getStateName(): string
  {
    switch (this.currentState)
    {
      case EntityState.IDLE: return 'IDLE';
      case EntityState.MOVING: return 'MOVING';
      case EntityState.ATTACKING: return 'ATTACKING';
      case EntityState.HURT: return 'HURT';
      case EntityState.DEAD: return 'DEAD';
      default: return 'UNKNOWN';
    }
  }
  
  /**
   * Get current health
   */
  getHealth(): number
  {
    return this.health;
  }
  
  /**
   * Get max health
   */
  getMaxHealth(): number
  {
    return this.maxHealth;
  }
  
  /**
   * Get health percentage (0-1)
   */
  getHealthPercentage(): number
  {
    return this.health / this.maxHealth;
  }
  
  /**
   * Check if entity is alive
   */
  isAlive(): boolean
  {
    return this.health > 0;
  }
  
  /**
   * Check if entity is dead
   */
  isDead(): boolean
  {
    return this.health <= 0;
  }
  
  /**
   * Take damage
   */
  takeDamage(amount: number): void
  {
    if (this.isDead())
    {
      return;
    }
    
    this.health -= amount;
    
    if (this.health <= 0)
    {
      this.health = 0;
      this.setState(EntityState.DEAD);
    }
  }
  
  /**
   * Heal entity
   */
  heal(amount: number): void
  {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }
  
  /**
   * Abstract update method - must be implemented by child classes
   */
  abstract update(delta: number): void;
  
  /**
   * Cleanup
   */
  destroy(options?: any): void
  {
    if (this.sprite)
    {
      this.sprite.destroy();
      this.sprite = null;
    }
    
    super.destroy(options);
  }
}