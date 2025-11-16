/**
 * Layout Component - Base layout structure
 * Creates the skeleton: header mount + content mount
 */

export class Layout
{
  /**
   * Mount layout to selector
   */
  mount(selector: string): void
  {
    const container = document.querySelector(selector);
    if (!container)
    {
      console.error(`Layout container "${selector}" not found`);
      return;
    }

    container.innerHTML = this.render();
  }

  /**
   * Render layout HTML structure
   */
  render(): string
  {
    return `
      <div class="flex flex-col min-h-screen">
        <!-- Header mount point -->
        <div id="header-mount"></div>
        
        <!-- Content mount point -->
        <div id="content-mount" class="flex-1"></div>
      </div>
    `;
  }

  /**
   * Render page section wrapper
   */
  renderPageSection(id: string, content: string, isHomePage: boolean = false): string
  {
    if (isHomePage)
    {
      return `<div id="${id}" class="min-h-screen">${content}</div>`;
    }
    
    return `
      <div id="${id}" class="container mx-auto px-6 py-24">
        ${content}
      </div>
    `;
  }
}