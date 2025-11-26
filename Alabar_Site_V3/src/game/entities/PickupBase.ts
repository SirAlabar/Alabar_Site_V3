/**
 * PickupBase.ts - Abstract base class for all pickup entities
 * Handles: magnet behavior, collision, lifetime, animations
 */

import { AnimatedSprite, Container, Graphics } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';

interface BurstParticle
{
  graphics: Graphics;
  velocity: { x: number; y: number };
  life: number;
  initialLife: number;
  size: number;
}

export interface PickupConfig
{
  x: number;
  y: number;
  spritesheetKey: string;
  frameName?: string; // For static frames (e.g., "Gem_0")
  animationName?: string; // For animated sprites
  magnetRadius?: number;
  magnetSpeed?: number;
  lifetime?: number; // frames before auto-destroy (0 = infinite)
  particleContainer?: Container; // Container for spawning particles
}

export abstract class PickupBase extends Container
{
  protected assetManager: AssetManager;
  protected sprite: AnimatedSprite | null = null;
  
  // Magnet behavior
  protected magnetRadius: number;
  protected magnetSpeed: number;
  protected isBeingMagneted: boolean = false;
  
  // Lifetime
  protected lifetime: number;
  protected age: number = 0;
  
  // Pickup state
  protected isPickedUp: boolean = false;
  
  // Particle container reference
  protected particleContainer: Container | null = null;
  
  constructor(assetManager: AssetManager, config: PickupConfig)
  {
    super();
    
    this.assetManager = assetManager;
    
    // Set position
    this.position.set(config.x, config.y);
    
    // Magnet settings
    this.magnetRadius = config.magnetRadius ?? 150;
    this.magnetSpeed = config.magnetSpeed ?? 3.0;
    
    // Lifetime (0 = infinite)
    this.lifetime = config.lifetime ?? 0;
    
    // Store particle container reference
    this.particleContainer = config.particleContainer ?? null;
    
    // Initialize sprite (static frame or animation)
    this.initializeSprite(config.spritesheetKey, config.frameName, config.animationName);
    
    // Set z-index for proper layering
    this.zIndex = 100;
  }
  
  /**
   * Initialize pickup sprite
   */
  protected initializeSprite(spritesheetKey: string, frameName?: string, animationName?: string): void
  {
    const spritesheet = this.assetManager.getSpritesheet(spritesheetKey);
    
    if (!spritesheet)
    {
      console.error(`[PickupBase] Spritesheet not found: ${spritesheetKey}`);
      return;
    }
    
    // Static frame (e.g., gems)
    if (frameName)
    {
      const texture = spritesheet.textures[frameName];
      
      if (!texture)
      {
        console.error(`[PickupBase] Frame not found: ${frameName}`);
        return;
      }
      
      this.sprite = new AnimatedSprite([texture]);
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.loop = false;
      
      this.addChild(this.sprite);
      return;
    }
    
    // Animated sprite (e.g., chests)
    if (animationName && spritesheet.animations)
    {
      const frames = spritesheet.animations[animationName];
      
      if (!frames || frames.length === 0)
      {
        console.error(`[PickupBase] Animation not found: ${animationName}`);
        return;
      }
      
      this.sprite = new AnimatedSprite(frames);
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.animationSpeed = 0.1;
      this.sprite.loop = true;
      this.sprite.play();
      
      this.addChild(this.sprite);
      return;
    }
    
    console.error('[PickupBase] No frameName or animationName provided');
  }
  
  /**
   * Update magnet behavior - pulls pickup toward player
   */
  updateMagnet(playerX: number, playerY: number): void
  {
    if (this.isPickedUp)
    {
      return;
    }
    
    // Calculate distance to player
    const dx = playerX - this.position.x;
    const dy = playerY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if player is in magnet radius
    if (distance <= this.magnetRadius)
    {
      this.isBeingMagneted = true;
      
      // Move toward player
      if (distance > 5)
      {
        const moveX = (dx / distance) * this.magnetSpeed;
        const moveY = (dy / distance) * this.magnetSpeed;
        
        this.position.x += moveX;
        this.position.y += moveY;
      }
    }
    else
    {
      this.isBeingMagneted = false;
    }
  }
  
  /**
   * Update pickup (lifetime, animations, etc.)
   */
  update(_delta: number): void
  {
    if (this.isPickedUp)
    {
      return;
    }
    
    // Update age
    this.age++;
    
    // Auto-destroy if lifetime exceeded
    if (this.lifetime > 0 && this.age >= this.lifetime)
    {
      this.destroy();
    }
  }
  
  /**
   * Check if pickup is being magneted
   */
  isInMagnetRange(): boolean
  {
    return this.isBeingMagneted;
  }
  
  /**
   * Get pickup radius for collision detection
   */
  getPickupRadius(): number
  {
    return 20; // Default collision radius
  }
  
  /**
   * Get pickup position
   */
  getPosition(): { x: number; y: number }
  {
    return { x: this.position.x, y: this.position.y };
  }
  
  /**
   * Mark pickup as collected
   */
  markAsPickedUp(): void
  {
    this.isPickedUp = true;
    this.visible = false;
  }
  
  /**
   * Check if pickup was already collected
   */
  wasPickedUp(): boolean
  {
    return this.isPickedUp;
  }
  
  /**
   * Spawn burst particles
   */
  protected spawnBurstParticles(
    count: number,
    color: number,
    shapes: string[] = ['circle']
  ): void
  {
    if (!this.particleContainer)
    {
      return;
    }
    
    const particles: BurstParticle[] = [];
    
    for (let i = 0; i < count; i++)
    {
      const graphics = new Graphics();
      
      // Random angle for burst pattern
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      
      const particle: BurstParticle = {
        graphics,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: 40 + Math.random() * 20,
        initialLife: 60,
        size: 3 + Math.random() * 3
      };
      
      // Choose random shape
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      // Draw initial particle
      this.drawParticleShape(graphics, shape, particle.size, color, 1);
      graphics.x = this.position.x;
      graphics.y = this.position.y;
      
      this.particleContainer.addChild(graphics);
      particles.push(particle);
    }
    
    // Animate particles
    const animate = () =>
    {
      for (let i = particles.length - 1; i >= 0; i--)
      {
        const p = particles[i];
        
        // Update position
        p.graphics.x += p.velocity.x;
        p.graphics.y += p.velocity.y;
        
        // Apply friction
        p.velocity.x *= 0.95;
        p.velocity.y *= 0.95;
        
        // Reduce life
        p.life--;
        
        // Update alpha
        const lifeRatio = p.life / p.initialLife;
        p.graphics.alpha = Math.max(0, lifeRatio);
        
        // Update scale
        const scale = 0.5 + lifeRatio * 0.5;
        p.graphics.scale.set(scale);
        
        // Remove dead particles
        if (p.life <= 0)
        {
          if (this.particleContainer)
          {
            this.particleContainer.removeChild(p.graphics);
          }
          p.graphics.destroy();
          particles.splice(i, 1);
        }
      }
      
      // Continue animation if particles remain
      if (particles.length > 0)
      {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }
  
  /**
   * Draw particle shape
   */
  private drawParticleShape(
    graphics: Graphics,
    shape: string,
    size: number,
    color: number,
    alpha: number
  ): void
  {
    graphics.clear();
    graphics.alpha = alpha;
    
    switch (shape)
    {
      case 'circle':
        graphics.circle(0, 0, size);
        graphics.fill(color);
        break;
        
      case 'square':
        graphics.rect(-size, -size, size * 2, size * 2);
        graphics.fill(color);
        break;
        
      case 'triangle':
        graphics.moveTo(0, -size);
        graphics.lineTo(-size, size);
        graphics.lineTo(size, size);
        graphics.closePath();
        graphics.fill(color);
        break;
        
      case 'diamond':
        graphics.moveTo(0, -size);
        graphics.lineTo(size, 0);
        graphics.lineTo(0, size);
        graphics.lineTo(-size, 0);
        graphics.closePath();
        graphics.fill(color);
        break;
        
      case 'star':
        const outerRadius = size;
        const innerRadius = size / 2;
        const spikes = 5;
        for (let i = 0; i < spikes * 2; i++)
        {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * i;
          if (i === 0)
          {
            graphics.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          else
          {
            graphics.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
        }
        graphics.closePath();
        graphics.fill(color);
        break;
    }
  }
  
  /**
   * Abstract method - called when player collects this pickup
   * Must be implemented by child classes
   */
  abstract onPickup(player: any): void;
  
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