/**
 * LoadingUI - Visual loading screen with progress
 */

export class LoadingUI {
  private container: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressText: HTMLElement | null = null;
  private particles: HTMLElement[] = [];

  constructor() {
    this.init();
  }

  /**
   * Initialize loading UI
   */
  private init(): void {
    const loadingContainer = document.getElementById('loading-container');
    if (!loadingContainer) {
      console.error('Loading container not found');
      return;
    }

    loadingContainer.innerHTML = this.render();
    this.container = document.getElementById('loading-screen');
    this.progressBar = document.getElementById('loading-progress-bar');
    this.progressText = document.getElementById('loading-progress-text');
    
    this.createParticles();
  }

  /**
   * Render loading screen HTML
   */
  private render(): string {
    return `
      <div id="loading-screen" class="fixed inset-0 bg-rpg-darker z-[9999] flex items-center justify-center">
        <!-- Animated particles background -->
        <div id="particles-container" class="absolute inset-0 overflow-hidden"></div>
        
        <!-- Loading content -->
        <div class="relative z-10 text-center">
          <!-- Title -->
          <h1 class="font-pixel text-3xl md:text-5xl text-rpg-accent mb-8 animate-pulse">
            ALABAR
          </h1>
          
          <!-- Loading text -->
          <div class="font-pixel text-lg md:text-xl mb-6">
            <span class="text-rpg-accent animate-pixel-blink">Loading Magic...</span>
            <span id="loading-progress-text" class="ml-2 text-rpg-text">0%</span>
          </div>
          
          <!-- Progress bar -->
          <div class="w-80 md:w-96 h-6 bg-rpg-dark border-2 border-rpg-accent rounded-lg overflow-hidden mx-auto">
            <div 
              id="loading-progress-bar" 
              class="h-full bg-gradient-to-r from-rpg-accent to-rpg-accent-hover transition-all duration-300"
              style="width: 0%"
            ></div>
          </div>
          
          <!-- Flavor text -->
          <p class="font-game text-sm text-rpg-text/70 mt-6">
            Summoning pixels...
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Create animated particles
   */
  private createParticles(): void {
    const particlesContainer = document.getElementById('particles-container');
    if (!particlesContainer) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-rpg-accent rounded-full opacity-50';
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random animation delay
      particle.style.animationDelay = `${Math.random() * 3}s`;
      particle.style.animation = 'twinkle 3s ease-in-out infinite';
      
      particlesContainer.appendChild(particle);
      this.particles.push(particle);
    }

    // Add twinkle animation if not already in CSS
    if (!document.getElementById('particle-animations')) {
      const style = document.createElement('style');
      style.id = 'particle-animations';
      style.textContent = `
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Update progress
   */
  updateProgress(progress: number): void {
    const percentage = Math.round(progress * 100);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`;
    }
    
    if (this.progressText) {
      this.progressText.textContent = `${percentage}%`;
    }
  }

  /**
   * Show completion animation
   */
  async showComplete(): Promise<void> {
    if (!this.container) return;

    // Update to 100%
    this.updateProgress(1);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Add completion text
    const completionText = document.createElement('div');
    completionText.className = 'font-pixel text-xl text-rpg-accent mt-8 animate-fade-in';
    completionText.textContent = 'READY!';
    this.container.querySelector('.relative.z-10')?.appendChild(completionText);

    // Wait before hiding
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  /**
   * Hide loading screen
   */
  hide(): void {
    if (!this.container) return;

    this.container.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    
    setTimeout(() => {
      this.container?.remove();
      // Clean up particles
      this.particles.forEach(p => p.remove());
      this.particles = [];
    }, 500);
  }

  /**
   * Show loading screen again (for route changes if needed)
   */
  show(): void {
    if (this.container) {
      this.container.classList.remove('opacity-0');
    }
  }
}
