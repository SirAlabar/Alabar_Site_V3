/**
 * AboutPage.ts - About me page
 */

import { BaseComponent } from '../components/BaseComponent';

export class AboutPage extends BaseComponent
{
  render(): string 
  {
    return `
      <div class="about-grimoire-wrapper">
        <div class="grimoire-container">
          <div class="container-rpg py-2 pl-16">
            <header class="text-center mb-8">
              <h1 class="font-pixel pixel-font pixel-shadow text-2xl text-rpg-accent mb-3">ABOUT ME</h1>
              <p class="font-game pixel-shadow text-2xl text-rpg-accent">Software Developer & Game Enthusiast</p>
            </header>
            
            <div class="max-w-4xl mx-auto">
              <!-- Character Stats Card -->
              <div class="card-rpg mb-6">
                <h2 class="font-pixel pixel-font pixel-shadow text-xl text-rpg-accent mb-4">Character Stats</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="pixel-shadow font-game text-rpg-text text-sm mb-2">Class: <span class="pixel-shadow text-rpg-accent">Software Developer</span></p>
                    <p class="pixel-shadow font-game text-rpg-text text-sm mb-2">Former Class: <span class="pixel-shadow text-rpg-accent">Accountant</span></p>
                    <p class="pixel-shadow font-game text-rpg-text text-sm mb-2">Level: <span class="pixel-shadow text-rpg-accent">34</span></p>
                    <p class="pixel-shadow font-game text-rpg-text text-sm mb-2">Guild: <span class="pixel-shadow text-rpg-accent">42 Porto</span></p>
                    <p class="pixel-shadow font-game text-rpg-text text-sm">Base: <span class="pixel-shadow text-rpg-accent">Porto, Portugal</span></p>
                  </div>
                  <div>
                    <p class="font-game pixel-shadow text-rpg-text text-sm mb-3">Interests:</p>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="pixel-shadow text-rpg-accent">⚔️</span>
                        <span class="font-game pixel-shadow text-rpg-text text-sm">Game Development</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="pixel-shadow text-rpg-accent">🎨</span>
                        <span class="font-game pixel-shadow text-rpg-text text-sm">Pixel Art</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="pixel-shadow text-rpg-accent">🏛️</span>
                        <span class="font-game pixel-shadow text-rpg-text text-sm">System Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Current Quest -->
              <div class="card-rpg">
                <h2 class="font-pixel pixel-shadow text-xl text-rpg-accent mb-4">Current Quest</h2>
                <div class="bg-rpg-darker/50 p-4 rounded">
                  <p class="font-game pixel-shadow text-rpg-text text-sm leading-relaxed">
                    Game-focused software developer transitioning into professional game development.
                    I build gameplay-driven 2D games with a strong focus on systems, performance, and clean architecture.
                    Currently working with TypeScript and Pixi.js, and actively developing projects in Unity (C#), applying low-level programming and problem-solving skills gained from a strong systems background.
                    In this website you'll find playable projects that showcase how I design, implement, and iterate on game mechanics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        /* Wrapper - centers the grimoire */
        .about-grimoire-wrapper
        {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        /* Grimoire container with background */
        .grimoire-container
        {
          width: 100%;
          max-width: 800px;
          min-height: 600px;
          padding: 4rem 3rem;
          background-image: url('/assets/images/grimorypg1.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
        }
      </style>
    `;
  }
  
  mount(): void 
  {
    setTimeout(() => 
    {
      const skillBars = document.querySelectorAll('.skill-bar');
      skillBars.forEach((bar: any) => 
      {
        const level = bar.dataset.level;
        bar.style.width = `${level}%`;
      });
    }, 100);
  }
  
  dispose(): void 
  {
    console.log('AboutPage destroyed');
  }
}