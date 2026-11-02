#!/usr/bin/env node
"use strict";

/**
 * Author Week 8: Personal and business uses of emerging technologies (AC2.1).
 * Regenerates week-8 activities, session, week row and package.json.
 */

const fs = require("node:fs");
const path = require("node:path");
const content = require("@learning-platform/content");

const ROOT = path.join(__dirname, "..", "content", "l2e-exploring-emerging-digital-technologies");
const packagePath = path.join(ROOT, "package.json");

function envelope(schema, id, version, metadata, relationships, extra) {
  return {
    schema,
    schemaVersion: "0.1.0",
    id,
    version,
    metadata: metadata || {},
    relationships: relationships || {},
    ...extra
  };
}

function block(id, type, body) {
  return envelope("lp.content.block", id, "0.1.0", {}, {}, { type, content: body });
}

function activity(id, title, summary, activityType, blocks, minutes) {
  return envelope(
    "lp.content.activity",
    id,
    "0.1.0",
    {
      title,
      status: "available",
      summary,
      href: null,
      difficulty: "standard",
      estimatedDurationMinutes: minutes || 10,
      activityType,
      topics: []
    },
    {
      learningOutcomes: ["lo2"],
      assignment: "formative-practice",
      questions: [],
      assets: [],
      prerequisites: []
    },
    { blocks }
  );
}

function heading(id, text) {
  return block(id, "heading", { text, level: 2 });
}

function para(id, text) {
  return block(id, "paragraph", { text });
}

function callout(id, title, text) {
  return block(id, "callout", { tone: "info", title, text });
}

function sc(id, prompt, options, correctOptionId, correct, incorrect) {
  return block(id, "single-choice", {
    formative: true,
    questionId: id,
    prompt,
    options: options.map((label, index) => ({
      id: String.fromCharCode(97 + index),
      label
    })),
    correctOptionId,
    feedback: {
      correct,
      incorrect: incorrect || correct
    },
    sourceType: "single"
  });
}

function classify(id, prompt, categories, items, feedback) {
  return block(id, "classification", {
    formative: true,
    questionId: id,
    prompt,
    categories,
    items,
    feedback: {
      correct: feedback.correct,
      incorrect: feedback.incorrect
    }
  });
}

function short(id, prompt, guidance, minChars) {
  return block(id, "short-response", {
    formative: true,
    questionId: id,
    prompt,
    guidance,
    minChars: minChars == null ? 200 : minChars
  });
}

function reflection(id, prompt, minChars, guidance) {
  const body = {
    formative: true,
    questionId: id,
    prompt,
    minChars: minChars == null ? 500 : minChars
  };
  if (guidance) body.guidance = guidance;
  return block(id, "reflection", body);
}

const week8Activities = [
  activity(
    "week-8-starter",
    "Welcome to Week 8",
    "Introduce AC2.1 personal and business uses. Recap that Weeks 1 to 7 already outlined the technologies.",
    "Starter",
    [
      heading("week-8-starter-h", "Welcome to Week 8"),
      para(
        "week-8-starter-p1",
        "This week you explain personal and business uses of emerging technologies for Assessment Criterion (AC) 2.1. You already outlined what many technologies are in Weeks 1 to 7. Now you focus on how people and organisations use them."
      ),
      callout(
        "week-8-starter-c",
        "AC1.1 versus AC2.1",
        "AC1.1 is about identifying and outlining technologies. AC2.1 is about explaining how those technologies are used in personal and business contexts."
      ),
      para(
        "week-8-starter-p2",
        "Quick reminder of tools you already met: Artificial Intelligence (AI), Internet of Things (IoT), cloud computing, Virtual Reality (VR), Augmented Reality (AR), 5G, social media, vlogs, drones, blockchain and serverless computing."
      ),
      sc(
        "week-8-starter-q1",
        "What is the main focus of AC2.1 in this week?",
        [
          "Explaining personal and business uses of emerging technologies",
          "Memorising every chip voltage inside a drone",
          "Writing a full company investment case with no uses",
          "Ignoring all real-world examples"
        ],
        "a",
        "Correct. AC2.1 asks you to explain uses in personal and business contexts.",
        "Not quite. This week is about how technologies are used, not deep engineering or investment analysis."
      ),
      sc(
        "week-8-starter-q2",
        "How does AC2.1 differ from AC1.1?",
        [
          "AC1.1 outlines what technologies are; AC2.1 explains how they are used by people and organisations",
          "They are identical and only rename the same task",
          "AC2.1 only means drawing cables",
          "AC1.1 only covers social media passwords"
        ],
        "a",
        "Correct. First identify/outline, then explain uses.",
        "Not quite. Keep identification separate from explaining uses."
      )
    ],
    5
  ),
  activity(
    "week-8-personal-business",
    "Personal use and business use",
    "Define personal and business technology use and show that one technology can serve both.",
    "Teaching",
    [
      heading("week-8-personal-business-h", "Personal use and business use"),
      para(
        "week-8-personal-business-p1",
        "Personal use means an individual uses technology for their own life: entertainment, learning, health, communication or home tasks."
      ),
      para(
        "week-8-personal-business-p2",
        "Business use means an organisation uses technology to run or grow its work: serving customers, making products, marketing, collaborating or analysing performance."
      ),
      para(
        "week-8-personal-business-p3",
        "The same technology can do both. AI can recommend music at home and also power customer support at Pixel Forge Games."
      ),
      sc(
        "week-8-personal-business-q1",
        "Which example is mainly personal use?",
        [
          "A player uses a VR headset at home for leisure gaming",
          "A studio runs AI tools to analyse thousands of support tickets",
          "A warehouse tracks stock with IoT sensors for deliveries",
          "A marketing team posts trailers to grow sales"
        ],
        "a",
        "Correct. Home leisure gaming is personal use.",
        "Not quite. Personal use is for an individual's own life, not studio operations."
      ),
      sc(
        "week-8-personal-business-q2",
        "Which statement is most accurate?",
        [
          "One technology can have personal uses and business uses depending on the purpose",
          "Every technology can only ever have one use forever",
          "Business use means the technology has no users",
          "Personal use always means unpaid work for a company"
        ],
        "a",
        "Correct. Purpose and context decide personal versus business use.",
        "Not quite. Focus on who is using it and why."
      )
    ],
    5
  ),


  activity(
    "week-8-recap-uses",
    "From outline to use",
    "Bridge AC1.1 outlines into AC2.1 use explanations with short examples.",
    "Teaching",
    [
      heading("week-8-recap-uses-h", "From outline to use"),
      para(
        "week-8-recap-uses-p1",
        "Earlier weeks asked what a technology is. This week asks what it is used for. Example: IoT is connected devices; a personal use is a smart speaker at home; a business use is tracking studio equipment."
      ),
      para(
        "week-8-recap-uses-p2",
        "Keep explanations short: name the technology, state the purpose, and say whether the user is a person or an organisation."
      ),
      sc(
        "week-8-recap-uses-q1",
        "Which answer shows an AC2.1-style use explanation?",
        [
          "Cloud computing is used by Pixel Forge to host shared build files for remote artists",
          "Cloud",
          "Technology exists",
          "Emerging"
        ],
        "a",
        "Correct. The sentence explains a clear organisational use.",
        "Not quite. AC2.1 needs purpose and context, not only a label."
      ),
      sc(
        "week-8-recap-uses-q2",
        "Which pair is correctly framed?",
        [
          "Outline: what VR is; use: staff training in a headset at Pixel Forge",
          "Outline and use are the same single word with no example",
          "Use explanations are banned in AC2.1",
          "Only costs belong in AC2.1"
        ],
        "a",
        "Correct. Separate the outline from the use.",
        "Not quite. Keep identification and use explanations distinct."
      )
    ],
    4
  ),
  activity(
    "week-8-personal-ai-iot",
    "Personal uses: AI and IoT",
    "Explain everyday personal uses of AI assistants/recommendations and IoT devices.",
    "Teaching",
    [
      heading("week-8-personal-ai-iot-h", "Personal uses: AI and IoT"),
      para(
        "week-8-personal-ai-iot-p1",
        "Personal AI uses include virtual assistants that answer questions or set reminders, and recommendation systems that suggest music, videos or games."
      ),
      para(
        "week-8-personal-ai-iot-p2",
        "Personal IoT uses include smart home devices (lights, thermostats) and wearables that track steps or heart rate. The point for AC2.1 is the use, not redesigning the hardware."
      ),
      sc(
        "week-8-personal-ai-iot-q1",
        "Which is a personal AI use?",
        [
          "A phone assistant recommends playlists based on listening habits",
          "A factory robot only packing boxes for shop orders",
          "A studio blockchain ledger for digital item ownership history",
          "An SD-WAN link between two offices"
        ],
        "a",
        "Correct. Personal recommendations and assistants are everyday AI uses.",
        "Not quite. Look for an individual's everyday AI helper or recommendations."
      ),
      sc(
        "week-8-personal-ai-iot-q2",
        "Which is a personal IoT use?",
        [
          "A fitness watch sharing activity data with the wearer's phone",
          "A company tracking every delivery van for logistics only",
          "A marketing team scheduling ad campaigns",
          "A serverless function processing studio reward events"
        ],
        "a",
        "Correct. Wearables for personal health or fitness are personal IoT uses.",
        "Not quite. Personal IoT is about an individual's connected devices."
      )
    ],
    5
  ),
  activity(
    "week-8-personal-cloud-vr-ar",
    "Personal uses: cloud, VR and AR",
    "Outline personal cloud storage/apps and immersive entertainment or navigation uses.",
    "Teaching",
    [
      heading("week-8-personal-cloud-vr-ar-h", "Personal uses: cloud, VR and AR"),
      para(
        "week-8-personal-cloud-vr-ar-p1",
        "Personal cloud computing uses include storing photos, backing up phone files and opening apps through a browser or client."
      ),
      para(
        "week-8-personal-cloud-vr-ar-p2",
        "Personal VR uses include immersive games and experiences. Personal AR uses include navigation overlays or interactive filters that add digital information to the real world."
      ),
      sc(
        "week-8-personal-cloud-vr-ar-q1",
        "Which is a personal cloud use?",
        [
          "Backing up personal photos so they can be opened on another device",
          "Hosting Pixel Forge's entire multiplayer backend for all players",
          "Linking three studios with SD-WAN only",
          "Inspecting a roof with a drone for a client"
        ],
        "a",
        "Correct. Personal backups and file access are cloud uses for individuals.",
        "Not quite. Focus on an individual's storage or apps."
      ),
      sc(
        "week-8-personal-cloud-vr-ar-q2",
        "Which pair correctly matches a personal use?",
        [
          "VR for immersive home gaming; AR for street navigation overlays",
          "VR only for printing plastic; AR only for office WAN routing",
          "VR and AR only for unpaid staff rotas",
          "VR means social media passwords"
        ],
        "a",
        "Correct. Gaming and navigation are clear personal immersive uses.",
        "Not quite. Match VR/AR to everyday individual experiences."
      )
    ],
    5
  ),
  activity(
    "week-8-personal-5g-media",
    "Personal uses: 5G, social media and vlogs",
    "Explain personal mobile connectivity and content creation/communication uses.",
    "Teaching",
    [
      heading("week-8-personal-5g-media-h", "Personal uses: 5G, social media and vlogs"),
      para(
        "week-8-personal-5g-media-p1",
        "Personal 5G uses include faster mobile communication and smoother cloud gaming on a phone when coverage and conditions allow."
      ),
      para(
        "week-8-personal-5g-media-p2",
        "Personal social media and vlog uses include chatting with friends, following creators and making video diaries for a hobby audience."
      ),
      sc(
        "week-8-personal-5g-media-q1",
        "Which is a personal 5G use?",
        [
          "Playing a cloud game on a phone while travelling, where 5G coverage is good",
          "A studio using SD-WAN to link finance and art offices",
          "A warehouse IoT system counting pallets",
          "A company blockchain for supply-chain records"
        ],
        "a",
        "Correct. Mobile cloud gaming/communication for an individual is a personal 5G use.",
        "Not quite. Look for an individual's mobile connectivity benefit."
      ),
      sc(
        "week-8-personal-5g-media-q2",
        "Which is mainly personal media use?",
        [
          "A learner posts a hobby vlog about their weekend projects",
          "Pixel Forge's marketing team running a paid launch campaign",
          "Customer support analysing ticket trends with AI",
          "Drones inspecting company buildings on a contract"
        ],
        "a",
        "Correct. A personal hobby vlog is individual use.",
        "Not quite. Business marketing and operations are not personal use."
      )
    ],
    4
  ),
  activity(
    "week-8-personal-apply",
    "Apply: explain a personal use",
    "Write a short explanation of one personal technology use.",
    "Application",
    [
      heading("week-8-personal-apply-h", "Apply: explain a personal use"),
      para(
        "week-8-personal-apply-p",
        "Name the technology, say what it is used for, and who benefits (the individual)."
      ),
      short(
        "week-8-personal-apply-q",
        "Choose one emerging technology. Explain one personal use in plain English.",
        "A satisfactory answer names the technology, states a clear personal purpose (for example backup, fitness tracking, home gaming or hobby vlogs), and shows it is for an individual. Write at least 200 characters."
      )
    ],
    6
  ),

  activity(
    "week-8-business-ai-iot-cloud",
    "Business uses: AI, IoT and cloud",
    "Explain organisational uses for support, monitoring and collaboration.",
    "Teaching",
    [
      heading("week-8-business-ai-iot-cloud-h", "Business uses: AI, IoT and cloud"),
      para(
        "week-8-business-ai-iot-cloud-p1",
        "Business AI uses include customer support chat tools and data analysis that helps teams spot patterns in sales or player behaviour."
      ),
      para(
        "week-8-business-ai-iot-cloud-p2",
        "Business IoT uses include monitoring assets and tracking equipment or shipments. Business cloud uses include team collaboration, hosting services and secure backups."
      ),
      callout(
        "week-8-business-ai-iot-cloud-c",
        "Pixel Forge example",
        "Support staff can use AI-assisted replies, while cloud tools host builds and let remote artists share files."
      ),
      sc(
        "week-8-business-ai-iot-cloud-q1",
        "Which is a business AI use?",
        [
          "Analysing support tickets to find common player problems",
          "A person asking a home assistant for a joke",
          "A student backing up holiday photos only",
          "A hobby fitness watch with no workplace role"
        ],
        "a",
        "Correct. Ticket analysis supports the organisation's customer service.",
        "Not quite. Business use serves organisational goals."
      ),
      sc(
        "week-8-business-ai-iot-cloud-q2",
        "Which is a business cloud use for Pixel Forge?",
        [
          "Remote teams collaborating on shared project files hosted online",
          "Only one person storing private holiday videos",
          "A home smart bulb with no studio link",
          "A personal AR filter for a birthday party"
        ],
        "a",
        "Correct. Collaboration and hosted files are business cloud uses.",
        "Not quite. Look for organisational teamwork or hosting."
      )
    ],
    5
  ),
  activity(
    "week-8-business-immersive-drones",
    "Business uses: VR, AR and drones",
    "Outline training, demos, development and promotional/inspection uses.",
    "Teaching",
    [
      heading("week-8-business-immersive-drones-h", "Business uses: VR, AR and drones"),
      para(
        "week-8-business-immersive-drones-p1",
        "Business VR/AR uses include staff training, product demonstrations and game development reviews where teams test immersive scenes."
      ),
      para(
        "week-8-business-immersive-drones-p2",
        "Business drone uses include photography, site inspections and promotional aerial content when permissions allow."
      ),
      sc(
        "week-8-business-immersive-drones-q1",
        "Which is a business VR or AR use?",
        [
          "Training new Pixel Forge staff in a safe virtual practice space",
          "Only a player using VR for weekend leisure with no studio goal",
          "A personal step-count wearable",
          "A hobby vlog about cooking"
        ],
        "a",
        "Correct. Staff training serves the business.",
        "Not quite. Business immersive uses support work such as training or demos."
      ),
      sc(
        "week-8-business-immersive-drones-q2",
        "Which is a business drone use?",
        [
          "Filming aerial shots for a Pixel Forge launch trailer with permission",
          "A neighbour flying over private gardens for no authorised reason",
          "A personal cloud photo album only",
          "A home AI playlist recommendation only"
        ],
        "a",
        "Correct. Authorised promotional filming supports marketing.",
        "Not quite. Choose a responsible organisational filming or inspection use."
      )
    ],
    5
  ),
  activity(
    "week-8-business-media-chain-serverless",
    "Business uses: social media, blockchain and serverless",
    "Explain marketing, records and event-driven application uses.",
    "Teaching",
    [
      heading("week-8-business-media-chain-serverless-h", "Business uses: social media, blockchain and serverless"),
      para(
        "week-8-business-media-chain-serverless-p1",
        "Business social media uses include marketing and customer engagement: trailers, announcements and replies to players."
      ),
      para(
        "week-8-business-media-chain-serverless-p2",
        "Business blockchain uses can include transaction records or digital asset ownership history. Serverless computing can run event-driven tasks, such as processing a reward when a player completes a challenge, without the team managing every server day to day."
      ),
      sc(
        "week-8-business-media-chain-serverless-q1",
        "Which is a business social media use?",
        [
          "Posting a trailer and answering player comments on launch day",
          "A learner chatting with friends about a hobby only",
          "A personal holiday photo backup only",
          "A home thermostat schedule only"
        ],
        "a",
        "Correct. Marketing and engagement are business social media uses.",
        "Not quite. Look for organisational marketing or support communication."
      ),
      sc(
        "week-8-business-media-chain-serverless-q2",
        "Which statement correctly explains a business serverless use?",
        [
          "Running short event-driven code when players unlock rewards, without managing individual servers day to day",
          "Deleting every cloud service forever",
          "Using serverless as another name for a paper form",
          "Using serverless only to water house plants"
        ],
        "a",
        "Correct. Event-driven studio tasks are a clear business serverless use.",
        "Not quite. Focus on organisational event code and reduced server management."
      )
    ],
    5
  ),
  activity(
    "week-8-business-apply",
    "Apply: explain a business use",
    "Write a short explanation of one business technology use for Pixel Forge.",
    "Application",
    [
      heading("week-8-business-apply-h", "Apply: explain a business use"),
      para(
        "week-8-business-apply-p",
        "Name the technology, explain the organisational purpose, and link it to Pixel Forge where you can."
      ),
      short(
        "week-8-business-apply-q",
        "Choose one emerging technology. Explain one business use for Pixel Forge Games.",
        "A satisfactory answer names the technology, states a clear studio purpose (for example support, marketing, collaboration, analytics, training or multiplayer hosting) and shows it helps the organisation. Write at least 200 characters."
      )
    ],
    6
  ),

  activity(
    "week-8-classify-context",
    "Classify personal, business or both",
    "Sort application examples by context.",
    "Classification",
    [
      heading("week-8-classify-context-h", "Classify personal, business or both"),
      para(
        "week-8-classify-context-p",
        "Ask who benefits and why. Some examples clearly serve both contexts."
      ),
      classify(
        "week-8-classify-context-q",
        "Sort each example as Personal, Business or Both.",
        [
          { id: "personal", label: "Personal" },
          { id: "business", label: "Business" },
          { id: "both", label: "Both" }
        ],
        [
          {
            id: "x1",
            text: "A player uses AR filters for fun on their own phone",
            correctCategoryId: "personal"
          },
          {
            id: "x2",
            text: "Pixel Forge analyses game telemetry to balance a level",
            correctCategoryId: "business"
          },
          {
            id: "x3",
            text: "Cloud storage used by a hobbyist at home and by the studio for project backups",
            correctCategoryId: "both"
          },
          {
            id: "x4",
            text: "Support staff use AI suggestions while answering tickets",
            correctCategoryId: "business"
          },
          {
            id: "x5",
            text: "A learner watches VR demos for leisure and later the studio uses VR for staff training",
            correctCategoryId: "both"
          }
        ],
        {
          correct:
            "Well sorted. Individual leisure is personal; studio operations are business; shared technology patterns can be both.",
          incorrect:
            "Not quite. Decide whether the purpose serves an individual, the organisation, or clearly both."
        }
      )
    ],
    6
  ),
  activity(
    "week-8-match-apps",
    "Match technology to application",
    "Match technologies to personal or business application statements.",
    "Classification",
    [
      heading("week-8-match-apps-h", "Match technology to application"),
      para(
        "week-8-match-apps-p",
        "Read the use carefully. Match the technology that best fits the described application."
      ),
      classify(
        "week-8-match-apps-q",
        "Match each application to the most suitable technology.",
        [
          { id: "ai", label: "AI" },
          { id: "iot", label: "IoT" },
          { id: "cloud", label: "Cloud computing" },
          { id: "vr", label: "VR" },
          { id: "social", label: "Social media" },
          { id: "serverless", label: "Serverless computing" }
        ],
        [
          {
            id: "m1",
            text: "Suggesting in-game tips to a player based on how they play",
            correctCategoryId: "ai"
          },
          {
            id: "m2",
            text: "Monitoring connected studio hardware sensors for status alerts",
            correctCategoryId: "iot"
          },
          {
            id: "m3",
            text: "Hosting shared build files for remote artists",
            correctCategoryId: "cloud"
          },
          {
            id: "m4",
            text: "Letting a trainee practise a safety drill inside a headset world",
            correctCategoryId: "vr"
          },
          {
            id: "m5",
            text: "Posting a launch trailer and replying to player comments",
            correctCategoryId: "social"
          },
          {
            id: "m6",
            text: "Running a short function when a player claims an event reward",
            correctCategoryId: "serverless"
          }
        ],
        {
          correct:
            "Well matched. Each application points to a clear technology use rather than only a name label.",
          incorrect:
            "Not quite. Match the job being done: recommend, monitor, host, immerse, engage, or run event code."
        }
      )
    ],
    7
  ),

  activity(
    "week-8-pf-dev-support",
    "Pixel Forge: development, testing and support",
    "Explain technology uses for building games and helping players.",
    "Teaching",
    [
      heading("week-8-pf-dev-support-h", "Pixel Forge: development, testing and support"),
      para(
        "week-8-pf-dev-support-p1",
        "During development and testing, cloud collaboration helps share builds. VR/AR can support immersive playtests. AI can help triage bug reports."
      ),
      para(
        "week-8-pf-dev-support-p2",
        "For player support, AI-assisted tools can suggest answers, while social media and help desks collect feedback. The AC2.1 skill is explaining the use, not listing tool brands."
      ),
      sc(
        "week-8-pf-dev-support-q1",
        "How might cloud computing help Pixel Forge development?",
        [
          "By letting remote teammates share and back up project files online",
          "By replacing every playtest with a paper letter only",
          "By removing the need for any game design",
          "By turning off all player accounts automatically"
        ],
        "a",
        "Correct. Collaboration and backups are clear development uses.",
        "Not quite. Focus on shared files and teamwork."
      ),
      sc(
        "week-8-pf-dev-support-q2",
        "How might AI help player support?",
        [
          "By analysing common questions and suggesting helpful replies for staff",
          "By flying a drone instead of answering tickets",
          "By deleting all feedback forever",
          "By replacing 5G coverage maps with paper only"
        ],
        "a",
        "Correct. Support analysis and suggested replies are business AI uses.",
        "Not quite. Link AI to understanding and answering player needs."
      )
    ],
    5
  ),
  activity(
    "week-8-pf-multiplayer-marketing",
    "Pixel Forge: multiplayer, marketing and analytics",
    "Explain uses for online services, promotion and understanding players.",
    "Teaching",
    [
      heading("week-8-pf-multiplayer-marketing-h", "Pixel Forge: multiplayer, marketing and analytics"),
      para(
        "week-8-pf-multiplayer-marketing-p1",
        "Online multiplayer often relies on cloud hosting and strong mobile or broadband links (including 5G for players on the move). Serverless functions can handle spikes such as reward claims."
      ),
      para(
        "week-8-pf-multiplayer-marketing-p2",
        "Marketing uses social media and sometimes drone or video content. Game analytics may use AI or data tools to understand how players behave so the team can improve the experience."
      ),
      sc(
        "week-8-pf-multiplayer-marketing-q1",
        "Which explanation best describes a multiplayer-related use?",
        [
          "Cloud hosting keeps multiplayer services available to many players at once",
          "Multiplayer only works on paper leaderboards",
          "Marketing posts replace the need for any servers",
          "Analytics means deleting all player feedback"
        ],
        "a",
        "Correct. Hosting capacity is a clear business cloud use for multiplayer.",
        "Not quite. Think about how online services stay available."
      ),
      sc(
        "week-8-pf-multiplayer-marketing-q2",
        "How can social media and analytics work together for Pixel Forge?",
        [
          "Social posts promote the game; analytics helps the team understand player behaviour and responses",
          "Analytics removes the need for any marketing",
          "Social media cannot collect any public comments",
          "Both tools only exist for home lighting"
        ],
        "a",
        "Correct. Promotion and insight are complementary business uses.",
        "Not quite. Separate the marketing use from the insight use, then link them."
      )
    ],
    5
  ),
  activity(
    "week-8-pf-scenarios",
    "Pixel Forge scenarios: explain the use",
    "Choose the best explanation of how technology is used in studio situations.",
    "Application",
    [
      heading("week-8-pf-scenarios-h", "Pixel Forge scenarios: explain the use"),
      para(
        "week-8-pf-scenarios-p",
        "Do not stop at the technology name. Pick the answer that best explains the purpose."
      ),
      sc(
        "week-8-pf-scenarios-q1",
        "Remote artists need to edit the same concept pack. Which explanation is best?",
        [
          "Cloud collaboration lets the team open and update shared files from different locations",
          "Cloud collaboration means printing every sketch on paper overnight",
          "Cloud collaboration deletes SD-WAN forever",
          "Cloud collaboration is only a personal fitness tracker"
        ],
        "a",
        "Correct. The use is shared remote access to project files.",
        "Not quite. Explain the collaboration purpose."
      ),
      sc(
        "week-8-pf-scenarios-q2",
        "Players report the same login bug repeatedly. Which use fits best?",
        [
          "AI-assisted analysis groups similar tickets so support can respond faster",
          "A drone must film the bug outdoors",
          "A vlog must replace the help desk completely",
          "IPv6 alone writes the patch notes"
        ],
        "a",
        "Correct. The use is spotting patterns in support work.",
        "Not quite. Link AI to understanding repeated player issues."
      ),
      sc(
        "week-8-pf-scenarios-q3",
        "Marketing wants community excitement before launch. Which use fits best?",
        [
          "Social media posts share trailers and invite comments from players",
          "Blockchain must replace every trailer",
          "IoT fridge sensors must write the script",
          "Personal step counts must approve the budget"
        ],
        "a",
        "Correct. The use is marketing and engagement.",
        "Not quite. Focus on promotion and player conversation."
      ),
      sc(
        "week-8-pf-scenarios-q4",
        "A seasonal event triggers many reward claims at once. Which use fits best?",
        [
          "Serverless functions can scale short reward tasks as claims arrive",
          "A personal AR birthday filter must process every claim",
          "A hobby vlog must host the multiplayer servers",
          "A home thermostat must balance the game economy"
        ],
        "a",
        "Correct. The use is event-driven processing for the studio service.",
        "Not quite. Match serverless computing to spiky event tasks."
      )
    ],
    6
  ),


  activity(
    "week-8-remote-feedback",
    "Pixel Forge: remote teamwork and player feedback",
    "Explain cloud and social/AI uses for remote work and listening to players.",
    "Teaching",
    [
      heading("week-8-remote-feedback-h", "Pixel Forge: remote teamwork and player feedback"),
      para(
        "week-8-remote-feedback-p1",
        "Remote teamwork often uses cloud applications for calls, documents and shared storage so staff in different places can work together."
      ),
      para(
        "week-8-remote-feedback-p2",
        "Player feedback can arrive through social media comments, surveys or support tickets. AI tools may help group similar comments so the team can respond and improve the game."
      ),
      sc(
        "week-8-remote-feedback-q1",
        "How does cloud computing support remote teamwork?",
        [
          "Staff can open shared files and collaborate online from different locations",
          "Remote teamwork never needs any digital tools",
          "Cloud means only flying drones outdoors",
          "Cloud deletes all player feedback"
        ],
        "a",
        "Correct. Shared online access is the business use.",
        "Not quite. Focus on collaboration across locations."
      ),
      sc(
        "week-8-remote-feedback-q2",
        "Which explanation best describes a feedback use?",
        [
          "Social channels collect player comments; AI can help group common themes for the studio",
          "Feedback must be ignored to finish AC2.1",
          "Feedback only means printing random posters",
          "Feedback replaces electricity"
        ],
        "a",
        "Correct. Collecting and making sense of comments are business uses.",
        "Not quite. Link listening channels to understanding players."
      )
    ],
    4
  ),
  activity(
    "week-8-choose-fit",
    "Choose a technology for a need",
    "Practise selecting a suitable technology and explaining why it fits.",
    "Application",
    [
      heading("week-8-choose-fit-h", "Choose a technology for a need"),
      para(
        "week-8-choose-fit-p",
        "Read the need, pick a suitable technology, and favour the answer that explains the use."
      ),
      sc(
        "week-8-choose-fit-q1",
        "Need: show a rare cape's ownership history to players. Best explained fit?",
        [
          "Blockchain can record the ownership history of the digital item",
          "A home light bulb should store ownership forever",
          "A personal step count should approve ownership",
          "A paper plane should host the marketplace"
        ],
        "a",
        "Correct. The use is maintaining a shared ownership record.",
        "Not quite. Match digital ownership history to blockchain."
      ),
      sc(
        "week-8-choose-fit-q2",
        "Need: train staff safely before using a complex demo booth. Best explained fit?",
        [
          "VR can provide a safe immersive practice space before the live demo",
          "A hobby playlist should replace training",
          "IPv6 alone teaches booth safety",
          "A social media like button is enough training"
        ],
        "a",
        "Correct. The use is safe practice through immersion.",
        "Not quite. Link VR to training."
      ),
      sc(
        "week-8-choose-fit-q3",
        "Need: send launch updates and reply to excited players quickly. Best explained fit?",
        [
          "Social media supports fast marketing updates and customer engagement",
          "A warehouse IoT sensor should write every reply",
          "A personal fridge camera should run the campaign",
          "SD-WAN alone writes trailer scripts"
        ],
        "a",
        "Correct. The use is promotion and engagement.",
        "Not quite. Match community updates to social media."
      )
    ],
    5
  ),
  activity(
    "week-8-both-contexts",
    "When a use can be both",
    "Show how some applications sit in both personal and business contexts.",
    "Teaching",
    [
      heading("week-8-both-contexts-h", "When a use can be both"),
      para(
        "week-8-both-contexts-p1",
        "Some technologies appear in both contexts. Cloud storage can hold a learner's homework and also Pixel Forge project backups. AR can guide a tourist and also label a demo booth for staff."
      ),
      para(
        "week-8-both-contexts-p2",
        "For AC2.1, say clearly which purpose you mean. If both apply, give one personal example and one business example."
      ),
      sc(
        "week-8-both-contexts-q1",
        "Which statement shows both contexts for AR?",
        [
          "Personal: navigation overlays while walking; business: interactive labels on a Pixel Forge demo booth",
          "AR can never be described in two contexts",
          "AR only means blockchain",
          "AR only means paper posters"
        ],
        "a",
        "Correct. Two clear purposes show both contexts.",
        "Not quite. Give one individual purpose and one organisational purpose."
      ),
      sc(
        "week-8-both-contexts-q2",
        "Why should learners label the context?",
        [
          "So the examiner can see whether the use is personal, business, or intentionally both",
          "Because AC2.1 forbids examples",
          "Because technologies have no users",
          "Because context never matters"
        ],
        "a",
        "Correct. Clear context makes the use explanation stronger.",
        "Not quite. Context tells the reader who the use is for."
      )
    ],
    4
  ),
  activity(
    "week-8-compare",
    "Compare the same technology in two contexts",
    "Practise comparing personal and business applications of one technology.",
    "Knowledge check",
    [
      heading("week-8-compare-h", "Compare the same technology in two contexts"),
      para(
        "week-8-compare-p",
        "Good AC2.1 answers name the technology, state each use, and say how the purpose differs."
      ),
      sc(
        "week-8-compare-q1",
        "Which comparison of AI is best?",
        [
          "Personal: playlist recommendations; business: analysing support tickets for Pixel Forge",
          "Personal and business AI uses are impossible to describe",
          "AI only exists for printing plastic",
          "AI means the same as a drone battery"
        ],
        "a",
        "Correct. Same technology, different purposes.",
        "Not quite. Give one personal purpose and one business purpose."
      ),
      sc(
        "week-8-compare-q2",
        "Which comparison of cloud computing is best?",
        [
          "Personal: backing up phone photos; business: hosting shared studio builds",
          "Cloud only works for paper filing",
          "Cloud cannot store any files",
          "Cloud is identical to a UAV"
        ],
        "a",
        "Correct. Individual backup versus organisational hosting/collaboration.",
        "Not quite. Contrast personal storage with business collaboration or hosting."
      ),
      sc(
        "week-8-compare-q3",
        "A learner says VR is only for fun. What should they add for AC2.1?",
        [
          "A business example such as staff training or immersive product demos",
          "Nothing: one use is always enough for every criterion",
          "A full AC2.2 cost spreadsheet only",
          "A claim that VR never has business uses"
        ],
        "a",
        "Correct. Showing another context strengthens the personal/business comparison.",
        "Not quite. Add a clear organisational use."
      ),
      sc(
        "week-8-compare-q4",
        "Which choice best fits a studio that needs both community updates and ownership history of a rare digital item?",
        [
          "Social media for updates; blockchain for the item ownership record",
          "Only a home light bulb for both jobs",
          "Only a paper map for both jobs",
          "Only a fitness watch for both jobs"
        ],
        "a",
        "Correct. Different needs can require different technologies.",
        "Not quite. Match each need to a suitable technology use."
      )
    ],
    6
  ),
  activity(
    "week-8-compare-write",
    "Write: compare personal and business uses",
    "Explain one technology in both personal and business contexts.",
    "Application",
    [
      heading("week-8-compare-write-h", "Write: compare personal and business uses"),
      para(
        "week-8-compare-write-p",
        "Choose one technology. Give one personal use and one Pixel Forge business use."
      ),
      short(
        "week-8-compare-write-q",
        "Choose one emerging technology. Explain one personal use and one business use. Say how the purposes differ.",
        "A satisfactory answer names one technology, gives a clear personal use, a clear business use (Pixel Forge where possible), and a short contrast of purpose. Write at least 200 characters."
      )
    ],
    7
  ),

  activity(
    "week-8-knowledge-check",
    "Knowledge check: personal and business uses",
    "Check AC2.1 understanding of uses and contexts.",
    "Knowledge check",
    [
      heading("week-8-kc-h", "Knowledge check: personal and business uses"),
      sc(
        "week-8-kc-q1",
        "Which statement best describes AC2.1 practice this week?",
        [
          "Explain how emerging technologies are used personally and in business",
          "Only rename technologies without any uses",
          "Only calculate investment returns for AC2.2",
          "Only list cable colours"
        ],
        "a",
        "Correct. Uses in two contexts are the focus.",
        "Not quite. Stay with explaining applications."
      ),
      sc(
        "week-8-kc-q2",
        "Which example is business use of IoT?",
        [
          "Tracking studio equipment status with connected sensors",
          "A personal step-count watch used only for a hobby run",
          "A hobby AR filter at a party",
          "A personal cloud album of holiday photos"
        ],
        "a",
        "Correct. Asset monitoring serves the organisation.",
        "Not quite. Business IoT supports organisational monitoring or tracking."
      ),
      sc(
        "week-8-kc-q3",
        "Which answer explains a use rather than only naming a technology?",
        [
          "5G can support smoother mobile cloud gaming for a player on a train",
          "5G",
          "Technology",
          "Emerging"
        ],
        "a",
        "Correct. The sentence states what 5G is used for.",
        "Not quite. AC2.1 needs the purpose, not only the label."
      ),
      sc(
        "week-8-kc-q4",
        "Why can the same technology be personal and business?",
        [
          "Because the purpose and user context can change even when the technology type stays the same",
          "Because technologies never have purposes",
          "Because AC2.1 forbids examples",
          "Because personal and business always mean identical tasks"
        ],
        "a",
        "Correct. Context and purpose drive the classification.",
        "Not quite. Think about who uses it and why."
      ),
      sc(
        "week-8-kc-q5",
        "Which Pixel Forge example is mainly marketing use?",
        [
          "Publishing trailers and updates on social media to attract players",
          "Backing up one artist's private holiday photos only",
          "A learner's home smart speaker playlist only",
          "A personal VR film night with no studio goal"
        ],
        "a",
        "Correct. Trailers and updates support business promotion.",
        "Not quite. Marketing serves organisational reach and engagement."
      )
    ],
    6
  ),
  activity(
    "week-8-knowledge-check-b",
    "Knowledge check: choose a suitable use",
    "Select appropriate technologies for stated needs without AC2.2 depth.",
    "Knowledge check",
    [
      heading("week-8-kcb-h", "Knowledge check: choose a suitable use"),
      sc(
        "week-8-kcb-q1",
        "Need: help remote staff work on one design pack. Best fit?",
        [
          "Cloud collaboration and shared storage",
          "A personal fitness wearable only",
          "A hobby cooking vlog only",
          "Ignoring all file sharing"
        ],
        "a",
        "Correct. Shared online files support remote teamwork.",
        "Not quite. Match the need to collaboration."
      ),
      sc(
        "week-8-kcb-q2",
        "Need: understand how players move through a tutorial. Best fit?",
        [
          "Game analytics, possibly supported by AI pattern analysis",
          "A drone flight with no data plan",
          "A paper map locked in a drawer forever",
          "Turning off all feedback channels"
        ],
        "a",
        "Correct. Analytics explains player behaviour for the business.",
        "Not quite. Look for insight into player actions."
      ),
      sc(
        "week-8-kcb-q3",
        "Need: record ownership history of a limited digital cape. Best fit?",
        [
          "Blockchain record-keeping for that digital asset",
          "A home thermostat schedule",
          "A personal step goal",
          "A paper airplane"
        ],
        "a",
        "Correct. Ownership history is a business blockchain-style use.",
        "Not quite. Match records of digital ownership."
      ),
      sc(
        "week-8-kcb-q4",
        "Which response is too shallow for AC2.1?",
        [
          "Writing only the word \"cloud\" with no explanation of the use",
          "Explaining that cloud hosting keeps multiplayer available to players",
          "Comparing personal photo backup with studio file collaboration",
          "Describing AI ticket analysis for support staff"
        ],
        "a",
        "Correct. A bare name is not enough; explain the use.",
        "Not quite. AC2.1 needs purpose and context."
      )
    ],
    5
  ),
  activity(
    "week-8-reflection",
    "Extension: personal vs business profile",
    "Optional homework: profile one technology across personal and business uses.",
    "Extension",
    [
      heading("week-8-ref-h", "Extension: personal vs business profile"),
      para(
        "week-8-ref-p",
        "Optional homework: choose one emerging technology and prepare a short AC2.1-style profile. This is formative, not Gateway assignment evidence."
      ),
      reflection(
        "week-8-ref-q",
        "Choose one emerging technology. Explain one personal use, one Pixel Forge business use, how the purposes differ, and one reason the business use helps players or the studio.",
        500,
        "Sentence starters: The technology I chose is... A personal use is... A business use at Pixel Forge is... The purposes differ because... This helps because... Write at least 500 characters. Paste is disabled."
      )
    ],
    13
  ),
  activity(
    "week-8-exit",
    "Exit ticket",
    "Quick check that learners can explain personal and business uses for AC2.1.",
    "Exit ticket",
    [
      heading("week-8-exit-h", "Exit ticket"),
      sc(
        "week-8-exit-q1",
        "Which short summary is correct?",
        [
          "Personal use serves individuals; business use serves organisations; the same technology can do both when the purpose changes; AC2.1 needs clear explanations of those uses",
          "AC2.1 only means listing technology names with no uses",
          "Personal and business uses are impossible to compare",
          "Pixel Forge never uses any emerging technology"
        ],
        "a",
        "Correct. That summary captures this week's AC2.1 focus.",
        "Not quite. Keep uses and contexts clear."
      ),
      para(
        "week-8-exit-p",
        "Tell your tutor how confident you feel explaining personal and business uses of emerging technologies."
      )
    ],
    2
  )
];

const activityIds = week8Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const existing = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek8 = existing.filter((item) => !String(item.id || "").startsWith("week-8-"));
fs.writeFileSync(activitiesPath, `${JSON.stringify([...withoutWeek8, ...week8Activities], null, 2)}\n`);

const sessionsPath = path.join(ROOT, "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8")).filter((item) => item.id !== "week-8-session");
sessions.push(
  envelope(
    "lp.content.session",
    "week-8-session",
    "0.1.0",
    {
      title: "Week 8 session",
      kind: "session",
      summary:
        "One 1.5-hour session: personal and business uses of emerging technologies, Pixel Forge scenarios and AC2.1 practice.",
      sortOrder: 1,
      defaultOpen: true,
      status: "available"
    },
    { week: "week-8", activities: activityIds }
  )
);
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

const weeksPath = path.join(ROOT, "weeks.json");
const weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8")).filter((item) => item.id !== "week-8");
weeks.push(
  envelope(
    "lp.content.week",
    "week-8",
    "0.1.0",
    {
      teachingWeek: 8,
      title: "Personal and Business Uses of Emerging Technologies",
      status: "planned",
      professionalPractice: "LO2 / AC 2.1 - explain personal and business uses of emerging technologies",
      route: "week-8/"
    },
    {
      curriculum: "l2e-exploring-emerging-digital-technologies-curriculum",
      learningOutcomes: ["lo2"],
      assignment: "formative-practice",
      sessions: ["week-8-session"]
    }
  )
);
fs.writeFileSync(weeksPath, `${JSON.stringify(weeks, null, 2)}\n`);

const curriculumPath = path.join(ROOT, "curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));
if (!curriculum.relationships.weeks.includes("week-8")) curriculum.relationships.weeks.push("week-8");
fs.writeFileSync(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`);

const pkg = content.loadPackageSync(ROOT, {
  readText: (filePath) => fs.readFileSync(filePath, "utf8"),
  joinPath: (...parts) => path.join(...parts),
  fileExists: (filePath) => fs.existsSync(filePath)
});
const validation = content.validatePackage(pkg);
if (!validation.valid) {
  console.error(content.formatIssues(validation.issues));
  process.exit(1);
}
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

const typeCounts = {};
let questionBlocks = 0;
for (const act of week8Activities) {
  for (const b of act.blocks) {
    if (["single-choice", "classification", "short-response", "reflection"].includes(b.type)) {
      typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
      questionBlocks += 1;
    }
  }
}

console.log(
  JSON.stringify(
    {
      activities: activityIds.length,
      questionBlocks,
      types: typeCounts,
      ids: activityIds
    },
    null,
    2
  )
);
