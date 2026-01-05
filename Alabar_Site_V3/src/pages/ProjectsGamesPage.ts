/**
 * ProjectsGamesPage - Game development projects using grimoire layout
 * Extends BaseProjectPage - only provides Game-specific data
 */

import { BaseProjectPage, Project } from '@components/common/BaseProjectPage';

export default class ProjectsGamesPage extends BaseProjectPage 
{
  protected pageTitle = 'GAME GRIMOIRE';
  protected pageSubtitle = '"Scrolls of Interactive Entertainment"';
  
  protected projects: Project[] = [
    {
      title: 'Memory Game',
      subtitle: 'Card matching game with personal photos',
      techStack: ['C#', 'Windowns Form', 'Game Logic'],
      mediaUrl: '/assets/images/memory.png',
      mediaType: 'image',
      whatIBuilt: [
        'Grid-based card matching game',
        'Flip animation and state management',
        'Move counter and scoring system'
      ],
      whatILearned: [
        'Basic game loop implementation',
        'Event handling in SFML',
        'Simple game state management'
      ],
      challenges: [
        'Card shuffle randomization',
        'Implementing flip animations smoothly',
        'Managing game state transitions'
      ],
      githubUrl: 'https://github.com/SirAlabar/MemoryGame'
    },
    {
      title: 'SFML Minecrap',
      subtitle: 'Minecraft-inspired voxel game',
      techStack: ['C++', 'SFML', 'Procedural Generation', 'Physics'],
      mediaUrl: '/assets/videos/minecrap.gif',
      mediaType: 'gif',
      whatIBuilt: [
        'Block-based world with voxel rendering',
        'Sky rendering with dynamic clouds',
        'Score and life system with UI'
      ],
      whatILearned: [
        'Voxel-based game architecture',
        'Procedural content generation',
        'Advanced SFML rendering techniques'
      ],
      challenges: [
        'Efficient block rendering performance',
        'Implementing realistic sky effects',
        'Managing game state and UI updates'
      ],
      githubUrl: 'https://github.com/SirAlabar/SFML_Minecrap'
    },
    {
      title: 'SFML Snake Game',
      subtitle: 'Classic snake implementation',
      techStack: ['C++', 'SFML', 'Grid Logic', 'Collision Detection'],
      mediaUrl: '/assets/videos/snake.gif',
      mediaType: 'gif',
      whatIBuilt: [
        'Grid-based movement system',
        'Snake growth and collision detection',
        'Food spawning and score tracking'
      ],
      whatILearned: [
        'Grid-based game mechanics',
        'Collision detection algorithms',
        'Game difficulty progression'
      ],
      challenges: [
        'Smooth snake movement on grid',
        'Self-collision detection',
        'Balancing game speed and difficulty'
      ],
      githubUrl: 'https://github.com/SirAlabar/SFML_Snake-Game'
    },
    {
      title: 'SFML FlappyLeo',
      subtitle: 'Flappy Bird clone featuring my son',
      techStack: ['C++', 'SFML', 'Physics', 'Sprite Animation'],
      mediaUrl: '/assets/images/flappyleo.png',
      mediaType: 'image',
      whatIBuilt: [
        'Physics-based bird movement',
        'Procedural obstacle generation',
        'Custom sprite artwork of my son'
      ],
      whatILearned: [
        'Basic physics simulation (gravity, velocity)',
        'Procedural level generation',
        'Sprite animation and collision systems'
      ],
      challenges: [
        'Tuning physics for satisfying gameplay',
        'Infinite scrolling obstacle system',
        'Hit detection with pixel-perfect precision'
      ],
      githubUrl: 'https://github.com/SirAlabar/SFML_FlappyLeo'
    },
    {
      title: 'so_long',
      subtitle: '2D RPG-style game with combat system',
      techStack: ['C', 'MiniLibX', 'Sprite Animation', 'Map Parsing'],
      mediaUrl: '/assets/videos/so_long.gif',
      mediaType: 'gif',
      whatIBuilt: [
        'Tile-based movement and collision system',
        'Combat screen with selectable options',
        'Enemy AI with random movement patterns',
        'Victory and defeat animations at 60 FPS'
      ],
      whatILearned: [
        'Pixel-by-pixel rendering techniques',
        'Frame-rate management and game loops',
        'Custom map format parsing (.ber files)',
        'Transparency in sprite rendering'
      ],
      challenges: [
        'Implementing 60 FPS rendering cap',
        'Creating smooth animation transitions',
        'Managing multiple animation states'
      ],
      githubUrl: 'https://github.com/SirAlabar/so_long'
    },
    {
      title: 'cub3D',
      subtitle: '3D raycasting maze (Wolfenstein 3D style)',
      techStack: ['C', 'MiniLibX', 'Raycasting', 'Math Library'],
      mediaUrl: '/assets/videos/cub3d.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'First-person 3D visualization using raycasting',
        'Textured walls with directional mapping (N/S/E/W)',
        'Smooth player movement and camera rotation',
        'Bonus: Minimap, interactive doors, animated sprites'
      ],
      whatILearned: [
        'Raycasting algorithm implementation',
        '3D perspective projection mathematics',
        'Texture mapping and wall rendering',
        'Advanced collision detection in 3D space'
      ],
      challenges: [
        'Optimizing raycasting performance',
        'Implementing proper texture mapping',
        'Creating smooth camera rotation',
        'Managing complex map parsing (.cub format)'
      ],
      githubUrl: 'https://github.com/SirAlabar/cub3D',
      liveUrl: 'https://github.com/SirAlabar/cub3D'
    },
    {
      title: 'Doom Nukem',
      subtitle: 'Custom 3D engine inspired by classic shooters (WIP)',
      techStack: ['C', 'OpenGL', 'SDL', 'Multithreading', 'BSP', 'Fixed-point math (BAM)'],
      mediaUrl: '/assets/images/doom.png',
      mediaType: 'image',
      whatIBuilt: [
        'Custom 3D rendering engine using OpenGL',
        'BSP-based world partitioning for visibility and traversal',
        'Fixed-point math system (Binary Angle Measurement)',
        'Double-buffered rendering pipeline',
        'Thread pool for parallel tasks',
        'Lookup tables for fast trigonometric calculations'
      ],
      whatILearned: [
        'Low-level 3D engine architecture',
        'Spatial partitioning and culling techniques',
        'Managing real-time rendering with double buffering',
        'Multithreaded task scheduling with thread pools',
        'Performance-oriented math using fixed-point arithmetic'
      ],
      challenges: [
        'Designing BSP traversal and visibility logic',
        'Balancing accuracy and performance in fixed-point math',
        'Synchronizing rendering and worker threads safely',
        'Keeping real-time performance without modern engine tooling'
      ],
      liveUrl: 'https://github.com/SirAlabar/doom-nukem',
      githubUrl: 'https://github.com/SirAlabar/doom-nukem'
    },
    {
      title: 'Racing Game Web',
      subtitle: 'Interactive browser-based racing experience',
      techStack: ['TypeScript', 'Babylon.js', 'Ammo.js', 'WebGL', 'CSS3'],
      mediaUrl: '/assets/videos/demo_racer.mp4',
      mediaType: 'video',
      whatIBuilt: [
        '3D racing game built with Babylon.js',
        'Vehicle physics using Ammo.js',
        'Real-time input and control system',
        'Lap timing and track progression'
      ],
      whatILearned: [
        'Physics integration in a real-time loop',
        'Syncing physics and rendering',
        '3D transforms and collision handling',
        'Basic 3D asset workflow (Blender)'
      ],
      challenges: [
        'Implementing and tuning physics behavior for a responsive 3D vehicle',
        'Separating visual meshes from collision meshes for accurate physics',
        'Creating simplified collision geometry from complex 3D models',
        'Hidden playable spaceship unlocked through secret input combinations'
      ],
      liveUrl: 'https://starcendence.dev/pod-racer',
      githubUrl: 'https://github.com/SirAlabar/StarCendence'
    }
  ];
}