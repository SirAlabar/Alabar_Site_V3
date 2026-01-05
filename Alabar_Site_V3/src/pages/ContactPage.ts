import emailjs from '@emailjs/browser';

export class ContactPage 
{
  private formElement: HTMLFormElement | null = null;
  private statusElement: HTMLElement | null = null;
  private sendButton: HTMLButtonElement | null = null;
  private readonly COOLDOWN_KEY = 'contact_form_last_submit';
  private readonly COOLDOWN_DURATION = 3 * 60 * 1000; // 3 minutes

  render(): string 
  {
    return `
      <div class="contact-grimoire-wrapper">
        <div class="grimoire-container">
          <div class="grimoire-content">
            <header class="text-center mb-6">
              <h1 class="font-pixel pixel-font pixel-shadow text-2xl text-rpg-accent mb-3">CONTACT</h1>
              <p class="font-game pixel-shadow text-2xl text-rpg-accent">Send me a message</p>
            </header>
            
            <div class="content-wrapper">
              <!-- Contact Form Card -->
              <div class="card-rpg">
                <h2 class="font-pixel pixel-font pixel-shadow text-xl text-rpg-accent mb-6">Message Quest</h2>
                
                <!-- Status Message -->
                <div id="form-status" class="mb-4 hidden"></div>
                
                <form id="contact-form" class="space-y-4">
                  <div>
                    <label class="font-game pixel-shadow text-rpg-text text-sm block mb-2">Your Name</label>
                    <input 
                      type="text" 
                      name="from_name"
                      class="w-full px-4 py-3 bg-rpg-darker/50 text-rpg-text font-game rounded border-2 border-rpg-accent/30 focus:border-rpg-accent outline-none transition-colors"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label class="font-game pixel-shadow text-rpg-text text-sm block mb-2">Your Email</label>
                    <input 
                      type="email" 
                      name="from_email"
                      class="w-full px-4 py-3 bg-rpg-darker/50 text-rpg-text font-game rounded border-2 border-rpg-accent/30 focus:border-rpg-accent outline-none transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label class="font-game pixel-shadow text-rpg-text text-sm block mb-2">Message</label>
                    <textarea 
                      name="message"
                      class="w-full px-4 py-3 bg-rpg-darker/50 text-rpg-text font-game rounded border-2 border-rpg-accent/30 focus:border-rpg-accent outline-none transition-colors resize-none"
                      rows="6"
                      placeholder="Your message..."
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    id="send-button"
                    class="btn-pixel w-full"
                  >
                    SEND MESSAGE
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        /* Wrapper - centers the grimoire */
        .contact-grimoire-wrapper
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
          max-width: 900px;
          min-height: 600px;
          padding: 3rem 2.5rem;
          background-image: url('/assets/images/grimorypg1.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
        }

        /* Content wrapper inside grimoire */
        .grimoire-content
        {
          max-width: 100%;
          height: 100%;
        }

        /* Content constrained area */
        .content-wrapper
        {
          max-width: 650px;
          margin: 0 auto;
        }

        /* Status message styles */
        .status-success
        {
          background-color: rgba(34, 197, 94, 0.2);
          border: 2px solid #22c55e;
          color: #22c55e;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: 'VT323', monospace;
          font-size: 1.125rem;
          text-align: center;
        }

        .status-error
        {
          background-color: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          color: #ef4444;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: 'VT323', monospace;
          font-size: 1.125rem;
          text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 768px)
        {
          .grimoire-container
          {
            padding: 2rem 1.5rem;
            min-height: 500px;
          }

          .contact-grimoire-wrapper
          {
            padding: 0.5rem;
          }
        }
      </style>
    `;
  }
  
  mount(): void 
  {
    // Initialize EmailJS
    emailjs.init('valJToeVto5P9Clpv');
    
    // Get form elements
    this.formElement = document.getElementById('contact-form') as HTMLFormElement;
    this.statusElement = document.getElementById('form-status');
    this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
    
    if (this.formElement) 
    {
      this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
  
  private isCooldownActive(): boolean
  {
    const lastSubmit = localStorage.getItem(this.COOLDOWN_KEY);
    if (!lastSubmit) 
    {
      return false;
    }
    
    const lastSubmitTime = parseInt(lastSubmit, 10);
    const currentTime = Date.now();
    const timePassed = currentTime - lastSubmitTime;
    
    return timePassed < this.COOLDOWN_DURATION;
  }
  
  private getRemainingTime(): string
  {
    const lastSubmit = localStorage.getItem(this.COOLDOWN_KEY);
    if (!lastSubmit) 
    {
      return '';
    }
    
    const lastSubmitTime = parseInt(lastSubmit, 10);
    const currentTime = Date.now();
    const timePassed = currentTime - lastSubmitTime;
    const timeRemaining = this.COOLDOWN_DURATION - timePassed;
    
    if (timeRemaining <= 0) 
    {
      return '';
    }
    
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    if (minutes > 0) 
    {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    else 
    {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  }
  
  private async handleSubmit(e: Event): Promise<void>
  {
    e.preventDefault();
    
    if (!this.formElement || !this.statusElement || !this.sendButton) 
    {
      return;
    }
    
    // Check if cooldown is active
    if (this.isCooldownActive()) 
    {
      const remainingTime = this.getRemainingTime();
      this.showStatus(
        'error',
        `⏳ Quest Cooldown Active! Please wait ${remainingTime} before sending another message.`
      );
      return;
    }
    
    // Disable button and show loading state
    this.sendButton.disabled = true;
    this.sendButton.textContent = 'SENDING...';
    
    try 
    {
      // Send email using EmailJS
      const response = await emailjs.sendForm(
        'service_1gdjh8d',
        'template_haq8s8m',
        this.formElement
      );
      
      console.log('Email sent successfully:', response);
      
      // Save submission timestamp for cooldown
      localStorage.setItem(this.COOLDOWN_KEY, Date.now().toString());
      
      // Show success message
      this.showStatus(
        'success',
        'Quest Complete! Your message has been sent successfully. I\'ll get back to you soon!'
      );
      
      // Clear form
      this.formElement.reset();
      
      // Reset button after delay
      setTimeout(() => 
      {
        if (this.sendButton) 
        {
          this.sendButton.disabled = false;
          this.sendButton.textContent = 'SEND MESSAGE';
        }
      }, 3000);
    }
    catch (error) 
    {
      console.error('Email sending failed:', error);
      
      // Show error message
      this.showStatus(
        'error',
        'Quest Failed! Something went wrong. Please try again or contact me directly.'
      );
      
      // Reset button
      if (this.sendButton) 
      {
        this.sendButton.disabled = false;
        this.sendButton.textContent = 'SEND MESSAGE';
      }
    }
  }
  
  private showStatus(type: 'success' | 'error', message: string): void
  {
    if (!this.statusElement) 
    {
      return;
    }
    
    // Remove any existing status classes
    this.statusElement.classList.remove('status-success', 'status-error', 'hidden');
    
    // Add appropriate class
    this.statusElement.classList.add(type === 'success' ? 'status-success' : 'status-error');
    
    // Set message
    this.statusElement.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => 
    {
      if (this.statusElement) 
      {
        this.statusElement.classList.add('hidden');
      }
    }, 5000);
  }
  
  dispose(): void 
  {
    if (this.formElement) 
    {
      this.formElement.removeEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    this.formElement = null;
    this.statusElement = null;
    this.sendButton = null;
    
    console.log('ContactPage destroyed');
  }
}