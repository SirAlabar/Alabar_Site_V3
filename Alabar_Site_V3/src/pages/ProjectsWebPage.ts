/**
 * ProjectsWebPage - Web projects showcase using grimoire layout
 * Extends BaseProjectPage - only provides page-specific data
 */

import { BaseProjectPage, Project } from '@components/common/BaseProjectPage';

export default class ProjectsWebPage extends BaseProjectPage 
{
  protected pageTitle = 'WEB GRIMOIRE';
  protected pageSubtitle = '"Spells of Web & Interactive Systems"';
  
  protected projects: Project[] = [
    {
      title: 'Alabar Site V1',
      subtitle: 'My first contact with web development',
      techStack: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
      mediaUrl: '/assets/videos/alabar_v1_demo.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Personal website with interactive game elements',
        'Sprite-based character movement and combat',
        'Enemy AI and simple moviment mechanics',
        'Parallax scrolling background'
      ],
      whatILearned: [
        'HTML structure and semantic layout',
        'CSS animations and sprite sheets',
        'JavaScript for input handling and game logic',
        'Managing simple game state in the browser'
      ],
      challenges: [
        'Structuring JavaScript without frameworks',
        'Synchronizing animations and game logic',
        'Balancing visuals and performance',
        'Designing my own pixel art and sprites'
      ],
      liveUrl: 'https://siralabar.github.io/Alabar_Site/#',
      githubUrl: 'https://github.com/SirAlabar/Alabar_Site'
    },
    {
      title: 'Alabar Site V2',
      subtitle: 'Exploration of rendering, asset pipelines and canvas-based systems',
      techStack: ['JavaScript', 'Canvas API', 'Pixi.js', 'HTML', 'CSS'],
      mediaUrl: '/assets/videos/alabar_v2_demo.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Custom asset preloading system',
        'Scene setup and progression logic',
        'Early canvas-based rendering experiments',
        'Initial Pixi.js integration',
      ],
      whatILearned: [
        'Asset loading pipelines and loading states',
        'Differences between DOM-based and canvas rendering',
        'Manual responsive scaling challenges in canvas',
        'Limitations of low-level rendering without frameworks',
      ],
      challenges: [
        'Implementing responsiveness manually in canvas',
        'Managing different screen sizes without layout frameworks',
        'Synchronizing DOM and canvas rendering',
        'Balancing visual fidelity with usability',
      ],
      liveUrl: 'https://siralabar.github.io/Alabar_Site_V2/',
      githubUrl: 'https://github.com/SirAlabar/Alabar_Site_V2'
    },
    {
      title: 'Alabar Site V3',
      subtitle: 'Interactive portfolio with built-in game systems',
      techStack: ['JavaScript', 'Canvas API', 'Pixi.js', 'HTML', 'CSS'],
      mediaUrl: '/assets/videos/alabar_v3_demo.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Interactive RPG-style portfolio with a playable Vampire Survivors-like game',
        'Canvas-based rendering with Pixi.js',
        'Modular ECS-inspired architecture for gameplay systems',
        'Level-up system with power cards and progression',
        'Contact page with email sending integration'
      ],
      whatILearned: [
        'Designing reusable systems with component-based architecture',
        'Managing asset pipelines and preload flows',
        'Bridging DOM UI with real-time canvas rendering',
        'Structuring gameplay logic independently from presentation'
      ],
      challenges: [
        'Balancing responsiveness between DOM and canvas',
        'Designing scalable systems without a full game engine',
        'Keeping performance and readability in a growing codebase'
      ],
      githubUrl: 'https://github.com/SirAlabar/Alabar_Site_V3'
    },
    {
      title: 'Racing Game Website',
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