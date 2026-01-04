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
      title: 'Racing Game Website',
      subtitle: 'Interactive browser-based racing experience',
      techStack: ['TypeScript', 'Babylon.js', 'WebGL', 'HTML5', 'CSS3'],
      mediaUrl: '/assets/videos/demo_racer.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Interactive racing game in browser',
        'Real-time input & collision handling',
        'Responsive game controls with keyboard support'
      ],
      whatILearned: [
        'Game loop & rendering optimization',
        'Input abstraction patterns',
        'Canvas performance techniques'
      ],
      challenges: [
        'Performance with many moving objects',
        'Fixed timestep vs variable timestep decisions',
        'Cross-browser compatibility issues'
      ],
      liveUrl: 'https://example.com/racing',
      githubUrl: 'https://github.com/yourusername/racing-game'
    },
    {
      title: 'Portfolio Website V2',
      subtitle: 'Modern portfolio with game integration',
      techStack: ['TypeScript', 'Vite', 'Tailwind CSS', 'Pixi.js'],
      mediaUrl: '/assets/images/portfolio_v2.gif',
      mediaType: 'gif',
      whatIBuilt: [
        'Responsive portfolio with animated background',
        'Integrated Vampire Survivors-style game',
        'Custom routing system without framework'
      ],
      whatILearned: [
        'Hybrid DOM + Canvas architecture',
        'Asset management and lazy loading',
        'History API for clean routing'
      ],
      challenges: [
        'Coordinating Pixi.js with DOM elements',
        'Managing z-index layers effectively',
        'Optimizing asset loading pipeline'
      ],
      githubUrl: 'https://github.com/yourusername/portfolio-v2'
    },
    {
      title: 'Task Manager Dashboard',
      subtitle: 'Productivity tool with real-time sync',
      techStack: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      mediaUrl: '/assets/images/task_manager.png',
      mediaType: 'image',
      whatIBuilt: [
        'Real-time collaborative task management',
        'Drag-and-drop interface for organizing tasks',
        'User authentication and data persistence'
      ],
      whatILearned: [
        'Firebase real-time database integration',
        'State management in React applications',
        'Optimistic UI updates for better UX'
      ],
      challenges: [
        'Handling concurrent edits from multiple users',
        'Implementing efficient drag-and-drop',
        'Managing Firebase security rules'
      ],
      liveUrl: 'https://example.com/tasks',
      githubUrl: 'https://github.com/yourusername/task-manager'
    }
  ];
}