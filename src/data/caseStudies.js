// Case studies for the Technical Projects page, keyed by the `caseId` in work.js.
// Each one is an overview (role, timeline, team, skills, awards, links) and a list
// of sections. A section is a heading plus blocks, drawn in order:
//   { p }                         a paragraph
//   { stats: [[value, label]] }   a row of number tiles
//   { list: [] }                  bullet points
//   { quote }                     a pulled quote
//   { cards: [[title, text]] }    a grid of small cards
//   { table: { head, rows, highlight } }   a table; `highlight` is a row index
//   { embed: { src, href, label } }        slides shown in place, with a link out

export const caseStudies = {
  launchpath: {
    kicker: 'Productathon · ProduHacks 2026',
    title: 'Launchpath',
    summary: 'Giving engineering team leads a real starting point for every new hire, instead of rebuilding onboarding from scratch each time.',
    image: '/assets/work-launchpath.png',
    alt: 'LaunchPath pitch deck title slide',
    overview: {
      role: 'Building the Figma prototype and our video submission',
      timeline: 'Mar 21–22, 2026 · ProduHacks',
      team: 'Min Li Wang, Lynn Vu, Owen Li',
      skills: ['Problem framing', 'Positioning', 'Feature prioritisation', 'UX design', 'Figma', 'Figma Make', 'Prototyping', 'Pitching'],
      awards: [],
      links: [
        ['Pitch deck', 'https://www.figma.com/deck/rXAgtPoJ9zqaCP6lW2enI4/Produhacks_2026_LaunchPath-Pitch-Deck?node-id=0-20'],
        ['GitHub', 'https://github.com/owenzli/launchpath_produhacks_2026'],
        ['Devpost', 'https://devpost.com/software/launchpath']
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
          { p: 'Who the user is decides everything downstream. Once we stopped designing for “HR” and started designing for one team lead on one Monday morning, the feature list got shorter and the pitch got sharper.' }
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
      timeline: 'Nov 22, 2025 · 12-hour sprint',
      team: 'Min Li Wang, Elizabeth Lau',
      skills: ['User research', 'Survey design', 'MVP scoping', 'Behaviour design', 'Figma', 'Prototyping', 'Pitching'],
      awards: ['1st place overall @ Producathon'],
      links: [
        ['Pitch deck', 'https://www.figma.com/deck/EK8e4MUTqf2IujX6stmlO4'],
        ['Prototype', 'https://gemini.google.com/share/6cb4665d6c8e'],
        ['Devpost', 'https://devpost.com/software/jotly']
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
          { list: ['Constraints beat features.', 'Behaviour design matters more than the tech stack.', 'A strong narrative wins hackathons.'] }
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
      timeline: 'Jan 10–11, 2026 · UXathon',
      team: 'Renata Lawrence, Avia Wen, Dayson How',
      skills: ['Problem framing', 'User flows', 'Interaction design', 'Figma', 'Prototyping', 'Presenting'],
      awards: ['2nd place, Beginner Stream @ UBC UX Hub UXathon 2026'],
      links: [
        ['Figma prototype', 'https://www.figma.com/proto/xedceibnGk7RSqInhpC993/Planless?page-id=0%3A1&node-id=2-6184&content-scaling=fixed&starting-point-node-id=2%3A6184&t=nFyzTpAZDUoi9dGE-1'],
        ['Slides', 'https://www.canva.com/design/DAG-FCq1CAY/U-8hhDKGs5JkyU-07fFTYg/view'],
        ['Devpost', 'https://devpost.com/software/uxathon-plan-less']
      ]
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
      }
    ]
  }
};
