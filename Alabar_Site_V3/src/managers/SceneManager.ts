/**
 * SceneManager - Manages PIXI background scenes with themes, layers, and parallax effects
 */

import { Application, Container, Sprite, Texture, Ticker } from 'pixi.js';
import { CloudsManager } from './CloudsManager';
import { AssetManager } from './AssetManager';

interface LayerConfig
{
	id: string;
	zIndex: number;
}
interface GlowLayer 
{
	scale: number;
	alpha: number;
}

interface MoonSprite extends Sprite 
{
	glowEffects?: Sprite[];
	glowLayers?: GlowLayer[];
	moonAnimation?: (delta: Ticker) => void;
}


type Theme = 'light' | 'dark';

export class SceneManager
{
	// PIXI references
	private app: Application | null;
	private backgroundGroup: Container | null;
	private assetManager: AssetManager;
	private cloudsManager: CloudsManager | null;
	
	// Layer containers
	private layers: Record<string, Container>;
	
	// Theme state
	private currentTheme: Theme;
	
	// Layer configuration
	private layerConfig: LayerConfig[];
	
	// Store bound listener for cleanup
	private boundThemeToggleListener: (() => void) | null = null;
	
	constructor(assetManager: AssetManager, cloudsManager?: CloudsManager)
	{
	  // PIXI references - will be set by setBackgroundGroup
	  this.app = null;
	  this.backgroundGroup = null;
	  this.assetManager = assetManager;
	  this.cloudsManager = cloudsManager || null;
	  
	  // Layer containers
	  this.layers = {};
	  
	  // Theme state
	  this.currentTheme = (localStorage.getItem('theme') as Theme) || 'light';
	  
	  // Layer configuration
	  this.layerConfig = [
	    { id: 'background', zIndex: -11 },
	    { id: 'mountain', zIndex: -10 },
	    { id: 'clouds', zIndex: -9 },
	    { id: 'moon', zIndex: -9 },
	    { id: 'castle', zIndex: -1 },
	    { id: 'field7', zIndex: -8 },
	    { id: 'field6', zIndex: -7 },
	    { id: 'field5', zIndex: -6 },
	    { id: 'field4', zIndex: -5 },
	    { id: 'field3', zIndex: -4 },
	    { id: 'field2', zIndex: -3 },
	    { id: 'field1', zIndex: -2 }
	  ];
	  
	  // Listen for theme toggle events from Header
	  this.setupThemeToggleListener();
	  
	  // Resize listener to update scaling when window size changes
	  window.addEventListener('resize', this.handleResize.bind(this));
	}
	
	setCloudsManager(cloudsManager: CloudsManager): void
	{
	  this.cloudsManager = cloudsManager;
	}
	
	// Set the PIXI background group and app references
	setBackgroundGroup(backgroundGroup: Container, app: Application): this
	{
	  this.backgroundGroup = backgroundGroup;
	  this.app = app;
	  
	  // Initialize the PIXI background
	  this.createPixiScene();
	  
	  // Apply the current theme
	  this.applyTheme(this.currentTheme);
	  
	  return this;
	}
	
	// Create the PIXI scene with all background layers
	createPixiScene(): void
	{
	  if (!this.backgroundGroup || !this.app)
	  {
	    console.error('PIXI background group or app not set. Call setBackgroundGroup first.');
	    return;
	  }
	  
	  // Clear existing layers if any
	  this.backgroundGroup.removeChildren();
	  this.layers = {};
	  this.backgroundGroup.sortableChildren = true;
	  
	  // Create each layer based on the configuration
	  this.layerConfig.forEach(config =>
	  {
	    const container = new Container();
	    container.label = config.id;
	    container.zIndex = config.zIndex;
	    
	    // Add to background group
	    this.backgroundGroup!.addChild(container);
	    
	    // Store reference
	    this.layers[config.id] = container;
	  });
	  
	  this.backgroundGroup.position.set(0, 0);

	  if (this.cloudsManager && this.layers["clouds"]) 
	  {
	      this.layers["clouds"].addChild(this.cloudsManager.cloudsContainer);
	  }
	}
	
	// Apply a theme to the scene
	applyTheme(theme: Theme): void
	{
	  if (!this.backgroundGroup || !this.app)
	  {
	    console.warn('PIXI not initialized yet, skipping theme application');
	    return;
	  }
	  
	  // Check if AssetManager is available
	  if (!this.assetManager)
	  {
	    console.error('AssetManager not available');
	    return;
	  }
	  
	  // First, make all layers visible
	  for (const [_id, container] of Object.entries(this.layers))
	  {
	    container.visible = true;
	  }
	  
	  // Set up the base background (color or image)
	  this.setupBackground(theme);
	  
	  // Apply textures to each layer
	  for (const [id, container] of Object.entries(this.layers))
	  {
	    // Skip the background layer, it's handled separately
	    if (id === 'background' || id === 'clouds')
	    {
	      continue;
	    }
	    
	    // Skip clouds in dark theme
	    if (id === 'clouds' && theme === 'dark')
	    {
	      container.visible = false;
	      continue;
	    }
	    
	    // Skip moon in light theme
	    if (id === 'moon' && theme === 'light')
	    {
	      container.visible = false;
	      continue;
	    }
	    
	    // Clear existing sprites
	    container.removeChildren();
	    
	    // Get the texture for this layer
	    const texture = this.assetManager.getBackgroundTexture(theme, id);
	    if (texture)
	    {
	      const sprite = new Sprite(texture);
	      // Add to container without setting dimensions yet
	      container.addChild(sprite);
	    }
	    else
	    {
	      console.warn(`No texture found for layer ${id} in theme ${theme}`);
	    }
	  }
	  
	  // Apply scaling to all layers to maintain 2:1 aspect ratio
	  this.applyBackgroundScaling();
	  
	  // Apply special effects for certain layers
	  this.applySpecialEffects(theme);
	  
	  // Update the cloud system if available
	  if (this.cloudsManager)
	  {
	    if (theme === 'light')
	    {
	      this.cloudsManager.init(theme);
	    }
	    else
	    {
	      this.cloudsManager.hideAllClouds();
	    }
	  }
	  
	  // Update current theme
	  this.currentTheme = theme;
	  localStorage.setItem('theme', theme);
	  
	  // Update the toggle button emoji
	  this.updateThemeButton(theme);
	  
	  // Update body attribute for CSS
	  document.body.setAttribute('data-theme', theme);
	}
	
	// Set up the background layer (color or image)
	setupBackground(theme: Theme): void
	{
	  const backgroundContainer = this.layers['background'];
	  if (!backgroundContainer || !this.app) return;
	  
	  // Clear existing content
	  backgroundContainer.removeChildren();
	  
	  // Create appropriate background based on theme
	  if (theme === 'dark')
	  {
	    // Try to get background texture for dark theme
	    const bgTexture = this.assetManager.getBackgroundTexture('dark', 'background');
	    
	    if (bgTexture)
	    {
	      // Create sprite with the texture
	      const bgSprite = new Sprite(bgTexture);
	      this.setupBackgroundSprite(bgSprite);
	      backgroundContainer.addChild(bgSprite);
	    }
	    else
	    {
	      // Create a colored rectangle as fallback
	      this.createColorBackground(backgroundContainer, 0x191970); // Midnight blue
	    }
	  }
	  else
	  {
	    // For light theme, just use solid color
	    this.createColorBackground(backgroundContainer, 0x87CEEB); // Sky blue
	  }
	  
	  // Apply also to CSS for fallback
	  document.documentElement.style.setProperty('--bg-color', theme === 'light' ? '#87CEEB' : '#191970');
	  document.documentElement.style.setProperty('--bg-image', theme === 'dark' ? 'url(assets/images/background/dark/background_night.webp)' : 'none');
	  
	  // Force background visibility
	  setTimeout(() =>
	  {
	    const bgContainer = this.layers['background'];
	    if (bgContainer)
	    {
	      bgContainer.visible = true;
	      bgContainer.alpha = 1;
	      bgContainer.children.forEach(child =>
	      {
	        child.visible = true;
	        child.alpha = 1;
	        child.zIndex = -999;
	      });
	    }
	  }, 500);
	}
	
	// Helper to setup background sprite sizing
    setupBackgroundSprite(sprite: Sprite): void
    {
        if (!this.app)
        {
            return;
        }
        // Apply consistent sizing and positioning
        sprite.width = this.app.screen.width;
        sprite.height = Math.max(this.app.screen.height * 3, this.app.screen.width * 2);
        
        // Set the anchor point for proper positioning
        sprite.anchor.set(0.5, 0);
        sprite.position.set(this.app.screen.width / 2, 0);
    }
	
    // Create a solid color background
    createColorBackground(container: Container, color: number): Sprite
    {
        if (!this.app) 
        {
            return new Sprite();
        }
        
        const colorTexture = Texture.WHITE;
        const bgSprite = new Sprite(colorTexture);
        
        bgSprite.tint = color;
        
        // Cover the entire viewable area with extra margin
        bgSprite.width = this.app.screen.width * 1.2;
        bgSprite.height = this.app.screen.height * 3;
        
        // Position at center of screen
        bgSprite.anchor.set(0.5, 0);
        bgSprite.position.set(this.app.screen.width / 2, 0);
        
        // Ensure this sprite stays behind everything
        bgSprite.zIndex = -9999;
        
        container.addChild(bgSprite);
        return bgSprite;
    }
	
	// Apply special visual effects to certain layers
    private applySpecialEffects(theme: string): void 
    {
        if (theme === 'dark' && this.layers['moon']) 
        {
            const moonContainer = this.layers['moon'];
            
            if (moonContainer.children.length > 0) 
            {
                const moonSprite = moonContainer.children[0] as MoonSprite;
                const originalY = moonSprite.position.y;
                
                // Clean up previous effects
                if (moonSprite.glowEffects) 
                {
                    moonSprite.glowEffects.forEach(effect => {
                        if (effect.parent) 
                        {
                            effect.parent.removeChild(effect);
                        }
                    });
                }
                
                // Initialize effects array
                moonSprite.glowEffects = [];
                
                // Configure glow layers
                const glowLayers: GlowLayer[] = [
                { scale: 1.01, alpha: 0.15 },
                { scale: 1.015, alpha: 0.1 },
                { scale: 1.02, alpha: 0.05 }
                ];
                
                moonSprite.glowLayers = glowLayers;
                
                const moonAnchorX = moonSprite.anchor.x;
                const moonAnchorY = moonSprite.anchor.y;
                
                // Create each glow layer
                glowLayers.forEach(setting => {
                    const glowSprite = new Sprite(moonSprite.texture);
                    glowSprite.anchor.set(moonAnchorX, moonAnchorY);
                    glowSprite.scale.set(
                        moonSprite.scale.x * setting.scale,
                        moonSprite.scale.y * setting.scale
                    );
                    glowSprite.alpha = setting.alpha;
                    glowSprite.tint = 0xFFFFFF;
                    moonContainer.addChildAt(glowSprite, 0);
                    moonSprite.glowEffects!.push(glowSprite);
                });
                
                // Animation function
                const animate = (_delta: Ticker): void => {
                    const time = performance.now() / 1000;
                    
                    // Moon floating
                    moonSprite.position.y = originalY + Math.sin(time * 0.4) * 10;
                    
                    // Animate glow layers
                    if (moonSprite.glowEffects && moonSprite.glowEffects.length) 
                    {
                        const layers = moonSprite.glowLayers!;
                        
                        moonSprite.glowEffects.forEach((glow, index) => {
                            glow.position.x = moonSprite.position.x;
                            glow.position.y = moonSprite.position.y;
                            
                            const phaseOffset = index * 0.3;
                            const pulse = (Math.sin((time + phaseOffset) * 0.6) + 1) / 2;
                            
                            const baseAlpha = layers[index].alpha;
                            glow.alpha = baseAlpha * (0.5 + pulse * 0.4);
                            
                            const baseScale = layers[index].scale;
                            const scaleVariation = 1 + (pulse * 0.025);
                            glow.scale.set(
                                moonSprite.scale.x * baseScale * scaleVariation,
                                moonSprite.scale.y * baseScale * scaleVariation
                            );
                        });
                    }
                };
                
                // Remove previous animation if exists
                if (moonSprite.moonAnimation && this.app) 
                {
                    this.app.ticker.remove(moonSprite.moonAnimation);
                }
                
                // Add animation to ticker
                if (this.app) 
                {
                    this.app.ticker.add(animate);
                    moonSprite.moonAnimation = animate;
                }
            }
        } 
        else if (theme === 'light') 
        {
            // Clean up moon effects in light theme
            const moonContainer = this.layers['moon'];
            if (moonContainer && moonContainer.children.length > 0) 
            {
                const moonSprite = moonContainer.children[0] as MoonSprite;
                
                if (moonSprite && moonSprite.glowEffects) 
                {
                    moonSprite.glowEffects.forEach(effect => {
                        if (effect.parent) 
                        {
                            effect.parent.removeChild(effect);
                        }
                    });
                    moonSprite.glowEffects = [];
                }
                
                if (moonSprite && moonSprite.moonAnimation && this.app) 
                {
                    this.app.ticker.remove(moonSprite.moonAnimation);
                    moonSprite.moonAnimation = undefined;
                }
            }
        }
    }

	
	// Toggle between light and dark themes
	toggleTheme(): void
	{
	  const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
	  this.applyTheme(newTheme);
	}
	
	// Update theme toggle button emoji
	updateThemeButton(theme: Theme): void
	{
	  const emoji = theme === 'light' ? '🌚' : '🌞';
	  
	  const themeToggle = document.getElementById('theme-toggle');
	  if (themeToggle)
	  {
	    themeToggle.textContent = emoji;
	  }
	  
	  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
	  if (themeToggleMobile)
	  {
	    themeToggleMobile.textContent = emoji;
	  }
	}
	
	// Set up listener for theme toggle events from Header
	setupThemeToggleListener(): void
	{
	  this.boundThemeToggleListener = () =>
	  {
	    this.toggleTheme();
	  };
	  
	  window.addEventListener('theme:toggle', this.boundThemeToggleListener);
	}
	
	// Apply scaling to maintain 2:1 ratio for all devices
	applyBackgroundScaling(): void
	{
	  if (!this.app) return;
	  
	  const screenWidth = this.app.screen.width;
	  
	  // Track maximum layer height
	  let maxLayerHeight = 0;
	  
	  // Calculate content height based on actual textures
	  for (const [_id, container] of Object.entries(this.layers))
	  {
	    for (let i = 0; i < container.children.length; i++)
	    {
	      const child = container.children[i];
	      
	      if (child instanceof Sprite)
	      {
	        // Calculate original image ratio
	        let originalRatio = 2; // Fallback
	        if (child.texture && child.texture.width && child.texture.height)
	        {
	          originalRatio = child.texture.width / child.texture.height;
	        }
	        
	        // Apply contain sizing
	        const newWidth = screenWidth;
	        const newHeight = screenWidth / originalRatio;
	        
	        // Apply dimensions
	        child.width = newWidth;
	        child.height = newHeight;
	        
	        // Center horizontally
	        child.anchor.set(0.5, 0);
	        child.position.x = screenWidth / 2;
	        
	        // Track maximum height
	        if (newHeight > maxLayerHeight)
	        {
	          maxLayerHeight = newHeight;
	        }
	      }
	    }
	  }
	  
	  // Adjust DOM elements dynamically
	  if (maxLayerHeight > 0)
	  {
	    // Adjust scene height to contain image
	    const sceneElement = document.getElementById('pixi-mount');
	    if (sceneElement)
	    {
	      sceneElement.style.height = maxLayerHeight + 'px';
	    }
	    
	    if (this.app && this.app.renderer)
	    {
	      this.app.renderer.resize(this.app.screen.width, maxLayerHeight);
	    }
	    
	    // Position game-container in lower half
	    const gameContainer = document.getElementById('game-container');
	    if (gameContainer)
	    {
	      const halfHeight = maxLayerHeight / 2;
	      gameContainer.style.top = halfHeight + 'px';
	      gameContainer.style.height = halfHeight + 'px';
	    }
	    
	    // Adjust footer position
	    const footer = document.querySelector('footer');
	    if (footer && sceneElement)
	    {
	      if (window.innerWidth <= 768)
	      {
	        // Extra margin for small screens
	        footer.style.marginTop = (maxLayerHeight + 50) + 'px';
	      }
	      else
	      {
	        // Normal margin for larger screens
	        footer.style.marginTop = maxLayerHeight + 'px';
	      }
	    }
	    
	    document.body.style.minHeight = maxLayerHeight + 'px';
	  }
	}

	
	
	// Handle window resize events
	onResize(width: number, height: number): void
	{
	  if (!this.app || !this.backgroundGroup)
	  {
	    return;
	  }
	  
	  // Update renderer dimensions
	  if (this.app.renderer)
	  {
	    this.app.renderer.resize(width, height);
	  }
	  
	  // Apply background scaling
	  this.applyBackgroundScaling();
	}
	
	// Handle window resize events to update scaling
	handleResize(): void
	{
	  // Skip if not initialized yet
	  if (!this.app || !this.backgroundGroup)
	  {
	    return;
	  }
	  
	  // Update PIXI renderer size
	  this.app.renderer.resize(window.innerWidth, window.innerHeight);
	  
	  // Update scene scaling
	  this.applyBackgroundScaling();
	  
	  // Handle navbar behavior on resize
	  const navbarCollapse = document.getElementById('navbarSupportedContent');
	  const navbarToggler = document.querySelector('.navbar-toggler');
	  
	  if (navbarCollapse && navbarToggler)
	  {
	    // Force menu to show on larger screens
	    if (window.innerWidth > 768)
	    {
	      navbarCollapse.classList.add('show');
	      navbarToggler.setAttribute('aria-expanded', 'true');
	    }
	  }
	}
	
	/**
	 * Cleanup and destroy SceneManager
	 */
	destroy(): void
	{
	  // Remove event listeners
	  window.removeEventListener('resize', this.handleResize.bind(this));
	  
	  if (this.boundThemeToggleListener)
	  {
	    window.removeEventListener('theme:toggle', this.boundThemeToggleListener);
	    this.boundThemeToggleListener = null;
	  }
	  
	  // Destroy CloudsManager
	  if (this.cloudsManager)
	  {
	    this.cloudsManager.destroy();
	    this.cloudsManager = null;
	  }
	  
	  // Clear layers
	  if (this.backgroundGroup)
	  {
	    this.backgroundGroup.removeChildren();
	    this.backgroundGroup = null;
	  }
	  
	  this.layers = {};
	  this.app = null;
	}
}

// Function to initialize the SceneManager
export function getSceneManager(assetManager: AssetManager): SceneManager
{
	if (!(window as any).sceneManager)
	{
	  (window as any).sceneManager = new SceneManager(assetManager);
	}
	return (window as any).sceneManager;
}

export function initSceneManager(assetManager: AssetManager): SceneManager
{
	return getSceneManager(assetManager);
}