/**
 * Header Component - Navigation header with liquid glass effect
 * Updated with Avatar GIF, real social links, and theme toggle
 */

export class Header
{
  private listeners: Map<string, EventListener> = new Map();

  /**
   * Mount header to selector
   */
  mount(selector: string): void
  {
    const container = document.querySelector(selector);
    if (!container)
    {
      console.error(`Header container "${selector}" not found`);
      return;
    }

    container.innerHTML = this.render();
    this.attachEventListeners();
  }

  /**
   * Render header HTML with liquid glass effect
   */
  render(): string
  {
    return `
      <header class="fixed top-0 left-0 right-0 z-50 bg-rpg-dark/20 backdrop-blur-xl border-b-2 border-rpg-accent/20 shadow-lg">
        <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-1">
          <!-- Left: Avatar Logo -->
          <div class="flex items-center">
            <a href="/" data-link class="block hover:scale-110 transition-transform duration-200">
              <img src="/assets/images/Avatar_Profile_64px.gif" alt="Alabar Avatar" class="w-16 h-16 rounded-full border-2 border-rpg-accent shadow-avatar">
            </a>
          </div>

          <!-- Center: Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-6">
            <a href="/" data-link class="nav-link font-pixel pixel-font pixel-shadow text-sm text-rpg-text hover:text-rpg-accent transition-all duration-200 hover:scale-110">
              Home
            </a>
            <a href="/about" data-link class="nav-link font-pixel pixel-font pixel-shadow text-sm text-rpg-text hover:text-rpg-accent transition-all duration-200 hover:scale-110">
              About
            </a>
            <a href="/contact" data-link class="nav-link font-pixel pixel-font pixel-shadow text-sm text-rpg-text hover:text-rpg-accent transition-all duration-200 hover:scale-110">
              Contact
            </a>
            
            <!-- Projects Dropdown -->
            <div class="relative group">
              <button class="nav-link font-pixel pixel-font pixel-shadow text-sm text-rpg-text hover:text-rpg-accent transition-all duration-200 cursor-pointer flex items-center gap-1">
                Projects
                <svg class="w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <div class="absolute top-full left-0 mt-2 w-48 bg-rpg-dark/30 backdrop-blur-2xl border border-rpg-accent/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                <a href="/projects/42" data-link class="block px-4 py-3 font-pixel pixel-font pixel-shadow text-xs text-rpg-text hover:bg-rpg-accent hover:text-rpg-darker transition-all duration-200 rounded-t-lg">
                  42 School
                </a>
                <a href="/projects/web" data-link class="block px-4 py-3 font-pixel pixel-font pixel-shadow text-xs text-rpg-text hover:bg-rpg-accent hover:text-rpg-darker transition-all duration-200">
                  Web
                </a>
                <a href="/projects/mobile" data-link class="block px-4 py-3 font-pixel pixel-font pixel-shadow text-xs text-rpg-text hover:bg-rpg-accent hover:text-rpg-darker transition-all duration-200">
                  Mobile
                </a>
                <a href="/projects/games" data-link class="block px-4 py-3 font-pixel pixel-font pixel-shadow text-xs text-rpg-text hover:text-rpg-accent hover:text-rpg-darker transition-all duration-200 rounded-b-lg">
                  Games
                </a>
              </div>
            </div>
          </div>

          <!-- Right: Social Icons + Theme Toggle -->
          <div class="hidden md:flex items-center space-x-3">
            <!-- GitHub -->
            <a href="https://github.com/SirAlabar" target="_blank" rel="noopener noreferrer" 
               class="w-12 h-12 rounded-full bg-rpg-accent/10 border-2 border-rpg-accent/30 flex items-center justify-center hover:bg-rpg-accent/20 hover:border-rpg-accent transition-all duration-200 hover:scale-110 group">
              <img src="/assets/images/github_logo.png" alt="GitHub" class="w-9 h-9 opacity-80 group-hover:opacity-100 transition-opacity">
            </a>
            
            <!-- LinkedIn -->
            <a href="https://linkedin.com/in/hugollmarta" target="_blank" rel="noopener noreferrer" 
               class="w-12 h-12 rounded-full bg-rpg-accent/10 border-2 border-rpg-accent/30 flex items-center justify-center hover:bg-rpg-accent/20 hover:border-rpg-accent transition-all duration-200 hover:scale-110 group">
              <img src="/assets/images/linkedin_logo.png" alt="LinkedIn" class="w-7 h-7 opacity-80 group-hover:opacity-100 transition-opacity">
            </a>
            
            <!-- Theme Toggle -->
            <button id="theme-toggle" 
                    class="w-12 h-12 rounded-full bg-rpg-accent/10 border-2 border-rpg-accent/30 flex items-center justify-center hover:bg-rpg-accent/20 hover:border-rpg-accent transition-all duration-200 hover:scale-110 text-3xl">
              🌚
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <button id="mobile-menu-btn" class="md:hidden text-rpg-accent hover:text-rpg-accent-hover transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </nav>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-rpg-dark/90 backdrop-blur-xl border-t border-rpg-accent/30">
          <div class="px-6 py-4 space-y-4">
            <a href="/" data-link class="block font-pixel text-sm text-rpg-text hover:text-rpg-accent transition-colors">
              Home
            </a>
            <a href="/about" data-link class="block font-pixel text-sm text-rpg-text hover:text-rpg-accent transition-colors">
              About
            </a>
            <a href="/contact" data-link class="block font-pixel text-sm text-rpg-text hover:text-rpg-accent transition-colors">
              Contact
            </a>
            <div class="pl-4 space-y-3 border-l-2 border-rpg-accent/30">
              <p class="font-pixel text-xs text-rpg-accent">Projects:</p>
              <a href="/projects/42" data-link class="block font-pixel text-xs text-rpg-text hover:text-rpg-accent transition-colors">
                42 School
              </a>
              <a href="/projects/web" data-link class="block font-pixel text-xs text-rpg-text hover:text-rpg-accent transition-colors">
                Web
              </a>
              <a href="/projects/mobile" data-link class="block font-pixel text-xs text-rpg-text hover:text-rpg-accent transition-colors">
                Mobile
              </a>
              <a href="/projects/games" data-link class="block font-pixel text-xs text-rpg-text hover:text-rpg-accent transition-colors">
                Games
              </a>
            </div>
            
            <!-- Mobile Social Links + Theme Toggle -->
            <div class="flex items-center justify-center space-x-4 pt-4 border-t border-rpg-accent/30">
              <a href="https://github.com/SirAlabar" target="_blank" rel="noopener noreferrer" class="hover:scale-110 transition-transform">
                <img src="/assets/images/github_logo.png" alt="GitHub" class="w-8 h-8">
              </a>
              <a href="https://linkedin.com/in/hugollmarta" target="_blank" rel="noopener noreferrer" class="hover:scale-110 transition-transform">
                <img src="/assets/images/linkedin_logo.png" alt="LinkedIn" class="w-8 h-8">
              </a>
              <button id="theme-toggle-mobile" class="text-2xl hover:scale-110 transition-transform">
                🌚
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void
  {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu)
    {
      const toggleMenu = () =>
      {
        mobileMenu.classList.toggle('hidden');
      };

      mobileMenuBtn.addEventListener('click', toggleMenu);
      this.listeners.set('mobile-menu-toggle', toggleMenu);
    }

    // Theme toggle - Desktop
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle)
    {
      const handleThemeToggle = () =>
      {
        // Dispatch custom event for SceneManager to handle
        window.dispatchEvent(new CustomEvent('theme:toggle'));
      };

      themeToggle.addEventListener('click', handleThemeToggle);
      this.listeners.set('theme-toggle', handleThemeToggle);
    }

    // Theme toggle - Mobile
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    if (themeToggleMobile)
    {
      const handleThemeToggleMobile = () =>
      {
        // Dispatch custom event for SceneManager to handle
        window.dispatchEvent(new CustomEvent('theme:toggle'));
      };

      themeToggleMobile.addEventListener('click', handleThemeToggleMobile);
      this.listeners.set('theme-toggle-mobile', handleThemeToggleMobile);
    }
  }

  /**
   * Reset/cleanup event listeners
   */
  resetEvents(): void
  {
    this.listeners.forEach((listener, key) =>
    {
      if (key === 'mobile-menu-toggle')
      {
        const btn = document.getElementById('mobile-menu-btn');
        if (btn)
        {
          btn.removeEventListener('click', listener);
        }
      }
      else if (key === 'theme-toggle')
      {
        const btn = document.getElementById('theme-toggle');
        if (btn)
        {
          btn.removeEventListener('click', listener);
        }
      }
      else if (key === 'theme-toggle-mobile')
      {
        const btn = document.getElementById('theme-toggle-mobile');
        if (btn)
        {
          btn.removeEventListener('click', listener);
        }
      }
    });
    this.listeners.clear();
  }

  /**
   * Unmount header
   */
  unmount(): void
  {
    this.resetEvents();
  }
}