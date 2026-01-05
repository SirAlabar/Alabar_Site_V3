/**
 * BaseProjectPage - Abstract base component for project grimoire pages
 * Provides complete layout, navigation, and rendering logic
 * Child classes only need to provide: pageTitle, pageSubtitle, projects array
 */

import { BaseComponent } from '@components/BaseComponent';

export interface Project 
{
  title: string;
  subtitle: string;
  techStack: string[];
  mediaUrl: string;      // Video, GIF, or image
  mediaType: 'video' | 'gif' | 'image';
  whatIBuilt: string[];
  whatILearned: string[];
  challenges: string[];
  liveUrl?: string;      // Optional play/demo link
  githubUrl?: string;    // Optional GitHub link
}

export abstract class BaseProjectPage extends BaseComponent 
{
  // Abstract properties - child classes must provide these
  protected abstract pageTitle: string;
  protected abstract pageSubtitle: string;
  protected abstract projects: Project[];

  // Component state
  private currentIndex: number = 0;

  render(): string 
  {
    const project = this.projects[this.currentIndex];
    const totalProjects = this.projects.length;
    const isFlipped = this.currentIndex % 2 !== 0;

    return `
      <div class="grimoire-container ${isFlipped ? 'grimoire-flipped' : ''}">
        <div class="grimoire-content">
            <!-- Header -->
            <header class="text-center mb-6">
              <h1 class="font-pixel pixel-font pixel-shadow text-xl text-rpg-accent mb-2">${this.pageTitle}</h1>
              <p class="font-game pixel-shadow text-lg text-rpg-text">${this.pageSubtitle}</p>
            </header>

            <!-- Project Title -->
            <div class="text-center mb-4">
              <h2 class="font-pixel pixel-font pixel-shadow text-2xl text-rpg-accent mb-1">${project.title}</h2>
              <p class="font-game pixel-shadow text-xl text-rpg-text">${project.subtitle}</p>
            </div>

            <!-- Tech Stack -->
            <div class="flex flex-wrap justify-center gap-2 mb-6">
              ${project.techStack.map(tech => `
                <span class="font-game pixel-shadow text-xl px-3 py-1 bg-rpg-accent/20 border border-rpg-accent/50 rounded text-rpg-accent">
                  ${tech}
                </span>
              `).join('')}
            </div>

            <!-- Media Display -->
            <div class="media-container mb-6">
              ${this.renderMedia(project)}
            </div>

            <!-- What I Built & What I Learned - Side by Side -->
            <div class="info-grid mb-4">
              <!-- What I Built Section -->
              <div class="info-section">
                <h3 class="font-pixel pixel-font pixel-shadow text-base text-rpg-accent flex items-center gap-2">
                  <span>🎮</span> What I Built
                </h3>
                <ul class="space-y-0">
                  ${project.whatIBuilt.map(item => `
                    <li class="font-game pixel-shadow text-sm text-rpg-text flex items-start gap-2">
                      <span class="text-rpg-accent mt-1">•</span>
                      <span>${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <!-- What I Learned Section -->
              <div class="info-section">
                <h3 class="font-pixel pixel-font pixel-shadow text-base text-rpg-accent flex items-center gap-2">
                  <span>🧙</span> What I Learned
                </h3>
                <ul class="space-y-0">
                  ${project.whatILearned.map(item => `
                    <li class="font-game pixel-shadow text-sm text-rpg-text flex items-start gap-2">
                      <span class="text-rpg-accent mt-1">•</span>
                      <span>${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>

            <!-- Challenges Section -->
            <div class="info-section-full">
              <h3 class="font-pixel pixel-font pixel-shadow text-base text-rpg-accent flex items-center gap-2">
                <span>⚔️</span> Challenges & Decisions
              </h3>
              <ul class="space-y-0">
                ${project.challenges.map(item => `
                  <li class="font-game pixel-shadow text-sm text-rpg-text flex items-start gap-2">
                    <span class="text-rpg-accent mt-1">•</span>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center gap-8 mb-6">
              ${project.liveUrl ? `
                <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" 
                   class="btn-pixel px-6 py-3 text-center w-auto">
                  ▶ PLAY GAME
                </a>
              ` : ''}
              ${project.githubUrl ? `
                <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" 
                   class="btn-pixel-secondary px-6 py-3 text-center w-auto">
                  💾 GITHUB
                </a>
              ` : ''}
            </div>

            <!-- Navigation Counter -->
            <div class="text-center mt-6 pt-4 border-t-2 border-rpg-accent/30">
              <span class="font-pixel pixel-font pixel-shadow text-sm text-rpg-accent">
                Project ${this.currentIndex + 1} / ${totalProjects}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>
        /* Fixed Navigation Buttons on Screen Sides */
        .fixed-nav-button
        {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          width: 80px;
          height: 80px;
          background: rgba(255, 204, 51, 0.15);
          border: 3px solid rgba(255, 204, 51, 0.5);
          border-radius: 50%;
          color: #ffcc33;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .fixed-nav-button.left
        {
          left: 2rem;
        }

        .fixed-nav-button.right
        {
          right: 2rem;
        }

        .fixed-nav-button:hover:not(:disabled)
        {
          background: rgba(255, 204, 51, 0.3);
          border-color: #ffcc33;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 20px rgba(255, 204, 51, 0.4);
        }

        .fixed-nav-button:disabled
        {
          opacity: 0.2;
          cursor: not-allowed;
        }

        /* Grimoire Container */
        .grimoire-container
        {
          width: 100%;
          max-width: 900px;
          min-height: 700px;
          padding: 3rem 2.5rem;
          margin: 0 auto;
          background-image: url('/assets/images/grimorypg1.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          transition: all 0.3s ease;
        }

        .grimoire-flipped
        {
          transform: scaleX(-1);
          background-position: center;
        }

        .grimoire-flipped .grimoire-content
        {
          transform: scaleX(-1);
        }

        .grimoire-content
        {
          max-width: 100%;
          height: 100%;
        }

        /* Media Container */
        .media-container
        {
          width: 100%;
          max-width: 650px;
          margin: 0 auto 1.5rem auto;
          background: rgba(10, 10, 15, 0.5);
          border: 2px solid rgba(255, 204, 51, 0.3);
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16/9;
        }

        .media-container video,
        .media-container img
        {
          width: 100%;
          height: 100%;
          object-fit: fit;
          background-color: rgba(0, 0, 0, 0.6);
        }

        /* Info Grid Container - matches media container width */
        .info-grid
        {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          max-width: 650px;
          margin: 0 auto 1rem auto;
        }

        /* Info Sections - Centered Text - Compact */
        .info-section
        {
          background: rgba(10, 10, 15, 0.3);
          border-left: 3px solid rgba(255, 204, 51, 0.5);
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          text-align: center;
          width: 100%;
        }

        .info-section h3
        {
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .info-section ul
        {
          text-align: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .info-section li
        {
          justify-content: center;
          margin-bottom: 0.25rem;
        }

        .info-section li:last-child
        {
          margin-bottom: 0;
        }

        /* Full-width Info Section for Challenges */
        .info-section-full
        {
          background: rgba(10, 10, 15, 0.3);
          border-left: 3px solid rgba(255, 204, 51, 0.5);
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          text-align: center;
          max-width: 650px;
          margin: 0 auto 1rem auto;
        }

        .info-section-full h3
        {
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .info-section-full ul
        {
          text-align: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .info-section-full li
        {
          justify-content: center;
          margin-bottom: 0.25rem;
        }

        .info-section-full li:last-child
        {
          margin-bottom: 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px)
        {
          .fixed-nav-button
          {
            width: 60px;
            height: 60px;
          }

          .fixed-nav-button.left
          {
            left: 1rem;
          }

          .fixed-nav-button.right
          {
            right: 1rem;
          }

          .grimoire-container
          {
            padding: 2rem 1.5rem;
            min-height: 600px;
          }

          .info-grid
          {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  private renderMedia(project: Project): string
  {
    switch (project.mediaType) 
    {
      case 'video':
        return `
          <video autoplay loop muted playsinline>
            <source src="${project.mediaUrl}" type="video/mp4">
            Your browser does not support video playback.
          </video>
        `;
      case 'gif':
      case 'image':
        return `<img src="${project.mediaUrl}" alt="${project.title}" />`;
      default:
        return `<div class="font-game text-rpg-text text-center py-8">Media not available</div>`;
    }
  }

  mount(): void 
  {
    // Remove any existing navigation buttons
    this.removeNavButtons();
    
    // Create and append navigation buttons to body (outside layout system)
    this.createNavButtons();
    
    // Attach event listeners to buttons
    const prevButton = document.getElementById('prev-project');
    const nextButton = document.getElementById('next-project');

    if (prevButton) 
    {
      prevButton.addEventListener('click', (e) => 
      {
        e.preventDefault();
        this.navigatePrevious();
      });
    }

    if (nextButton) 
    {
      nextButton.addEventListener('click', (e) => 
      {
        e.preventDefault();
        this.navigateNext();
      });
    }

    console.log(`${this.constructor.name} mounted`);
  }
  
  private createNavButtons(): void
  {
    const totalProjects = this.projects.length;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.id = 'prev-project';
    prevButton.className = 'fixed-nav-button left';
    if (this.currentIndex === 0) 
    {
      prevButton.disabled = true;
    }
    prevButton.innerHTML = `
      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M15 19l-7-7 7-7"/>
      </svg>
    `;
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.id = 'next-project';
    nextButton.className = 'fixed-nav-button right';
    if (this.currentIndex === totalProjects - 1) 
    {
      nextButton.disabled = true;
    }
    nextButton.innerHTML = `
      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M9 5l7 7-7 7"/>
      </svg>
    `;
    
    // Append to body
    document.body.appendChild(prevButton);
    document.body.appendChild(nextButton);
  }
  
  private removeNavButtons(): void
  {
    const prevButton = document.getElementById('prev-project');
    const nextButton = document.getElementById('next-project');
    
    if (prevButton) 
    {
      prevButton.remove();
    }
    
    if (nextButton) 
    {
      nextButton.remove();
    }
  }

  private navigatePrevious(): void
  {
    if (this.currentIndex > 0) 
    {
      this.currentIndex--;
      this.update();
    }
  }

  private navigateNext(): void
  {
    if (this.currentIndex < this.projects.length - 1) 
    {
      this.currentIndex++;
      this.update();
    }
  }

  private update(): void
  {
    const contentMount = document.getElementById('content-mount');
    if (contentMount) 
    {
      // Get the page-content wrapper
      const pageContent = contentMount.querySelector('#page-content');
      if (pageContent) 
      {
        pageContent.innerHTML = this.render();
        this.mount();
      }
    }
  }

  dispose(): void 
  {
    // Remove navigation buttons from body
    this.removeNavButtons();
    
    console.log(`${this.constructor.name} destroyed`);
  }
}