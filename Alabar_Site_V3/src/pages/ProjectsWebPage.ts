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
      title: 'ft_transcendence - Starcendence',
      subtitle: 'Full-stack multiplayer gaming platform',
        techStack: ['TypeScript','NodeJS+Fastify','WebSockets','Babylon.js',
                    'Microservices','SQLite+Prisma', 'Docker','Nginx', 'Redis(Pub/Sub)'],
      mediaUrl: '/assets/videos/demo_racer.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Designed and owned the overall system architecture',
        'Built the complete frontend (UI, state, routing, game canvas)',
        'Integrated frontend with backend microservices',
        'Developed core game logic and client-side user management',
        'Integrated Redis Pub/Sub for cross-service event communication',
        'Implemented real-time multiplayer via WebSockets',
      ],
      whatILearned: [
        'Designing scalable microservice architectures',
        'Real-time multiplayer synchronization and latency handling',
        'Frontend–backend integration at scale',
        'Server-authoritative game design',
        'Managing complex state across services and clients',
      ],
      challenges: [
        'Designing a server-authoritative multiplayer architecture',
        'Synchronizing real-time game state across clients',
        'Balancing performance, latency and consistency',
        'Integrating 3D rendering with real-time networking',
        'Coordinating development across multiple services and contributors',
      ],
      githubUrl: 'https://github.com/SirAlabar/StarCendence'
    }
  ];
}