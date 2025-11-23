/**
 * Player.ts - Player entity with animations and controls
 * Leo Hero character with full animation support
 */

import { AnimatedSprite, Container, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { InputManager, Direction } from '../core/Input';
import { MovementSystem, Position } from '../systems/Movement';

type AnimationState = 'idle' | 'walk' | 'attack' | 'hurt';
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
  private currentState: AnimationState = 'idle';
  private facingDirection: FacingDirection = 'Front';
  private lastDirection: Direction = null;
  
  // Attack state
  private isAttacking: boolean = false;
  private attackCooldown: number = 0;
  private readonly ATTACK_DURATION = 30; // frames (~0.5s at 60fps)
  private readonly ATTACK_COOLDOWN = 15; // frames between attacks
  
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
    
    // Create animated sprite with idle front animation as default
    const idleFrames = this.getAnimationFrames('idle', 'Front');
    if (idleFrames.length === 0)
    {
      console.error('No idle frames found for player!');
      return;
    }
    
    this.sprite = new AnimatedSprite(idleFrames);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.animationSpeed = 0.12;
    this.sprite.play();
    
    this.addChild(this.sprite);
    
    console.log('[Player] Initialized with idle animation');
  }
  
  /**
   * Get animation frames for a specific state and direction
   */
  private getAnimationFrames(state: AnimationState, direction: FacingDirection): Texture[]
  {
    const spritesheet = this.assetManager.getSpritesheet('player_spritesheet');
    if (!spritesheet || !spritesheet.animations)
    {
      return [];
    }
    
    // Build animation name: Leo_Hero_IdleFront, Leo_Hero_WalkLeft, etc.
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
   * Play a specific animation
   */
  private playAnimation(state: AnimationState, direction: FacingDirection): void
  {
    if (!this.sprite)
    {
      return;
    }
    
    // Don't interrupt attack animation
    if (this.isAttacking && state !== 'attack')
    {
      return;
    }
    
    // Get the animation frames
    const frames = this.getAnimationFrames(state, direction);
    
    if (frames.length === 0)
    {
      return;
    }
    
    // Only change animation if it's different
    const currentAnimName = `${state}${direction}`;
    const previousAnimName = `${this.currentState}${this.facingDirection}`;
    
    if (currentAnimName !== previousAnimName)
    {
      this.sprite.textures = frames;
      
      // Set animation speed based on state (matching CSS timing)
      switch (state)
      {
        case 'idle':
          this.sprite.animationSpeed = 0.1;  // 5s for 12 frames
          break;
        case 'walk':
          this.sprite.animationSpeed = 0.125; // 0.8s for 6 frames
          break;
        case 'attack':
          this.sprite.animationSpeed = 0.107; // 0.8s for 8 frames (approximate)
          break;
        case 'hurt':
          this.sprite.animationSpeed = 0.1;   // Fast hurt reaction
          break;
      }
      
      this.sprite.play();
      
      this.currentState = state;
      this.facingDirection = direction;
    }
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
        return this.facingDirection; // Keep current facing
    }
  }
  
  /**
   * Handle attack input
   */
  private handleAttack(): void
  {
    if (this.isAttacking || this.attackCooldown > 0)
    {
      return;
    }
    
    if (this.inputManager.isAttackPressed())
    {
      this.isAttacking = true;
      this.attackCooldown = this.ATTACK_DURATION + this.ATTACK_COOLDOWN;
      this.playAnimation('attack', this.facingDirection);
      
      console.log(`[Player] Attack in direction: ${this.facingDirection}`);
    }
  }
  
  /**
   * Handle movement input
   */
  private handleMovement(): void
  {
    // Don't move during attack
    if (this.isAttacking)
    {
      return;
    }
    
    const direction = this.inputManager.getDirection();
    
    if (direction)
    {
      // Update facing direction
      const newFacing = this.directionToFacing(direction);
      this.facingDirection = newFacing;
      this.lastDirection = direction;
      
      // Calculate new position
      const newPos = this.movementSystem.calculateNewPosition(
        this.currentPosition,
        direction
      );
      
      // Update position
      this.currentPosition = newPos;
      this.position.set(newPos.x, newPos.y);
      
      // Play walk animation
      this.playAnimation('walk', this.facingDirection);
    }
    else
    {
      // Play idle animation
      this.playAnimation('idle', this.facingDirection);
    }
  }
  
  /**
   * Update attack state
   */
  private updateAttackState(): void
  {
    if (this.attackCooldown > 0)
    {
      this.attackCooldown--;
    }
    
    if (this.isAttacking)
    {
      // Check if attack animation is complete
      if (this.attackCooldown <= this.ATTACK_COOLDOWN)
      {
        this.isAttacking = false;
      }
    }
  }
  
  /**
   * Main update loop
   */
  update(_delta: number): void
  {
    // Update attack state first
    this.updateAttackState();
    
    // Handle attack input
    this.handleAttack();
    
    // Handle movement (disabled during attack)
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
    return this.isAttacking;
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