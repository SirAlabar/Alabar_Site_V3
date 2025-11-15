/**
 * ContactPage.ts - Contact information page
 */

export class ContactPage 
{
  render(): string 
  {
    return `
      <div class="container-rpg py-20">
        <header class="text-center mb-12">
          <h1 class="font-pixel text-4xl text-rpg-accent mb-4">CONTACT</h1>
          <p class="font-game text-xl text-rpg-text">Let's connect and create something amazing</p>
        </header>
        
        <div class="max-w-2xl mx-auto">
          <!-- Contact Form -->
          <div class="card-rpg mb-8">
            <h2 class="font-pixel text-2xl text-rpg-accent mb-6">Send Message</h2>
            <div class="space-y-4">
              <div>
                <label class="font-game text-rpg-text block mb-2">Name</label>
                <input 
                  type="text" 
                  class="w-full px-4 py-3 bg-rpg-darker text-rpg-text rounded border-2 border-rpg-accent/30 focus:border-rpg-accent outline-none transition-colors"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label class="font-game text-rpg-text block mb-2">Email</label>
                <input 
                  type="email" 
                  class="w-full px-4 py-3 bg-rpg-darker text-rpg-text rounded border-2 border-rpg-accent/30 focus:border-rpg-accent outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label class="font-game text-rpg-text block mb-2">Message</label>
                <textarea 
                  class="w-full px-4 py-3 bg-rpg-darker text-rpg-text rounded border-2 border-rpg-accent/30 focus:border-rpg-accent outline-none transition-colors resize-none"
                  rows="5"
                  placeholder="Your message..."
                ></textarea>
              </div>
              
              <button class="btn-pixel w-full" id="send-message">
                SEND MESSAGE
              </button>
            </div>
          </div>
          
          <!-- Social Links -->
          <div class="card-rpg">
            <h2 class="font-pixel text-2xl text-rpg-accent mb-6">Connect</h2>
            <div class="grid grid-cols-2 gap-4">
              <a href="https://github.com" target="_blank" class="social-link">
                <div class="bg-rpg-darker p-4 rounded text-center hover:bg-rpg-medium transition-colors">
                  <div class="text-3xl mb-2">⚔️</div>
                  <span class="font-pixel text-xs text-rpg-accent">GITHUB</span>
                </div>
              </a>
              
              <a href="https://linkedin.com" target="_blank" class="social-link">
                <div class="bg-rpg-darker p-4 rounded text-center hover:bg-rpg-medium transition-colors">
                  <div class="text-3xl mb-2">🛡️</div>
                  <span class="font-pixel text-xs text-rpg-accent">LINKEDIN</span>
                </div>
              </a>
              
              <a href="mailto:contact@alabar.dev" class="social-link">
                <div class="bg-rpg-darker p-4 rounded text-center hover:bg-rpg-medium transition-colors">
                  <div class="text-3xl mb-2">📜</div>
                  <span class="font-pixel text-xs text-rpg-accent">EMAIL</span>
                </div>
              </a>
              
              <a href="https://discord.com" target="_blank" class="social-link">
                <div class="bg-rpg-darker p-4 rounded text-center hover:bg-rpg-medium transition-colors">
                  <div class="text-3xl mb-2">🏰</div>
                  <span class="font-pixel text-xs text-rpg-accent">DISCORD</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  mount(): void 
  {
    // Handle form submission
    const sendButton = document.getElementById('send-message');
    if (sendButton) 
    {
      sendButton.addEventListener('click', (e) => 
      {
        e.preventDefault();
        
        // Show success message (in real app, would send the message)
        const button = e.target as HTMLButtonElement;
        const originalText = button.textContent;
        button.textContent = 'MESSAGE SENT!';
        button.classList.add('bg-rpg-green');
        
        setTimeout(() => 
        {
          button.textContent = originalText;
          button.classList.remove('bg-rpg-green');
        }, 2000);
      });
    }
  }
  
  destroy(): void 
  {
    console.log('ContactPage destroyed');
  }
}