/**
 * ProjectsMobilePage - Mobile development projects using grimoire layout
 * Extends BaseProjectPage - currently showing Coming Soon placeholder
 */

import { BaseProjectPage, Project } from '@components/common/BaseProjectPage';

export default class ProjectsMobilePage extends BaseProjectPage 
{
  protected pageTitle = 'MOBILE GRIMOIRE';
  protected pageSubtitle = '"Scrolls of Portable & Touch Systems"';
  
  protected projects: Project[] = [
    {
      title: 'Mobile Development',
      subtitle: 'Coming Soon - Future Projects',
      techStack: ['React Native?', 'Flutter?', 'Swift?', 'Kotlin?', 'Mobile UI/UX?'],
      mediaUrl: '/assets/images/working.png',
      mediaType: 'image',
      whatIBuilt: [
        'Mobile applications are currently in planning phase',
        'Exploring cross-platform frameworks',
        'Researching native development approaches'
      ],
      whatILearned: [
        'This section will showcase mobile development skills',
        'Projects will include iOS and Android applications',
        'Focus on responsive design and touch interactions'
      ],
      challenges: [
        'Choosing the right framework for each project',
        'Understanding platform-specific requirements',
        'Balancing performance with cross-platform compatibility'
      ]
    }
  ];
}