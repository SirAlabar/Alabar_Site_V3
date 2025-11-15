/**
 * NotFoundPage.ts - 404 error page
 */

export class NotFoundPage 
{
  render(): string 
  {
    return `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="font-pixel text-8xl text-rpg-red mb-4">404</h1>
          <p class="font-game text-2xl text-rpg-text mb-2">Quest Not Found</p>
          <p class="font-game text-rpg-text/60 mb-8">
            The path you seek does not exist in this realm
          </p>
          <a href="/" class="btn-pixel">
            RETURN TO HOME
          </a>
        </div>
      </div>
    `;
  }
  
  mount(): void 
  {
    console.log('NotFoundPage mounted');
  }
  
  destroy(): void 
  {
    console.log('NotFoundPage destroyed');
  }
}