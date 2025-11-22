/**
 * CursorEffectComponent.ts - Custom cursor with particle effects
 * Using original geometric/blood particle system
 */

import { Application, Container, Sprite, Graphics, Ticker } from 'pixi.js';
import { AssetManager } from '../managers/AssetManager';

interface Particle
{
  graphics: Graphics;
  shape: string;
  color: number;
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  life: number;
  initialLife: number;
}

interface BloodDrop
{
  graphics: Graphics;
  x: number;
  y: number;
  color: number;
  size: number;
  velocity: { x: number; y: number };
  elongation: number;
  life: number;
  initialLife: number;
  trail: boolean;
  trailDrops: any[];
  splatter: boolean;
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
  private bloodDrops: BloodDrop[] = [];
  private particleContainer: Container;
  
  // Mouse state
  private cursorPos = { x: 0, y: 0 };
  private isMouseInside = false;
  
  // Theme
  private currentTheme: 'light' | 'dark' = 'light';
  
  // Blood drop timing
  private lastBloodTime = 0;
  private bloodDropRate = 100;
  
  // Particle configuration
  private particleShapes = ['circle', 'square', 'triangle', 'diamond', 'star'];
  private particleColors = {
    light: [0xFF5252, 0xFF7B25, 0xFFC107, 0x4CAF50, 0x2196F3, 0x9C27B0, 0xE91E63],
    dark: [0xFF0000, 0xCC0000, 0xAA0000, 0x880000, 0x990000, 0xBB0000]
  };
  
  // Bound handlers
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseLeave: (() => void) | null = null;
  private boundThemeToggle: (() => void) | null = null;
  private boundTicker: ((ticker: Ticker) => void) | null = null;
  
  constructor(
    cursorApp: Application,
    _stage: Container,
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
    this.particleContainer.sortableChildren = true;
    
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
    
    console.log('[CursorEffect] Initialized on cursorApp');
  }
  
  private initCursorSprite(): void
  {
    const cursorAlias = this.currentTheme === 'light' ? 'cursor_light' : 'cursor_night';
    const texture = this.assetManager.getTexture(cursorAlias);
    
    if (!texture)
    {
      console.warn(`[CursorEffect] Texture not found: ${cursorAlias}`);
      return;
    }
    
    if (this.cursorSprite)
    {
      this.cursorContainer.removeChild(this.cursorSprite);
      this.cursorSprite.destroy();
    }
    
    this.cursorSprite = new Sprite(texture);
    this.cursorSprite.anchor.set(0.1, 0.1);
    this.cursorSprite.width = this.config.cursorSize;
    this.cursorSprite.height = this.config.cursorSize;
    
    this.cursorContainer.addChild(this.cursorSprite);
    this.updateCursorPosition();
  }
  
  private setupEventListeners(): void
  {
    // Mouse move - track and spawn particles
    this.boundMouseMove = (e: MouseEvent) =>
    {
      const prevX = this.cursorPos.x;
      const prevY = this.cursorPos.y;
      
      this.cursorPos.x = e.clientX;
      this.cursorPos.y = e.clientY;
      this.isMouseInside = true;
      
      // Calculate distance moved
      const dx = this.cursorPos.x - prevX;
      const dy = this.cursorPos.y - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Spawn particles if significant movement
      if (distance > 1.5 && this.config.particlesEnabled)
      {
        const particleCount = Math.min(
          this.config.particlesCount,
          Math.floor(distance / 5) + 1
        );
        
        if (this.currentTheme === 'dark')
        {
          // Blood drops - spawn sparingly
          const now = Date.now();
          if (now - this.lastBloodTime >= this.bloodDropRate)
          {
            this.addParticle(this.cursorPos.x, this.cursorPos.y);
            this.lastBloodTime = now;
          }
        }
        else
        {
          // Geometric particles - spawn along path
          for (let i = 0; i < particleCount; i++)
          {
            this.addParticle(
              this.cursorPos.x - dx * (i / particleCount),
              this.cursorPos.y - dy * (i / particleCount)
            );
          }
        }
      }
    };
    window.addEventListener('mousemove', this.boundMouseMove);
    
    // Mouse leave window
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
  
  private startUpdateLoop(): void
  {
    this.boundTicker = (ticker: Ticker) =>
    {
      this.update(ticker.deltaTime);
    };
    
    this.cursorApp.ticker.add(this.boundTicker);
  }
  
  private update(_delta: number): void
  {
    // Update cursor position
    this.updateCursorPosition();
    
    // Update geometric particles (light theme)
    for (let i = this.particles.length - 1; i >= 0; i--)
    {
      const p = this.particles[i];
      
      // Update position
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      
      // Add randomness to movement
      p.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
      p.velocity.y -= Math.random() / 600;
      
      // Update rotation
      p.rotation += p.rotationSpeed;
      
      // Reduce life
      p.life--;
      
      // Calculate scale and opacity
      const lifeProgress = 1 - (p.life / p.initialLife);
      const scale = 0.2 + lifeProgress * 0.8;
      const size = p.size * scale;
      const opacity = p.life <= 0 ? 0 : Math.min(0.8, 
        lifeProgress < 0.2 
          ? lifeProgress * 4 
          : p.life < p.initialLife * 0.3 
            ? p.life / (p.initialLife * 0.3)
            : 0.8
      );
      
      // Redraw particle
      this.drawParticleShape(p, size, opacity);
      
      // Remove dead particles
      if (p.life <= 0)
      {
        this.particleContainer.removeChild(p.graphics);
        this.particles.splice(i, 1);
      }
    }
    
    // Update blood drops (dark theme)
    for (let i = this.bloodDrops.length - 1; i >= 0; i--)
    {
      const drop = this.bloodDrops[i];
      
      // Update position
      drop.x += drop.velocity.x;
      drop.y += drop.velocity.y;
      
      // Elongate as it falls
      drop.elongation = 1 + drop.velocity.y * 0.3;
      
      // Gravity
      drop.velocity.y += 0.05;
      drop.velocity.x += (Math.random() - 0.5) * 0.02;
      
      // Check splatter
      if (!drop.splatter && drop.y > this.cursorApp.screen.height - Math.random() * 100)
      {
        drop.splatter = true;
        drop.velocity.x = 0;
        drop.velocity.y = 0;
        drop.life = Math.min(drop.life, 30);
      }
      
      // Reduce life
      drop.life--;
      
      // Redraw
      this.drawBloodDrop(drop);
      
      // Remove dead drops
      if (drop.life <= 0)
      {
        this.particleContainer.removeChild(drop.graphics);
        this.bloodDrops.splice(i, 1);
      }
    }
  }
  
  private updateCursorPosition(): void
  {
    if (!this.cursorSprite)
    {
      return;
    }
    
    this.cursorContainer.position.set(this.cursorPos.x, this.cursorPos.y);
    this.cursorContainer.visible = this.isMouseInside;
  }
  
  private addParticle(x: number, y: number): void
  {
    const graphics = new Graphics();
    
    if (this.currentTheme === 'dark')
    {
      // Blood drop
      const colors = this.particleColors.dark;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 3;
      
      const bloodDrop: BloodDrop = {
        graphics,
        x,
        y,
        color,
        size,
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: 0.5 + Math.random() * 1.5
        },
        elongation: 1 + Math.random() * 2,
        life: this.config.particlesLifespan * 1.5,
        initialLife: this.config.particlesLifespan * 1.5,
        trail: Math.random() > 0.7,
        trailDrops: [],
        splatter: false
      };
      
      this.drawBloodDrop(bloodDrop);
      this.particleContainer.addChild(graphics);
      this.bloodDrops.push(bloodDrop);
    }
    else
    {
      // Geometric particle
      const shape = this.particleShapes[Math.floor(Math.random() * this.particleShapes.length)];
      const colors = this.particleColors.light;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle: Particle = {
        graphics,
        shape,
        color,
        x,
        y,
        size: 2 + Math.random() * 2,
        velocity: {
          x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
          y: -0.4 + Math.random() * -1
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        life: this.config.particlesLifespan,
        initialLife: this.config.particlesLifespan
      };
      
      this.drawParticleShape(particle, particle.size, 0.8);
      this.particleContainer.addChild(graphics);
      this.particles.push(particle);
    }
  }
  
  private drawParticleShape(particle: Particle, size: number, alpha: number): void
  {
    const g = particle.graphics;
    g.clear();
    g.alpha = alpha;
    
    switch (particle.shape)
    {
      case 'circle':
        g.circle(0, 0, size);
        g.fill(particle.color);
        g.stroke({ width: 1, color: 0xFFFFFF, alpha: alpha * 0.3 });
        break;
      case 'square':
        g.rect(-size, -size, size * 2, size * 2);
        g.fill(particle.color);
        break;
      case 'triangle':
        g.moveTo(0, -size);
        g.lineTo(-size, size);
        g.lineTo(size, size);
        g.closePath();
        g.fill(particle.color);
        break;
      case 'diamond':
        g.moveTo(0, -size);
        g.lineTo(size, 0);
        g.lineTo(0, size);
        g.lineTo(-size, 0);
        g.closePath();
        g.fill(particle.color);
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
            g.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          else
          {
            g.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
        }
        g.closePath();
        g.fill(particle.color);
        break;
    }
    
    g.x = particle.x;
    g.y = particle.y;
    g.rotation = particle.rotation;
  }
  
  private drawBloodDrop(drop: BloodDrop): void
  {
    const g = drop.graphics;
    g.clear();
    
    const lifeRatio = drop.life / drop.initialLife;
    const alpha = Math.min(1, lifeRatio * 1.5);
    
    if (!drop.splatter)
    {
      const elongation = drop.velocity.y * 0.5;
      g.ellipse(0, 0, drop.size, drop.size * (1 + elongation));
      g.fill({ color: drop.color, alpha });
      
      g.ellipse(-drop.size * 0.3, -drop.size * 0.3, drop.size * 0.4, drop.size * 0.4);
      g.fill({ color: 0xFF5555, alpha: alpha * 0.3 });
    }
    else
    {
      const splatterSize = drop.size * (1.5 + Math.random());
      g.moveTo(0, 0);
      const points = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < points; i++)
      {
        const angle = (Math.PI * 2 / points) * i;
        const radius = splatterSize * (0.5 + Math.random() * 0.8);
        g.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      g.closePath();
      g.fill({ color: drop.color, alpha: alpha * 0.8 });
    }
    
    g.x = drop.x;
    g.y = drop.y;
  }
  
  destroy(): void
  {
    if (this.boundMouseMove)
    {
      window.removeEventListener('mousemove', this.boundMouseMove);
    }
    
    if (this.boundMouseLeave)
    {
      window.removeEventListener('mouseleave', this.boundMouseLeave);
    }
    
    if (this.boundThemeToggle)
    {
      window.removeEventListener('theme:toggle', this.boundThemeToggle);
    }
    
    if (this.boundTicker)
    {
      this.cursorApp.ticker.remove(this.boundTicker);
    }
    
    this.particles.forEach(p => p.graphics.destroy());
    this.particles = [];
    
    this.bloodDrops.forEach(d => d.graphics.destroy());
    this.bloodDrops = [];
    
    if (this.particleContainer)
    {
      this.particleContainer.destroy({ children: true });
    }
    
    if (this.cursorContainer)
    {
      this.cursorContainer.destroy({ children: true });
    }
    
    console.log('[CursorEffect] Destroyed');
  }
}