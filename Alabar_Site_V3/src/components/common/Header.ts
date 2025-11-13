/**
 * Header Component - Navigation header with Tailwind CSS
 */

export class Header {
  private listeners: Map<string, EventListener> = new Map();

  /**
   * Mount header to selector
   */
  mount(selector: string): void {
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`Header container "${selector}" not found`);
      return;
    }

    container.innerHTML = this.render();
    this.attachEventListeners();
  }

  /**
   * Render header HTML
   */
  render(): string {
    return `
      <header class="fixed top-0 left-0 right-0 z-50 bg-rpg-dark/90 backdrop-blur-md border-b border-rpg-accent/30">
        <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <!-- Logo -->
          <div class="flex items-center">
            <h1 class="text-xl md:text-2xl font-bold font-pixel text-rpg-accent">
              <a href="#/" data-link class="hover:text-rpg-accent-hover transition-colors">
                ALABAR
              </a>
            </h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#/" data-link class="nav-link font-game text-lg hover:text-rpg-accent transition-colors">
              Home
            </a>
            <a href="#/about" data-link class="nav-link font-game text-lg hover:text-rpg-accent transition-colors">
              About
            </a>
            
            <!-- Projects Dropdown -->
            <div class="relative group">
              <button class="nav-link font-game text-lg hover:text-rpg-accent transition-colors cursor-pointer">
                Projects ▾
              </button>
              <div class="absolute top-full left-0 mt-2 w-48 bg-rpg-dark border-2 border-rpg-accent/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#/projects/42" data-link class="block px-4 py-2 font-game hover:bg-rpg-accent hover:text-rpg-darker transition-colors">
                  42 Projects
                </a>
                <a href="#/projects/web" data-link class="block px-4 py-2 font-game hover:bg-rpg-accent hover:text-rpg-darker transition-colors">
                  Web
                </a>
                <a href="#/projects/mobile" data-link class="block px-4 py-2 font-game hover:bg-rpg-accent hover:text-rpg-darker transition-colors">
                  Mobile
                </a>
                <a href="#/projects/games" data-link class="block px-4 py-2 font-game hover:bg-rpg-accent hover:text-rpg-darker transition-colors">
                  Games
                </a>
              </div>
            </div>

            <a href="#/contact" data-link class="nav-link font-game text-lg hover:text-rpg-accent transition-colors">
              Contact
            </a>
          </div>

          <!-- Mobile Menu Button -->
          <button id="mobile-menu-btn" class="md:hidden text-rpg-accent hover:text-rpg-accent-hover transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </nav>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-rpg-dark border-t border-rpg-accent/30">
          <div class="px-6 py-4 space-y-3">
            <a href="#/" data-link class="block font-game text-lg hover:text-rpg-accent transition-colors">
              Home
            </a>
            <a href="#/about" data-link class="block font-game text-lg hover:text-rpg-accent transition-colors">
              About
            </a>
            <div class="pl-4 space-y-2 border-l-2 border-rpg-accent/30">
              <a href="#/projects/42" data-link class="block font-game hover:text-rpg-accent transition-colors">
                42 Projects
              </a>
              <a href="#/projects/web" data-link class="block font-game hover:text-rpg-accent transition-colors">
                Web
              </a>
              <a href="#/projects/mobile" data-link class="block font-game hover:text-rpg-accent transition-colors">
                Mobile
              </a>
              <a href="#/projects/games" data-link class="block font-game hover:text-rpg-accent transition-colors">
                Games
              </a>
            </div>
            <a href="#/contact" data-link class="block font-game text-lg hover:text-rpg-accent transition-colors">
              Contact
            </a>
          </div>
        </div>
      </header>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
      const toggleMenu = () => {
        mobileMenu.classList.toggle('hidden');
      };

      mobileMenuBtn.addEventListener('click', toggleMenu);
      this.listeners.set('mobile-menu-toggle', toggleMenu);
    }
  }

  /**
   * Reset/cleanup event listeners
   */
  resetEvents(): void {
    this.listeners.forEach((listener, key) => {
      if (key === 'mobile-menu-toggle') {
        const btn = document.getElementById('mobile-menu-btn');
        if (btn) {
          btn.removeEventListener('click', listener);
        }
      }
    });
    this.listeners.clear();
  }
}
