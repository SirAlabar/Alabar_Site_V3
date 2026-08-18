/**
 * ProjectsCorePage - 42 School core projects using grimoire layout
 * Extends BaseProjectPage - only provides 42 Core-specific data
 */

import { BaseProjectPage, Project } from '@components/common/BaseProjectPage';

export default class ProjectsCorePage extends BaseProjectPage
{
  protected pageTitle = 'CORE GRIMOIRE';
  protected pageSubtitle = '"Scrolls of Systems & Foundations"';

  protected projects: Project[] = [
    {
      title: 'OOP-Piscine — Railway Simulation',
      subtitle: 'Deterministic multi-train simulation engine',
      techStack: ['C++17', 'STL', 'SFML', 'GoogleTest', 'CMake', 'Design Patterns'],
      mediaUrl: '/assets/videos/train_simulator.gif',
      mediaType: 'gif',
      whatIBuilt: [
        'Multi-train railway simulator with graph-based routing and real-time physics',
        'Multi-train collision-risk system (Mediator-style traffic coordination) with braking-distance safety checks',
        'Seeded procedural terrain/biome generation with multi-octave noise and cellular smoothing',
        'Command-pattern replay recording/playback, validated hot reload, and a Monte Carlo batch analysis mode'
      ],
      whatILearned: [
        'Strategy pattern for runtime-swappable graph pathfinding (Dijkstra/uniform-cost search)',
        'State pattern for train lifecycle (Idle/Accelerating/Cruising/Braking/Emergency/...)',
        'Designing a headless-buildable core decoupled from rendering via dependency inversion',
        'Deterministic, reproducible simulation design (fixed timestep, seeded RNG)'
      ],
      challenges: [
        'Detecting collision risk across multi-segment routes in real time',
        'Keeping candidate hot-reloads from corrupting a running simulation',
        'Generating terrain that never blocks the simulated rail network'
      ],
      githubUrl: 'https://github.com/SirAlabar/OOP-Piscine'
    },
    {
      title: 'HumanGL',
      subtitle: 'OpenGL 4.1 hierarchical animation engine',
      techStack: ['C#', '.NET 8', 'OpenGL 4.1', 'OpenTK', 'GLSL'],
      mediaUrl: '/assets/images/humangl.gif',
      mediaType: 'gif',
      whatIBuilt: [
        '15-node articulated humanoid built from a shared cube mesh via a scene-graph hierarchy',
        'Procedural animation state system with six motion modes and smooth transition blending',
        'Runtime limb resizing that keeps joint attachments correct across geometry changes',
        'Custom orthographic UI overlay (bitmap text, sliders, camera input) as a second render pass'
      ],
      whatILearned: [
        'Hierarchical matrix stacks and scene-graph traversal',
        'State-pattern animation design (Enter/Apply/Exit hooks per state)',
        'Null Object pattern to keep render code branch-free on missing textures',
        'Modern OpenGL rendering without an engine (shaders, UV atlases, per-part textures)'
      ],
      challenges: [
        'Isolating draw-time scale so it does not distort child coordinate systems',
        'Recalculating parent-child attachment offsets under nonuniform resizing',
        'Blending between animation states without popping'
      ],
      githubUrl: 'https://github.com/SirAlabar/humangl-42'
    },
    {
      title: 'SCOP',
      subtitle: 'OpenGL 4.1 3D object viewer',
      techStack: ['C#', '.NET 8', 'OpenGL 4.1', 'OpenTK', 'GLSL'],
      mediaUrl: '/assets/images/scop.gif',
      mediaType: 'gif',
      whatIBuilt: [
        'Hand-rolled Wavefront OBJ parser with fan and ear-clipping triangulation',
        'UV mapping (box + face-normal projection) and smooth-normal generation from scratch',
        'BMP and PPM decoders with zero external image libraries',
        'Phong lighting with flat/smooth shading toggle, wireframe and backface culling'
      ],
      whatILearned: [
        'Strategy pattern for swappable triangulation/UV-mapping algorithms',
        'Writing a custom column-major Mat4/vector math library',
        'Binary file-format parsing (BMP/PPM) by hand',
        'Dual-viewport rendering and PPM screenshot export'
      ],
      challenges: [
        'Triangulating concave polygons correctly (ear-clipping)',
        'Generating consistent normals when a model has none',
        'Decoding two different image formats without any library support'
      ],
      githubUrl: 'https://github.com/SirAlabar/scop-42'
    },
    {
      title: 'ft_irc - IRC Server',
      subtitle: 'Real-time chat server with bot',
      techStack: ['C++98', 'TCP/IP', 'Poll', 'HTTP', 'Design Patterns', 'Team project (3 developers)'],
      mediaUrl: '/assets/videos/irc_demo.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Designed the overall server architecture',
        'Implemented core IRC protocol commands (20+)',
        'Channel management with modes and operators',
        'IRC bot integration (weather API, fun commands)'
      ],
      whatILearned: [
        'Network programming with TCP/IP sockets',
        'Non-blocking I/O using poll()',
        'Applying Command, Factory and Singleton patterns',
        'Protocol-driven development following RFC standards'
      ],
      challenges: [
        'Designing a scalable and maintainable server architecture',
        'Handling multiple concurrent clients safely',
        'Ensuring strict RFC compliance',
        'Coordinating development in a team environment'
      ],
      githubUrl: 'https://github.com/SirAlabar/Internet_Relay_Chat'
    },
    {
      title: 'Inception',
      subtitle: 'Containerized infrastructure with Docker',
      techStack: ['Docker', 'Docker Compose', 'NGINX', 'WordPress', 'MariaDB'],
      mediaUrl: '/assets/images/docker.jpg',
      mediaType: 'image',
      whatIBuilt: [
        'Multi-container web infrastructure',
        'NGINX with TLSv1.3 and WordPress with php-fpm',
        'Bonus: Redis, FTP, Adminer, Portainer, Static site'
      ],
      whatILearned: [
        'Container virtualization principles',
        'Docker networking and volume management',
        'Infrastructure as Code practices',
        'Service orchestration with Docker Compose'
      ],
      challenges: [
        'Proper service isolation and communication',
        'Data persistence across container restarts',
        'Security best practices for containers'
      ],
      githubUrl: 'https://github.com/SirAlabar/inception'
    },
    {
      title: 'C++ Modules (00-09)',
      subtitle: 'Object-Oriented Programming mastery',
      techStack: ['C++98', 'OOP', 'STL', 'Templates', 'Design Patterns'],
      mediaUrl: '/assets/images/cpp.png',
      mediaType: 'image',
      whatIBuilt: [
        '10 modules with 30+ exercises',
        'Orthodox Canonical Form implementations',
        'STL containers and template classes'
      ],
      whatILearned: [
        'Encapsulation, inheritance, polymorphism',
        'Operator overloading and templates',
        'Exception handling and RTTI',
        'STL algorithms and containers'
      ],
      challenges: [
        'Strict C++98 compliance without modern features',
        'Memory management without smart pointers',
        'Abstract class and interface design'
      ],
      githubUrl: 'https://github.com/SirAlabar/42-CPP'
    },
    {
      title: 'Minishell',
      subtitle: 'Unix shell implementation',
      techStack: ['C', 'POSIX', 'Binary Trees', 'Readline', 'Process Control', 'Pair project (2 developers)'],
      mediaUrl: '/assets/videos/minishell.mp4',
      mediaType: 'video',
      whatIBuilt: [
        'Command parser using asymmetric binary tree',
        'Built-in commands (echo, cd, pwd, export, env)',
        'Redirections, pipes, and signal handling'
      ],
      whatILearned: [
        'Process management with fork/exec',
        'POSIX compliance and standards',
        'Tree-based parsing algorithms'
      ],
      challenges: [
        'Asymmetric binary tree command parsing',
        'Memory leak prevention in complex flows',
        'Signal handling (Ctrl+C, Ctrl+D, Ctrl+\\)'
      ],
      githubUrl: 'https://github.com/SirAlabar/42-Minishell'
    },
    {
      title: 'Philosophers',
      subtitle: 'Threading and synchronization problem',
      techStack: ['C', 'Threads', 'Mutexes', 'Semaphores', 'Process Management'],
      mediaUrl: '/assets/images/philo_problem.png',
      mediaType: 'image',
      whatIBuilt: [
        'Thread-based dining philosophers simulation',
        'Mutex and semaphore resource management',
        'Death monitoring and timing system'
      ],
      whatILearned: [
        'Threading concepts and implementation',
        'Resource sharing and deadlock prevention',
        'Synchronization with mutexes/semaphores'
      ],
      challenges: [
        'Preventing race conditions and deadlocks',
        'Precise timing with usleep and gettimeofday',
        'Process vs thread-based implementations'
      ],
      githubUrl: 'https://github.com/SirAlabar/philosophers'
    }
  ];
}