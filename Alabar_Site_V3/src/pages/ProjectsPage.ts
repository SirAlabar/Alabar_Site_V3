/**
 * ProjectsPage - Quest log style projects showcase
 */

import { BaseComponent } from '../components/BaseComponent';

export default class ProjectsPage extends BaseComponent {
    render(): string {
        return `
            <section class="pt-32 pb-20 px-4">
                <div class="container mx-auto max-w-6xl">
                    <h1 class="font-pixel text-3xl text-center mb-12 text-rpg-accent">
                        QUEST LOG
                    </h1>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this.renderProjectCard(
                            'Vampire Survivors Clone',
                            'Action RPG game built with Pixi.js and TypeScript',
                            'IN PROGRESS',
                            'rpg-accent'
                        )}
                        ${this.renderProjectCard(
                            'Portfolio Site V2',
                            'Responsive portfolio with game integration',
                            'ACTIVE',
                            'rpg-green'
                        )}
                        ${this.renderProjectCard(
                            'Pixel Art Editor',
                            'Web-based tool for creating sprite sheets',
                            'COMPLETED',
                            'rpg-gold'
                        )}
                        ${this.renderProjectCard(
                            'RPG Battle System',
                            'Turn-based combat engine with animations',
                            'PLANNED',
                            'rpg-secondary'
                        )}
                        ${this.renderProjectCard(
                            'Map Generator',
                            'Procedural dungeon generation tool',
                            'PLANNED',
                            'rpg-secondary'
                        )}
                        ${this.renderProjectCard(
                            'Inventory System',
                            'Drag-and-drop item management UI',
                            'COMPLETED',
                            'rpg-gold'
                        )}
                    </div>
                </div>
            </section>
        `;
    }

    private renderProjectCard(
        title: string,
        description: string,
        status: string,
        statusColor: string
    ): string {
        return `
            <div class="panel-rpg hover:scale-105 transition-transform cursor-pointer">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="font-pixel text-sm">${title}</h3>
                    <span class="font-pixel text-xs text-${statusColor}">${status}</span>
                </div>
                <p class="font-game text-sm text-gray-300 mb-4">${description}</p>
                <button class="btn-pixel-secondary text-xs w-full">
                    VIEW DETAILS →
                </button>
            </div>
        `;
    }
}