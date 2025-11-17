/**
 * AboutPage.ts - About me page
 */

export class AboutPage 
{
  render(): string 
  {
    return `
      <div class="container-rpg py-2">
        <header class="text-center mb-12">
          <h1 class="font-pixel text-4xl text-rpg-accent mb-4">ABOUT ME</h1>
          <p class="font-game text-xl text-rpg-text">Software Developer & Game Enthusiast</p>
        </header>
        
        <div class="max-w-4xl mx-auto">
          <!-- Character Stats Card -->
          <div class="card-rpg mb-8">
            <h2 class="font-pixel text-2xl text-rpg-accent mb-6">Character Stats</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="font-game text-rpg-text mb-2">Class: <span class="text-rpg-accent">Software Developer</span></p>
                <p class="font-game text-rpg-text mb-2">Former Class: <span class="text-rpg-accent">Accountant</span></p>
                <p class="font-game text-rpg-text mb-2">Level: <span class="text-rpg-accent">34</span></p>
                <p class="font-game text-rpg-text mb-2">Guild: <span class="text-rpg-accent">42 Porto</span></p>
                <p class="font-game text-rpg-text">Base: <span class="text-rpg-accent">Porto, Portugal</span></p>
              </div>
              <div>
                <p class="font-game text-rpg-text mb-4">Interests:</p>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-rpg-accent">⚔️</span>
                    <span class="font-game text-rpg-text">Game Development</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-rpg-accent">🎨</span>
                    <span class="font-game text-rpg-text">Pixel Art</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-rpg-accent">🏛️</span>
                    <span class="font-game text-rpg-text">System Architecture</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Technical Skills -->
          <div class="card-rpg mb-8">
            <h2 class="font-pixel text-2xl text-rpg-accent mb-6">Technical Skills</h2>
            <div class="space-y-4">
              ${this.renderSkillBar('C/C++', 90)}
              ${this.renderSkillBar('TypeScript/JavaScript', 85)}
              ${this.renderSkillBar('Game Development', 75)}
              ${this.renderSkillBar('React/Next.js', 80)}
              ${this.renderSkillBar('Unity/Pixi.js', 70)}
              ${this.renderSkillBar('System Programming', 85)}
            </div>
          </div>
          
          <!-- Current Quest -->
          <div class="card-rpg">
            <h2 class="font-pixel text-2xl text-rpg-accent mb-6">Current Quest</h2>
            <div class="bg-rpg-darker p-6 rounded">
              <p class="font-game text-rpg-text leading-relaxed">
                As a career changer diving into the world of game development, I am excited to explore 
                and create innovative solutions using technology. Currently focusing on mastering C and 
                developing small games in C#, I am passionate about discovering new technologies and 
                leveraging them to craft high-quality projects.
              </p>
              <p class="font-game text-rpg-text mt-4 leading-relaxed">
                I am a student at 42 School, where I am honing my skills and expanding my horizons in 
                this dynamic field. My journey from accounting to software development has given me a 
                unique perspective on problem-solving and system design.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderSkillBar(skill: string, level: number): string 
  {
    return `
      <div>
        <div class="flex justify-between mb-2">
          <span class="font-game text-rpg-text">${skill}</span>
          <span class="font-pixel text-xs text-rpg-accent">${level}%</span>
        </div>
        <div class="w-full h-4 bg-rpg-darker rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-gold rounded-full transition-all duration-1000 skill-bar"
            style="width: 0%"
            data-level="${level}"
          ></div>
        </div>
      </div>
    `;
  }
  
  mount(): void 
  {
    // Animate skill bars
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
  
  destroy(): void 
  {
    console.log('AboutPage destroyed');
  }
}