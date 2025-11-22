/**
 * CursorEffectComponent.ts - Custom cursor with particle effects
 * Refactored for dedicated cursorApp (Layer 3 - Top overlay)
 */

import { Application, Container, Sprite, Graphics, Ticker } from 'pixi.js';
import { AssetManager } from '../managers/AssetManager';

interface Particle
{
  sprite: Graphics;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

interface CursorConfig
{
  particlesEnabled: boolean;
  cursorSize: number;
  particlesCount: number;
  particlesLifespan: number;
}

export class CursorEffectComponent
{
  private cursorApp: Application;
  private assetManager: AssetManager;
  private config: CursorConfig;
  
  // Cursor sprite
  private cursorSprite: Sprite | null = null;
  private cursorContainer: Container;
  
  // Particle system
  private particles: Particle[] = [];
  private particleContainer: Container;
  
  // Mouse state
  private mouseX = 0;
  private mouseY = 0;
  private isMouseInside = false;
  
  // Theme
  private currentTheme: 'light' | 'dark' = 'light';
  
  // Bound handlers
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseEnter: (() => void) | null = null;
  private boundMouseLeave: (() => void) | null = null;
  private boundThemeToggle: (() => void) | null = null;
  private boundTicker: ((ticker: Ticker) => void) | null = null;
  
  constructor(
    cursorApp: Application,
    _stage: Container, // Not needed, using cursorApp.stage directly
    assetManager: AssetManager,
    config: CursorConfig
  )
  {
    this.cursorApp = cursorApp;
    this.assetManager = assetManager;
    this.config = config;
    
    // Get initial theme
    this.currentTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    
    // Create containers
    this.particleContainer = new Container();
    this.particleContainer.label = 'particles';
    this.particleContainer.zIndex = 1;
    
    this.cursorContainer = new Container();
    this.cursorContainer.label = 'cursor';
    this.cursorContainer.zIndex = 2;
    
    // Add to cursorApp stage
    this.cursorApp.stage.addChild(this.particleContainer);
    this.cursorApp.stage.addChild(this.cursorContainer);
    
    // Initialize cursor sprite
    this.initCursorSprite();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start update loop
    this.startUpdateLoop();
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    console.log('[CursorEffect] Initialized on cursorApp');
  }
  
  /**
   * Initialize cursor sprite based on current theme
   */
  private initCursorSprite(): void
  {
    const cursorAlias = this.currentTheme === 'light' ? 'cursor_light' : 'cursor_night';
    const texture = this.assetManager.getTexture(cursorAlias);
    
    if (!texture)
    {
      console.warn(`[CursorEffect] Texture not found: ${cursorAlias}`);
      return;
    }
    
    // Remove old sprite if exists
    if (this.cursorSprite)
    {
      this.cursorContainer.removeChild(this.cursorSprite);
      this.cursorSprite.destroy();
    }
    
    // Create new cursor sprite
    this.cursorSprite = new Sprite(texture);
    this.cursorSprite.anchor.set(0.5, 0.5);
    this.cursorSprite.width = this.config.cursorSize;
    this.cursorSprite.height = this.config.cursorSize;
    
    this.cursorContainer.addChild(this.cursorSprite);
    
    // Position at current mouse
    this.updateCursorPosition();
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void
  {
    // Mouse move - track across entire window
    this.boundMouseMove = (e: MouseEvent) =>
    {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };
    window.addEventListener('mousemove', this.boundMouseMove);
    
    // Mouse enter/leave window
    this.boundMouseEnter = () =>
    {
      this.isMouseInside = true;
      if (this.cursorContainer)
      {
        this.cursorContainer.visible = true;
      }
    };
    window.addEventListener('mouseenter', this.boundMouseEnter);
    
    this.boundMouseLeave = () =>
    {
      this.isMouseInside = false;
      if (this.cursorContainer)
      {
        this.cursorContainer.visible = false;
      }
    };
    window.addEventListener('mouseleave', this.boundMouseLeave);
    
    // Theme toggle listener
    this.boundThemeToggle = () =>
    {
      const newTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (newTheme && newTheme !== this.currentTheme)
      {
        this.currentTheme = newTheme;
        this.initCursorSprite();
      }
    };
    window.addEventListener('theme:toggle', this.boundThemeToggle);
  }
  
  /**
   * Start update loop
   */
  private startUpdateLoop(): void
  {
    this.boundTicker = (ticker: Ticker) =>
    {
      this.update(ticker.deltaTime);
    };
    
    this.cursorApp.ticker.add(this.boundTicker);
  }
  
  /**
   * Main update loop
   */
  private update(delta: number): void
  {
    // Update cursor position
    this.updateCursorPosition();
    
    // Spawn particles if enabled and mouse is inside
    if (this.config.particlesEnabled && this.isMouseInside)
    {
      this.spawnParticles();
    }
    
    // Update particles
    this.updateParticles(delta);
  }
  
  /**
   * Update cursor sprite position
   */
  private updateCursorPosition(): void
  {
    if (!this.cursorSprite)
    {
      return;
    }
    
    this.cursorContainer.position.set(this.mouseX, this.mouseY);
  }
  
  /**
   * Spawn particle trail
   */
  private spawnParticles(): void
  {
    // Spawn based on config
    for (let i = 0; i < this.config.particlesCount; i++)
    {
      this.createParticle(this.mouseX, this.mouseY);
    }
  }
  
  /**
   * Create a single particle
   */
  private createParticle(x: number, y: number): void
  {
    const particle = new Graphics();
    
    // Random size
    const size = 2 + Math.random() * 3;
    
    // Theme-based color
    const color = this.currentTheme === 'light' ? 0xFFCC33 : 0x87CEEB;
    
    // Draw circle
    particle.circle(0, 0, size);
    particle.fill(color);
    
    particle.position.set(x, y);
    
    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    this.particleContainer.addChild(particle);
    
    this.particles.push(
    {
      sprite: particle,
      life: this.config.particlesLifespan,
      maxLife: this.config.particlesLifespan,
      vx: vx,
      vy: vy
    });
  }
  
  /**
   * Update all particles
   */
  private updateParticles(delta: number): void
  {
    for (let i = this.particles.length - 1; i >= 0; i--)
    {
      const particle = this.particles[i];
      
      // Decrease life
      particle.life -= delta;
      
      // Remove dead particles
      if (particle.life <= 0)
      {
        this.particleContainer.removeChild(particle.sprite);
        particle.sprite.destroy();
        this.particles.splice(i, 1);
        continue;
      }
      
      // Update position
      particle.sprite.x += particle.vx * delta;
      particle.sprite.y += particle.vy * delta;
      
      // Update alpha based on life remaining
      const lifePercent = particle.life / particle.maxLife;
      particle.sprite.alpha = lifePercent;
      
      // Scale down over time
      const scale = 0.5 + (lifePercent * 0.5);
      particle.sprite.scale.set(scale);
    }
  }
  
  /**
   * Cleanup and destroy
   */
  destroy(): void
  {
    // Remove event listeners
    if (this.boundMouseMove)
    {
      window.removeEventListener('mousemove', this.boundMouseMove);
    }
    
    if (this.boundMouseEnter)
    {
      window.removeEventListener('mouseenter', this.boundMouseEnter);
    }
    
    if (this.boundMouseLeave)
    {
      window.removeEventListener('mouseleave', this.boundMouseLeave);
    }
    
    if (this.boundThemeToggle)
    {
      window.removeEventListener('theme:toggle', this.boundThemeToggle);
    }
    
    // Remove ticker
    if (this.boundTicker)
    {
      this.cursorApp.ticker.remove(this.boundTicker);
    }
    
    // Clean up particles
    this.particles.forEach(particle =>
    {
      particle.sprite.destroy();
    });
    this.particles = [];
    
    // Clean up containers
    if (this.particleContainer)
    {
      this.particleContainer.destroy({ children: true });
    }
    
    if (this.cursorContainer)
    {
      this.cursorContainer.destroy({ children: true });
    }
    
    // Restore default cursor
    document.body.style.cursor = 'auto';
    
    console.log('[CursorEffect] Destroyed');
  }
}