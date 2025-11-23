/**
 * Player.ts - Player entity 
 */

import { AnimatedSprite, Container, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { InputManager, Direction } from '../core/Input';
import { MovementSystem, Position } from '../systems/Movement';

// Player states
enum PlayerState
{
  WALKING,
  STANDING,
  IDLE_PLAYING,
  ATTACKING
}

type FacingDirection = 'Front' | 'Back' | 'Left' | 'Right';

interface PlayerConfig
{
  startX: number;
  startY: number;
  speed: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class Player extends Container
{
  // Core components
  private assetManager: AssetManager;
  private inputManager: InputManager;
  private movementSystem: MovementSystem;
  
  // Animation
  private sprite: AnimatedSprite | null = null;
  private facingDirection: FacingDirection = 'Front';
  private lastDirection: Direction = null;
  
  // State machine
  private currentState: PlayerState = PlayerState.STANDING;
  
  // Standing state timer
  private standingTimer: number = 0;
  private readonly STANDING_DURATION = 300; // 5 seconds at 60fps
  
  // Position
  private currentPosition: Position;
  
  constructor(assetManager: AssetManager, config: PlayerConfig)
  {
    super();
    
    this.assetManager = assetManager;
    this.inputManager = InputManager.getInstance();
    
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
    
    // Initialize sprite and animations
    this.initializeSprite();
  }
  
  /**
   * Initialize player sprite with animations
   */
  private initializeSprite(): void
  {
    const spritesheet = this.assetManager.getSpritesheet('player_spritesheet');
    
    if (!spritesheet)
    {
      console.error('Player spritesheet not found!');
      return;
    }
    
    // Create animated sprite with idle front frame 0 as default
    const idleFrames = this.getAnimationFrames('idle', 'Front');
    if (idleFrames.length === 0)
    {
      console.error('No idle frames found for player!');
      return;
    }
    
    this.sprite = new AnimatedSprite(idleFrames);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.animationSpeed = 0.04;
    this.sprite.loop = false;
    
    this.sprite.gotoAndStop(0);

    this.standingTimer = this.STANDING_DURATION;
    
    this.addChild(this.sprite);
  }
  
  /**
   * Get animation frames for a specific state and direction
   */
  private getAnimationFrames(state: 'idle' | 'walk' | 'attack', direction: FacingDirection): Texture[]
  {
    const spritesheet = this.assetManager.getSpritesheet('player_spritesheet');
    if (!spritesheet || !spritesheet.animations)
    {
      return [];
    }
    
    const stateName = state.charAt(0).toUpperCase() + state.slice(1);
    const animationName = `Leo_Hero_${stateName}${direction}`;
    
    const frames = spritesheet.animations[animationName];
    
    if (!frames || frames.length === 0)
    {
      console.warn(`Animation not found: ${animationName}`);
      return [];
    }
    
    return frames;
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
   * Get state name for debugging
   */
  private getStateName(): string
  {
    switch (this.currentState)
    {
      case PlayerState.WALKING: return 'WALKING';
      case PlayerState.STANDING: return 'STANDING';
      case PlayerState.IDLE_PLAYING: return 'IDLE_PLAYING';
      case PlayerState.ATTACKING: return 'ATTACKING';
      default: return 'UNKNOWN';
    }
  }
  
  /**
   * Transition to WALKING state
   */
  private transitionToWalking(newDirection: FacingDirection): void
  {
    if (!this.sprite) return;
    
    const frames = this.getAnimationFrames('walk', newDirection);
    if (frames.length === 0) return;
    
    this.sprite.textures = frames;
    this.sprite.animationSpeed = 0.125;
    this.sprite.loop = true;
    this.sprite.gotoAndPlay(0);
    
    this.facingDirection = newDirection;
    this.currentState = PlayerState.WALKING;
  }
  
  /**
   * Transition to STANDING state
   */
  private transitionToStanding(): void
  {
    if (!this.sprite) return;
    
    const frames = this.getAnimationFrames('idle', this.facingDirection);
    if (frames.length === 0) return;
    
    this.sprite.textures = frames;
    this.sprite.gotoAndStop(0);
    
    this.standingTimer = this.STANDING_DURATION;
    this.currentState = PlayerState.STANDING;
  }
  
  /**
   * Transition to IDLE_PLAYING state
   */
  private transitionToIdlePlaying(): void
  {
    if (!this.sprite)
    {
        return;
    }
    
    const frames = this.getAnimationFrames('idle', this.facingDirection);
    if (frames.length === 0)
    {
        return;
    }

    this.sprite.textures = frames;
    this.sprite.animationSpeed = 0.08;
    this.sprite.loop = false;
    this.sprite.gotoAndPlay(0);
    
    // Listen for animation complete
    this.sprite.onComplete = () => {
      this.transitionToStanding();
    };
    
    this.currentState = PlayerState.IDLE_PLAYING;

  }
  
  /**
   * Transition to ATTACKING state
   */
  private transitionToAttacking(): void
  {
    if (!this.sprite)
    {
        return;
    }
    
    const frames = this.getAnimationFrames('attack', this.facingDirection);
    if (frames.length === 0)
    {
        return;
    }
    
    const frameCount = frames.length;
    this.sprite.textures = frames;
    this.sprite.animationSpeed = frameCount / 48;
    this.sprite.loop = false;
    this.sprite.gotoAndPlay(0);
    
    // Listen for animation complete
    this.sprite.onComplete = () => {
      this.transitionToStanding();
    };
    
    this.currentState = PlayerState.ATTACKING;
  }
  
  /**
   * Handle attack input
   */
  private handleAttack(): void
  {
    // Can only attack from non-attacking states
    if (this.currentState === PlayerState.ATTACKING)
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
    // Can't move during attack
    if (this.currentState === PlayerState.ATTACKING)
    {
      return;
    }
    
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
      
      if (this.currentState !== PlayerState.WALKING || newFacing !== this.facingDirection)
      {
        this.transitionToWalking(newFacing);
      }
    }
    else
    {
      if (this.currentState === PlayerState.WALKING)
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
   * Main update loop
   */
  update(_delta: number): void
  {
    
    // Update state-specific logic
    if (this.currentState === PlayerState.STANDING)
    {
      this.updateStandingState();
    }
    
    // Handle input (respecting state restrictions)
    this.handleAttack();
    this.handleMovement();
  }
  
  /**
   * Get player position
   */
  getPosition(): Position
  {
    return { ...this.currentPosition };
  }
  
  /**
   * Set player position
   */
  setPosition(x: number, y: number): void
  {
    this.currentPosition = { x, y };
    this.position.set(x, y);
  }
  
  /**
   * Get facing direction
   */
  getFacingDirection(): FacingDirection
  {
    return this.facingDirection;
  }
  
  /**
   * Check if player is attacking
   */
  isPlayerAttacking(): boolean
  {
    return this.currentState === PlayerState.ATTACKING;
  }
  
  /**
   * Get current state (for debugging)
   */
  getCurrentState(): string
  {
    return this.getStateName();
  }
  
  /**
   * Update movement bounds (useful for screen resize)
   */
  updateBounds(bounds: { minX: number; maxX: number; minY: number; maxY: number }): void
  {
    this.movementSystem.setBounds(bounds);
  }
  
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