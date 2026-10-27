// Case studies for the Technical Projects page, keyed by the `caseId` in work.js.
// Each one is an overview (role, team, tools, skills, awards, links) and a list
// of sections. A section is a heading plus blocks, drawn in order:
//   { p }                         a paragraph
//   { stats: [[value, label]] }   a row of number tiles
//   { list: [] }                  bullet points
//   { quote }                     a pulled quote
//   { cards: [[title, text]] }    a grid of small cards
//   { table: { head, rows, highlight } }   a table; `highlight` is a row index
//   { embed: { src, href, label } }        slides shown in place, with a link out
//   { photos: [[src, alt]] }      a row of photos

export const caseStudies = {
  launchpath: {
    kicker: 'Productathon · ProduHacks 2026',
    title: 'Launchpath',
    summary: 'Giving engineering team leads a real starting point for every new hire, instead of rebuilding onboarding from scratch each time.',
    image: '/assets/work-launchpath.png',
    alt: 'LaunchPath pitch deck title slide',
    overview: {
      role: 'Building the Figma prototype and our video submission',
      team: 'Min Li Wang, Lynn Vu, Owen Li',
      skills: ['Problem framing', 'Positioning', 'Feature prioritisation', 'UX design', 'Figma', 'Figma Make', 'Prototyping', 'Pitching'],
      awards: [],
      links: [
        ['Pitch deck', 'https://www.figma.com/deck/rXAgtPoJ9zqaCP6lW2enI4/Produhacks_2026_LaunchPath-Pitch-Deck?node-id=0-20'],
        ['GitHub', 'https://github.com/owenzli/launchpath_produhacks_2026']
      ]
    },
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        blocks: [
          { p: 'Engineering teams move fast. New hires don’t, and not because they’re slow: nobody gives them a real starting point. The moment an engineer joins a team, the lead scrambles to pull together Slack messages, stale wiki pages and tribal knowledge, and the new hire spends their first two weeks pinging people for access, context and direction.' },
          { p: 'It happens at a 40-person startup and inside a 4,000-person enterprise alike. Senior engineers lose focus, and sprint velocity drops.' }
        ]
      },
      {
        id: 'research',
        label: 'Research',
        blocks: [
          { p: 'Companies already pay for onboarding software. It just stops at the org level, which is exactly where the team lead’s problem starts:' },
          {
            table: {
              head: ['Where onboarding lives', 'What it covers', 'Where it leaves a gap'],
              rows: [
                ['Workday, BambooHR, Rippling', 'HR admin across the company: contracts, payroll, accounts', 'Never touches what happens inside the team'],
                ['Slack threads and wikis', 'Whatever the last person wrote down', 'Scattered, stale, and rebuilt by hand every hire'],
                ['Launchpath', 'A team-level, week-by-week plan for engineering hires', 'Depends on teams filling the doc gaps it flags']
              ],
              highlight: 2
            }
          },
          { p: 'The sharpest insight came from reframing who the user is. We started at “startup HR” and ended at “any engineering team lead who cares about velocity”. That one change rewrote the problem statement, the feature priorities, the pitch and the design language.' },
          { quote: 'The problem isn’t company size. It’s that every team lead is rebuilding onboarding from scratch, every single time.' }
        ]
      },
      {
        id: 'solution',
        label: 'Solution',
        blocks: [
          { p: 'A manager enters the new hire’s role, team and start date. Launchpath generates a sequenced, time-boxed roadmap: repo access, environment setup, architecture walkthroughs, a first PR and team introductions, each linked to a real document.' },
          {
            cards: [
              ['Onboarding wizard', 'Role-based roadmap generation, so a lead starts from a plan instead of a blank page.'],
              ['Doc debt flags', 'Where a task has no documentation, Launchpath flags it before day one, turning a reactive problem into a proactive one.'],
              ['New hire checklist', 'One focused list with progress tracking, instead of a dozen DMs.'],
              ['Manager dashboard', 'Live status of every onboarding in flight.']
            ]
          },
          { p: 'The hardest call was the doc debt flags: visible enough that managers act on them, without being so aggressive they’re dismissed to move faster. We landed on friction-to-launch: any flag can be overridden, but it has to be acknowledged explicitly before the plan goes out.' }
        ]
      },
      {
        id: 'results',
        label: 'Results',
        blocks: [
          { p: 'We shipped a working MVP prototype in the hackathon window. It was designed in Figma and Figma Make, built with Google Antigravity and Gemini, and fronted in HTML, CSS and Tailwind, then pitched to the ProduHacks judges.' },
          { stats: [['4', 'Core features shipped in the MVP prototype'], ['4', 'People on the team, from problem framing to pitch']] }
        ]
      },
      {
        id: 'slides',
        label: 'Slides',
        blocks: [{ embed: { src: 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent('https://www.figma.com/deck/rXAgtPoJ9zqaCP6lW2enI4/Produhacks_2026_LaunchPath-Pitch-Deck'), href: 'https://www.figma.com/deck/rXAgtPoJ9zqaCP6lW2enI4/Produhacks_2026_LaunchPath-Pitch-Deck?node-id=0-20', label: 'Launchpath pitch deck' } }]
      },
      {
        id: 'reflections',
        label: 'Reflections',
        blocks: [
          { p: 'Honestly, the project furthest out of my comfort zone. I learned corporate terms like B2B and SaaS, and what it takes to build a tool that helps with onboarding. With my limited knowledge of that world, I couldn’t fully understand the product at first, and seeing tools built around such a narrow use case made me a little scared that this is what big corporations are really doing.' },
          { p: 'But being uncomfortable while learning that side made me realize how much room there is for me to grow.' }
        ]
      }
    ]
  },

  jolty: {
    kicker: 'Hackathon · Producathon · 1st place overall',
    title: 'Jolty',
    summary: 'A one-minute daily ritual that trains creativity like a muscle, without AI thinking for you.',
    image: '/assets/work-jolty.png',
    alt: 'Jolty solution slide showing the app onboarding screen',
    overview: {
      role: 'Slide building, user personas, user research and building the prototype',
      team: 'Min Li Wang, Elizabeth Lau',
      skills: ['User research', 'Survey design', 'MVP scoping', 'Behaviour design', 'Figma', 'Prototyping', 'Pitching'],
      awards: ['1st place overall @ Producathon'],
      links: [
        ['Pitch deck', 'https://www.figma.com/deck/EK8e4MUTqf2IujX6stmlO4'],
        ['Prototype', 'https://gemini.google.com/share/6cb4665d6c8e']
      ]
    },
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        blocks: [
          { p: 'As students we consume thousands of ideas a day and create almost none of our own. A good thought shows up mid-scroll and is gone two seconds later. Journaling felt heavy, AI tools made thinking feel outsourced, and creativity started to feel like effort instead of expression.' },
          { quote: 'People don’t need better AI. They need better habits.' }
        ]
      },
      {
        id: 'research',
        label: 'Research',
        blocks: [
          { p: 'Before designing anything, we surveyed students about how they capture ideas and why they stop.' },
          { stats: [['98', 'Survey responses from students'], ['3', 'Features the MVP was cut down to'], ['12 h', 'From first question to final pitch']] },
          { p: 'The hard part wasn’t collecting answers; it was turning 98 of them into a three-feature MVP and saying no to everything else.' }
        ]
      },
      {
        id: 'solution',
        label: 'Solution',
        blocks: [
          { p: 'Jolty is a mobile app built around one constraint: one sentence, in 60 seconds, every day.' },
          {
            cards: [
              ['Daily Entry', 'Write one sentence in 60 seconds. Small enough to never skip.'],
              ['Idea Retro', 'Revisit one past idea and add a new angle, so thoughts compound instead of disappearing.'],
              ['Streak + Idea Bank', 'Watch raw thoughts slowly turn into real concepts.']
            ]
          },
          { p: 'The decisions that shaped it:' },
          {
            list: [
              'No “AI, generate an idea for me” button. It was the obvious feature to add, and exactly the habit we wanted to break (the judges agreed).',
              'Limit users to one sentence, and make that limit feel like the point rather than a restriction.',
              'Design urgency so people actually come back tomorrow, because the habit loop matters more than the feature list.'
            ]
          }
        ]
      },
      {
        id: 'results',
        label: 'Results',
        blocks: [
          { p: 'We designed the flows in Figma, used Gemini Canvas and ChatGPT for the prompt logic, built a lightweight Python backend to store and resurface entries, and finished the prototype and pitch inside the 12-hour sprint.' },
          { stats: [['1st', 'Place overall'], ['98', 'Students heard from'], ['12 h', 'Prototype and pitch, start to finish']] },
          { photos: [['/assets/case-jolty-win.webp', 'The Jolty team holding their Producathon winner certificates in front of the Jolty pitch slide']] },
          { p: 'Next on the list: smarter prompts based on past entries, a weekly “idea remix” mode, export to Notes and Notion, and a business model built on habit analytics and premium reflections.' }
        ]
      },
      {
        id: 'slides',
        label: 'Slides',
        blocks: [{ embed: { src: 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent('https://www.figma.com/deck/EK8e4MUTqf2IujX6stmlO4'), href: 'https://www.figma.com/deck/EK8e4MUTqf2IujX6stmlO4', label: 'Jolty pitch deck' } }]
      },
      {
        id: 'reflections',
        label: 'Reflections',
        blocks: [
          { p: 'This was my first product hackathon, and the first time I learned the product lifecycle properly. I was thinking very technically and had never really considered the business side, and the judges’ feedback made that impossible to ignore.' },
          { p: 'They pushed us on things we hadn’t thought about: how Jolty grows beyond its basic features, how it makes money, and what gives people the urgency and motivation to come back. They pointed to Duolingo, which people open every day even when they aren’t really learning the language. And a daily idea only matters if people take action on it, so getting them from a sentence to doing something was the next problem to solve.' },
          { p: 'All of it made me want to build up the business side of myself, because an ideal PM can do both.' }
        ]
      }
    ]
  },

  planless: {
    kicker: 'Designathon · UBC UX Hub UXathon 2026',
    title: 'Planless',
    summary: 'An iMessage extension that makes planning a break with friends as quick as sending a text.',
    image: '/assets/work-planless.png',
    alt: 'Planless concept slide: why does taking a break take work?',
    overview: {
      role: 'User journey and personas, user research, and building and debugging the prototype',
      team: 'Renata Lawrence, Avia Wen, Dayson How',
      skills: ['Problem framing', 'User flows', 'Interaction design', 'Figma', 'Prototyping', 'Presenting'],
      awards: ['2nd place, Beginner Stream @ UBC UX Hub UXathon 2026'],
      links: [
        ['Figma prototype', 'https://www.figma.com/proto/xedceibnGk7RSqInhpC993/Planless?page-id=0%3A1&node-id=2-6184&content-scaling=fixed&starting-point-node-id=2%3A6184&t=nFyzTpAZDUoi9dGE-1'],
        ['Slides', 'https://www.canva.com/design/DAG-FCq1CAY/U-8hhDKGs5JkyU-07fFTYg/view']      ]
    },
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        blocks: [
          { p: 'Why does taking a break take work? Spending off-screen time with friends means bouncing between a calendar app and the group chat, cross-referencing three other people’s schedules just to find one free hour. By the time it’s sorted, the moment has passed.' },
          { quote: 'Why does taking a break take work?' }
        ]
      },
      {
        id: 'solution',
        label: 'Solution',
        blocks: [
          { p: 'Planless lives where the plan is already happening: inside iMessage. The group finds an overlapping hour without anyone leaving the chat.' },
          {
            cards: [
              ['Plan where you talk', 'An iMessage extension, so nobody has to switch apps or invite friends to something new.'],
              ['Overlap, not back-and-forth', 'Finds the hour that works for everyone instead of a thread of “what about Tuesday?”.'],
              ['Breaks, not meetings', 'Made for getting off-screen with friends, not for booking work calls.']
            ]
          }
        ]
      },
      {
        id: 'results',
        label: 'Results',
        blocks: [
          { p: 'We designed and prototyped Planless end to end in Figma during the UXathon and presented it to the UBC UX Hub judges.' },
          { stats: [['2nd', 'Place, Beginner Stream'], ['4', 'Designers on the team']] }
        ]
      },
      {
        id: 'slides',
        label: 'Slides',
        blocks: [{ embed: { src: 'https://www.canva.com/design/DAG-FCq1CAY/U-8hhDKGs5JkyU-07fFTYg/view?embed', href: 'https://www.canva.com/design/DAG-FCq1CAY/U-8hhDKGs5JkyU-07fFTYg/view', label: 'Planless presentation' } }]
      },
      {
        id: 'reflections',
        label: 'Reflections',
        blocks: [
          { p: 'Honestly, my most creative technical product to date. Coming up with the idea was a rollercoaster with my team. So many teams were building apps and websites, and this one made us think outside the box. It was also my longest ideation process ever, but in the best stories, the best ideas come in a time crunch, at random.' },
          { p: 'With about five hours left before submission, a mentor hit us with hard-hitting questions and scenarios that destroyed our confidence. It taught me the importance of finding a user who wouldn’t use the product, to see its real limits, while still trusting that what we built is great and works. So we kept going: we built a pitch that named the limitations upfront and stopped trying to make the product too broad.' },
          { quote: 'Funnily enough, that same mentor judged our pitch. This time we were ready, and we held our ground.' },
          { photos: [['/assets/case-planless-team.webp', 'The Planless team at UXathon 2026, holding I love UX signs'], ['/assets/case-planless-award.webp', 'The Planless team holding their 2nd place winner certificates']] }
        ]
      }
    ]
  },

  sodelic: {
    kicker: 'Career · Product Designer Intern',
    title: 'Sodelic',
    summary: 'Designing a scope tool clients actually want to use.',
    image: '/assets/work-sodelic.png',
    alt: 'Sodelic dashboard showing project scope tracking',
    overview: {
      role: 'Product Designer Intern (sole designer)',
      team: 'Founder, VP, development team',
      tools: 'Figma, Jira, Notion, Adobe Premiere Pro',
      skills: ['End-to-end product design', 'User research', 'Surveys', 'Wireframing', 'Prototyping', 'Design systems', 'Onboarding design', 'Stakeholder demos', 'Video production'],
      awards: [],
      links: [['sodelic.com', 'https://www.sodelic.com/']]
    },
    sections: [
      {
        id: 'overview-text',
        label: 'About',
        blocks: [
          { p: 'Sodelic is a B2B scope management platform for software teams. It sits on top of tools like Jira and links every client request to what’s actually being built, tested or delivered, so nothing falls through the cracks between developers and clients.' },
          { p: 'As the only designer, I owned the full product design, from early research to the launch demo.' }
        ]
      },
      {
        id: 'problem',
        label: 'Problem',
        blocks: [
          { p: 'Software teams lose time and money to scope creep and miscommunication. Developers live in Jira, but clients don’t. When clients get pulled into developer tools, the jargon overwhelms them, and they either disengage or keep asking for updates over email.' },
          { p: 'The founders built Sodelic out of this exact frustration. My job was to design something both sides would actually use.' },
          {
            cards: [
              ['Core users', 'Freelancers, consultants, PMs, founders and scrum masters who manage scope and map it to their dev workflow.'],
              ['Collaborators', 'Clients and beta testers who review scope, give feedback and sign off on features. Collaborators are always free, so the product had to work for people with zero training.']
            ]
          }
        ]
      },
      {
        id: 'research',
        label: 'Research',
        blocks: [
          { p: 'I talked with our internal team, partner companies and people at conferences in BC, and ran surveys through our network. Two things stood out:' },
          {
            list: [
              'Teams didn’t want another task tracker. They’d already invested in Jira and weren’t going to move their developers.',
              'Clients needed far less than we thought. They wanted to see progress and approve things, not manage tickets.'
            ]
          },
          { quote: 'We stopped trying to compete with Jira and positioned Sodelic as a layer that complements it.' }
        ]
      },
      {
        id: 'solution',
        label: 'Solution',
        blocks: [
          { p: 'Our two user groups needed opposite things. Core users were learning a brand new kind of product, so they needed guidance. Clients needed almost nothing: a clear way to see progress and say yes. On top of that, we were working against a tight release timeline and wanted to keep the product looking clean.' },
          {
            cards: [
              ['The single-button client view', 'I stripped the client view down to its simplest form, so non-technical stakeholders could see what’s being built, leave feedback and sign off without a learning curve.'],
              ['An in-app tutorial for core users', 'Instead of cluttering the interface with explanations, a guided walkthrough teaches new users the platform without compromising the clean design.'],
              ['A design system', 'One system across the whole platform, so the experience stayed consistent and developers could build faster.']
            ]
          }
        ]
      },
      {
        id: 'process',
        label: 'Process',
        blocks: [
          { p: 'I designed 20+ wireframes and 5 interactive prototypes in Figma, and ran weekly demos with the founder, our VP and partner companies. Showing working screens instead of writing long updates got everyone reacting to the same thing at the same time. I also produced 2 promotional videos in Premiere Pro to explain the product to users and stakeholders.' },
          { stats: [['20+', 'Wireframes'], ['5', 'Interactive prototypes'], ['2', 'Promotional videos']] }
        ]
      },
      {
        id: 'results',
        label: 'Impact',
        blocks: [
          { stats: [['10 → 7', 'Weeks for stakeholders to align on direction'], ['~50%', 'Fewer steps in core flows'], ['Launch', 'Shipped and demoed']] },
          {
            list: [
              'Weekly prototype demos cut how long stakeholders took to agree on direction, from 10 weeks to 7.',
              'The simplified interface and design system cut flow steps by roughly half and reduced developer rework.',
              'Early users came back after the launch demo with ideas for new features, a good sign they saw where the product could go.'
            ]
          }
        ]
      },
      {
        id: 'reflections',
        label: 'Reflections',
        blocks: [
          { p: 'This was my first time going through the entire product lifecycle, and being at a startup felt like being dropped into a warzone. So much information was coming at me that it was overwhelming at first, so I started asking questions, a lot of them, just to catch up. Somewhere along the way that feeling flipped: what started as fear and dread turned into something exciting. It also taught me to pace myself, because in that environment it’s easy to burn out if you don’t learn when to step back.' },
          { quote: 'There’s no such thing as a wrong question. Asking them is now the first thing I do on any new project.' }
        ]
      }
    ]
  }
};
