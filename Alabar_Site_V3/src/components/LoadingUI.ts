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
    // Try to find existing container or create one
    let loadingContainer = document.getElementById('loading-container');
    
    if (!loadingContainer) {
      // Create loading-container if it doesn't exist
      loadingContainer = document.createElement('div');
      loadingContainer.id = 'loading-container';
      document.body.appendChild(loadingContainer);
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
          <h1 class="font-pixel text-3xl md:text-5xl mb-8 animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent" style="text-shadow: 0 0 30px rgba(219, 39, 119, 0.5);">
            ALABAR
          </h1>
          
          <!-- Loading text -->
          <div class="font-pixel text-lg md:text-xl mb-6">
            <span class="animate-pixel-blink bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-bold">Loading Magic...</span>
            <span id="loading-progress-text" class="ml-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">0%</span>
          </div>
          
          <!-- Progress bar -->
          <div class="w-80 md:w-96 h-6 bg-rpg-dark border-2 border-rpg-accent rounded-lg overflow-hidden mx-auto">
            <div 
              id="loading-progress-bar" 
              class="h-full bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-cyan-500 transition-all duration-300"
              style="width: 0%; box-shadow: 0 0 20px rgba(219, 39, 119, 0.8);"
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

    const particleCount = 50;
    const colors = ['#FF1493', '#00CED1', '#FFD700', '#FF69B4', '#4169E1', '#32CD32', '#FF4500', '#9370DB'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none';
      particle.style.backgroundColor = randomColor;
      particle.style.boxShadow = `0 0 10px ${randomColor}, 0 0 20px ${randomColor}`;
      
      // Random starting position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Create unique animation for each particle
      const animName = `flow${i}`;
      const duration = 3 + Math.random() * 4;
      const delay = Math.random() * 2;
      
      // Random movement vectors
      const x1 = Math.random() * 400 - 200;
      const y1 = Math.random() * 400 - 200;
      const x2 = Math.random() * 600 - 300;
      const y2 = Math.random() * 600 - 300;
      
      // Create unique keyframe for this particle
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ${animName} {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            transform: translate(${x1}px, ${y1}px) scale(1.2);
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate(${x2}px, ${y2}px) scale(0.3);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      particle.style.animation = `${animName} ${duration}s ease-in-out ${delay}s infinite`;
      
      particlesContainer.appendChild(particle);
      this.particles.push(particle);
    }
    
    // Add gradient animation for progress bar
    const gradientStyle = document.createElement('style');
    gradientStyle.id = 'progress-gradient-animation';
    gradientStyle.textContent = `
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      #loading-progress-bar {
        background-size: 200% 200%;
        animation: gradientShift 3s ease infinite;
      }
    `;
    document.head.appendChild(gradientStyle);
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

    // Add completion text with gradient
    const completionText = document.createElement('div');
    completionText.className = 'font-pixel text-xl mt-8 animate-fade-in bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold';
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