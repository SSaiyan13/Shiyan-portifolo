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
  },

  trace: {
    kicker: 'Solo project · Product prototype · 2026',
    title: 'TRACE',
    summary: 'Transcribe, Read, And Check by Ear: turns a song into tab and sheet music, then plays the real bass from the recording so you can check the page by ear instead of just trusting it.',
    image: '/assets/work-trace.webp',
    alt: 'TRACE on a laptop: a song’s tab and sheet music with a playback marker on bar 3',
    overview: {
      role: 'Solo: user research, problem framing, product design, prototyping and the accuracy study',
      tools: 'Claude Code, Python, JavaScript, HTML & CSS, alphaTab, Spotify Basic Pitch, StemKit, Demucs, GitHub Codespaces, Claude Design',
      skills: ['User research', 'Survey design', 'Competitive analysis', 'Problem framing', 'User journey design', 'Fake-door testing', 'Prototyping', 'Accuracy evaluation', 'Accessibility'],
      awards: [],
      links: [
        ['GitHub', 'https://github.com/SSaiyan13/trace'],
        ['Try it in your browser', 'https://codespaces.new/SSaiyan13/trace?quickstart=1']
      ]
    },
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        blocks: [
          { p: 'Casual players who want to play a specific song often can’t find an accurate free version, and don’t have the ear training to make one. Free tabs are often wrong in ways you can’t see, good ones sit behind paywalls, and working it out by hand takes hours.' },
          { quote: 'If I could hear what it sounded like first.' },
          {
            cards: [
              ['Who it’s for: Maya', 'A casual guitar and piano player, three years in. She learns from tab sites, YouTube and sometimes a teacher, and has never worked out a song by ear.'],
              ['What she wants', 'To play a song she loves now, without paying or hunting for an accurate version.'],
              ['What frustrates her', 'Free tabs are often wrong and she can’t tell. Good ones sit behind paywalls. Working it out herself would take hours, and she doesn’t trust her ear.'],
              ['What would help', 'Hearing the real bass next to the tab, so she can check it herself.']
            ]
          },
          { p: 'Why bass first: a bass line is one note at a time, which suits an automatic pipeline, and bass is the instrument I’m trained in, so I can judge the output myself. Honest limit: only 4 of 47 survey respondents play bass, so demand for bass specifically isn’t tested yet.' }
        ]
      },
      {
        id: 'research',
        label: 'Research',
        blocks: [
          { p: 'I surveyed 47 musicians from my own network, mostly casual players and people who used to play, mostly pianists and guitarists.' },
          { stats: [['38 of 47', 'Can’t find an accurate version sometimes or often'], ['33 of 47', 'Have never tried to work a song out by ear'], ['37 of 47', 'Named paywalls as a frustration']] },
          {
            table: {
              head: ['Pain point', 'What people said', 'Count'],
              rows: [
                ['No accurate version exists', 'Sometimes or often can’t find one. When it happens: give up and pick another song (22), use an inaccurate tab anyway (11), or work it out by ear (11)', '38 of 47'],
                ['Can’t tell if a tab is right', 'Usually can’t tell whether a tab is right', '14 of 47'],
                ['Never tried by ear, low confidence', 'Never transcribed by ear; median confidence 3 out of 10', '33 of 47'],
                ['By hand takes too long', 'All but one of the 14 who tried took 30 minutes or more for a 3-minute song; 5 took over 3 hours', '14 of 47']
              ],
              highlight: 1
            }
          },
          { p: 'What gets in the way, out of 47 responses (people could pick more than one):' },
          {
            table: {
              head: ['Problem', 'Responses'],
              rows: [['Paywalls', '37'], ['Hard to find', '15'], ['Wrong key', '13'], ['Can’t tell if it’s right', '11'], ['Hard to read', '10'], ['Wrong notes', '9']]
            }
          },
          { p: 'What would build trust: the most common free-text answer (about 10 people) was hearing it and judging for themselves. Small, friendly sample from my own network, so I treat it as a signal, not proof.' },
          { p: 'The gap in the market. Paid AI tools already turn audio into tab, so the gap isn’t “nobody does this”. It’s that good output sits behind a paywall, and none of these tools say they help a nervous beginner check the result against the real recording (public pages, checked Oct 31, 2026).' },
          {
            table: {
              head: ['Tool', 'What it does', 'Where it falls short for this case'],
              rows: [
                ['Songscription', 'Audio to sheet music, MIDI and tab', 'Free tier is a 30-second preview; exports are paid'],
                ['Klangio Transcription Studio', 'Detects instruments, outputs notation and tab, has an editor', 'Subscription; free preview of the first 20 seconds'],
                ['Moises', 'Stem separation, tempo and pitch change, key detection', 'No sheet music or tab output mentioned'],
                ['Songsterr', 'Mostly user-submitted tabs with playback', 'Only songs someone has already submitted'],
                ['MuseScore', 'Free notation editor', 'Can’t turn an MP3 into notation'],
                ['TRACE', 'A free-to-start first draft, played next to the real bass', 'One song so far; a draft to check, not a verified transcription']
              ],
              highlight: 5
            }
          },
          { quote: 'Plenty of tabs. Nothing you can check. The gap: one page where the tab, the key and the real recording sit together, so you can check it by ear.' }
        ]
      },
      {
        id: 'solution',
        label: 'Solution',
        blocks: [
          { p: 'TRACE is a web page that takes a song’s bass line from audio to readable tab and sheet music, then lets the player hear it and judge it. In five stages:' },
          {
            cards: [
              ['1 Find the song', 'Search, or pick a ready song. If it’s missing, Request this song counts the demand.'],
              ['2 Wait', 'The bass is separated and turned into notes. In the prototype this ran ahead of time, and the screen says so.'],
              ['3 See it', 'The whole song as tab, sheet music or both, in the right key.'],
              ['4 Hear it', 'Play the real bass while a marker follows the tab. Compare it with what TRACE wrote, slow it down, repeat a section.'],
              ['5 Take it away', 'Print or save a clean PDF.']
            ]
          },
          { p: 'Pain points mapped to the solution: no accurate version (stages 1 to 3), can’t tell if it’s right (stage 4), never tried and low confidence (the tool does the ear work), too slow by hand (minutes against hours).' },
          { photos: [['/assets/case-trace-find.webp', 'TRACE front page: search, instrument picker and ready-to-play song cards'], ['/assets/case-trace-wait.webp', 'TRACE wait screen explaining each processing step in plain words']] },
          { p: 'How it works: the bass is separated with Demucs (one command) or by hand with StemKit, then turned into notes with Spotify’s Basic Pitch. My own code tidies the notes, lines the rhythm up with the beat, detects the key, adds ties and dotted notes, and picks a string and fret for every note. The open-source alphaTab library draws and plays it.' },
          {
            list: [
              'Play uses the real bass from the recording, and the marker follows its clock. A synthesized tab always sounds right to itself; only the real recording can expose its mistakes.',
              'It handles one note at a time, in 4/4 with one tempo, on a 16th-note grid. The fingering is a best guess that keeps hand movement small.',
              'Not built yet: other instruments, uploading a song in the page, fixing wrong notes in the page, and transposing to another key.',
              'It’s a first draft to check by ear, not a verified transcription, and the page says so everywhere.'
            ]
          }
        ]
      },
      {
        id: 'results',
        label: 'Results',
        blocks: [
          { p: 'Each success metric is a feature of the product that answers one pain point, so you can open the prototype and see each one. I won’t publish a number I haven’t measured.' },
          {
            table: {
              head: ['Pain point', 'Success metric (a feature)', 'Result'],
              rows: [
                ['Paywalls (37 of 47)', 'Free to start, so Maya is never stuck behind a subscription', 'Yes. The prototype and the code are free and open source.'],
                ['No accurate version exists', 'The whole song as tab and sheet music, not one page', 'Yes. All 77 bars of “Loser” by Tame Impala.'],
                ['Wrong key (13 of 47)', 'The key is detected, shown, and can be changed on the page', 'Yes. F minor found and shown, tempo 83 BPM.'],
                ['Can’t tell if it’s right', 'She hears the real bass next to the tab, with a marker that follows along', 'Yes, and TRACE matches 89% of the notes two human transcriptions agree on.'],
                ['Hard to read (10 of 47)', 'Tab, sheet music or both, with ties and dotted notes, and a clean PDF to print', 'Yes.'],
                ['Never tried, low confidence', 'The tool does the ear work, so she only has to press play and listen', 'Yes. No ear training needed.'],
                ['Too slow by hand', 'Time to get a tab: minutes against hours', 'By hand: 150 minutes for about half the song. Tool time still to measure.']
              ],
              highlight: 3
            }
          },
          { stats: [['95%', 'Notes the two human transcriptions agree on'], ['89%', 'Of those agreed notes that TRACE got'], ['<5%', 'Extra notes TRACE added']] },
          { p: 'I compared TRACE’s notes with two independent human transcriptions of the same song, a YouTube bass tutorial and Songsterr. Pitches only, one song, read by eye from screenshots: a first signal, not a benchmark.' },
          { photos: [['/assets/case-trace-ipad.webp', 'TRACE on an iPad: sheet music and tab with the playback marker and player'], ['/assets/case-trace-phone.webp', 'TRACE on a phone: tab with the player pinned to the bottom']] },
          { p: 'Next: build the same page for guitar and piano, the instruments Maya plays, add more songs, then transposing and wrong-note fixing, and sort out licensing before any public launch.' }
        ]
      },
      {
        id: 'ai-tools',
        label: 'AI tools',
        blocks: [
          {
            table: {
              head: ['Step', 'Tool', 'AI or not'],
              rows: [
                ['Separate the bass from the song', 'Demucs (Meta), by command or by hand through StemKit', 'AI models'],
                ['Find the notes in the bass audio', 'Basic Pitch (Spotify)', 'Machine-learning model'],
                ['Choose string and fret for each note', 'My own Python code, written with Claude', 'Algorithms (rhythm snapping, key detection, dynamic programming), not machine learning'],
                ['Show tab and notation, and play it', 'alphaTab', 'Open-source library, not AI'],
                ['Plan, code, survey analysis and write-up', 'Claude', 'AI assistant']
              ]
            }
          },
          { p: 'AI does the listening; I decide what’s right. I wrote and ran the survey myself, chose the problem and the song, and checked the result against two human transcriptions. Claude helped me plan the project, write and debug the page and the fingering code, and tally the survey results.' }
        ]
      },
      {
        id: 'slides',
        label: 'Slides',
        blocks: [{ embed: { src: '/assets/trace-pitch-deck.pdf#navpanes=0&view=Fit', href: '/assets/trace-pitch-deck.pdf', label: 'TRACE pitch deck' } }]
      },
      {
        id: 'reflections',
        label: 'What I found',
        blocks: [
          { p: 'The biggest visible problem wasn’t wrong notes. TRACE guessed beat 1 from the first note it heard, which came a little before the first real downbeat, so every note looked 2 to 3 sixteenths late: the pitches were right but the rhythm looked wrong. After I fixed beat 1, twice as many bars matched exactly. That’s why the check by ear matters: a player hears that kind of mismatch straight away.' },
          { p: 'What would make me change course:' },
          {
            list: [
              'If the tab and the real bass often disagree when I check them myself, “hear it and judge it” isn’t enough and I’d rethink the trust problem first.',
              'If demand sits with guitar and piano players, as the survey suggests, I’d build those instruments first (only 4 of 47 played bass).',
              'If most notes in a 16-bar check are wrong, the separation and note-detection steps come before anything else.',
              'If the real problem is paying for tabs rather than finding them, it becomes a pricing question, not a transcription one.'
            ]
          }
        ]
      }
    ]
  }
};
