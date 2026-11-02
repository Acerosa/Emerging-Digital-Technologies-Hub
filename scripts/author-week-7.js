#!/usr/bin/env node
"use strict";

/**
 * Author Week 7: Drones, social media, vlogs and AC1.1 consolidation.
 * Regenerates week-7 activities, session, week row and package.json.
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
      learningOutcomes: ["lo1"],
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

const week7Activities = [
  activity(
    "week-7-starter",
    "Welcome to Week 7",
    "Recap Week 6 ideas, then set the focus for drones, social media, vlogs and AC1.1 consolidation.",
    "Starter",
    [
      heading("week-7-starter-h", "Welcome to Week 7"),
      para(
        "week-7-starter-p1",
        "This week you outline drones, social media and vlogs. You then consolidate emerging technologies from Weeks 1 to 6 for Assessment Criterion (AC) 1.1."
      ),
      callout(
        "week-7-starter-c",
        "By the end of this week",
        "You will be able to say what drones, social media and vlogs are, give practical uses for each, and match earlier technologies to simple real-world examples. This is the last teaching week focused on AC1.1 before later learning outcomes."
      ),
      para(
        "week-7-starter-p2",
        "Quick check from Week 6: 5G is fifth-generation mobile network technology. IPv6 (Internet Protocol version 6) mainly expands IP addresses. Blockchain records linked shared history. Serverless computing still uses servers, but the provider manages much of the infrastructure. SD-WAN (Software-Defined Wide Area Network) manages links between sites."
      ),
      sc(
        "week-7-starter-q1",
        "Which statement from Week 6 is correct?",
        [
          "Serverless computing means no computers exist anywhere",
          "IPv6 mainly provides a much larger address space; it is not simply a faster internet",
          "SD-WAN deletes the need for any network security",
          "5G only works on paper maps"
        ],
        "b",
        "Correct. IPv6 is mainly about address space, not a guaranteed speed boost.",
        "Not quite. Keep the Week 6 outlines in mind. IPv6 expands addresses. Serverless still uses servers."
      ),
      sc(
        "week-7-starter-q2",
        "What will you focus on this week for AC1.1?",
        [
          "Only spreadsheet formulas and paper filing",
          "Drones, social media, vlogs, then consolidation of emerging technologies from earlier weeks",
          "Only AC2.2 cost tables with no technology outlines",
          "Only repairing physical network cables"
        ],
        "b",
        "Correct. This week adds three technologies and consolidates AC1.1 ideas from Weeks 1 to 6.",
        "Not quite. Read the welcome text again."
      )
    ],
    5
  ),
  activity(
    "week-7-recap-connect",
    "Linking earlier technologies",
    "Connect networks, cloud, AI and media ideas to this week's drones, social media and vlogs.",
    "Teaching",
    [
      heading("week-7-recap-connect-h", "Linking earlier technologies"),
      para(
        "week-7-recap-connect-p1",
        "Drones can use cameras, sensors and wireless links. Social media and vlogs often run on cloud services and mobile networks. Artificial Intelligence (AI) may help recommend posts or edit video."
      ),
      para(
        "week-7-recap-connect-p2",
        "Pixel Forge Games already uses trailers, community posts and behind-the-scenes video. This week helps you outline those media tools alongside drones for promotional aerial clips."
      ),
      sc(
        "week-7-recap-connect-q1",
        "Which statement is most accurate?",
        [
          "Drones, social media and vlogs never use any earlier digital technologies",
          "These technologies often combine cameras, networks, cloud services and software ideas you already know",
          "Cloud computing only works with paper letters",
          "AI recommendations are identical to 3D printing"
        ],
        "b",
        "Correct. New tools usually build on networks, devices and software you have already met.",
        "Not quite. Think about how media and drones use cameras, networks and cloud services."
      ),
      sc(
        "week-7-recap-connect-q2",
        "Why might Pixel Forge care about this week?",
        [
          "Promotional footage, announcements and development diaries support player engagement",
          "Games never use video or online communities",
          "AC1.1 only covers printers",
          "Drones replace the need for any game design"
        ],
        "a",
        "Correct. Media and aerial clips can support marketing and community updates.",
        "Not quite. Focus on promotion and player communication."
      )
    ],
    4
  ),

  activity(
    "week-7-drone-intro",
    "What are drones?",
    "Define drones and Unmanned Aerial Vehicles (UAVs) in plain English.",
    "Teaching",
    [
      heading("week-7-drone-intro-h", "What are drones?"),
      para(
        "week-7-drone-intro-p1",
        "A drone is an aircraft that flies without a pilot on board. Many drones are also called Unmanned Aerial Vehicles (UAVs)."
      ),
      para(
        "week-7-drone-intro-p2",
        "People often control drones from the ground with a remote controller or an app. Some drones can follow set routes more independently. You do not need deep engineering detail for AC1.1. Focus on what they are and what they are used for."
      ),
      callout(
        "week-7-drone-intro-c",
        "Key term: UAV",
        "UAV means Unmanned Aerial Vehicle: an aircraft without a human pilot on board."
      ),
      sc(
        "week-7-drone-intro-q1",
        "What is a drone in this unit?",
        [
          "An aircraft that flies without a pilot on board",
          "A type of spreadsheet formula",
          "A paper newsletter only",
          "A blockchain wallet password"
        ],
        "a",
        "Correct. Drones are unmanned aircraft, often called UAVs.",
        "Not quite. Keep the outline simple: aircraft without a pilot on board."
      ),
      sc(
        "week-7-drone-intro-q2",
        "What does UAV stand for?",
        [
          "Unmanned Aerial Vehicle",
          "Ultra Audio Volume",
          "User Account Validation",
          "Urban Art Venue"
        ],
        "a",
        "Correct. UAV expands to Unmanned Aerial Vehicle.",
        "Not quite. Expand each letter: Unmanned Aerial Vehicle."
      )
    ],
    5
  ),
  activity(
    "week-7-drone-how",
    "How drones operate",
    "Outline cameras, sensors, remote control, and manual versus more autonomous flight.",
    "Teaching",
    [
      heading("week-7-drone-how-h", "How drones operate"),
      para(
        "week-7-drone-how-p1",
        "Many drones carry cameras or other sensors. Sensors collect information such as position, height or images. A remote control or mobile app lets an operator steer the drone."
      ),
      para(
        "week-7-drone-how-p2",
        "Some flights are mainly manual, with a person steering carefully. Other modes are more autonomous, where the drone follows a planned path or tracks a subject with less constant stick input. Either way, a responsible operator still plans the flight."
      ),
      sc(
        "week-7-drone-how-q1",
        "What do drone cameras and sensors mainly do?",
        [
          "Collect images or other flight and environment data",
          "Print plastic cases",
          "Replace the need for electricity",
          "Turn the drone into a spreadsheet"
        ],
        "a",
        "Correct. Cameras and sensors gather useful data during flight.",
        "Not quite. Think about collecting images and flight information."
      ),
      sc(
        "week-7-drone-how-q2",
        "Which statement is accurate?",
        [
          "Drones can be steered manually or follow more automated routes, depending on the mode and design",
          "Every drone always flies with no operator planning at all",
          "Remote control is never used with drones",
          "Autonomous always means the drone ignores all safety rules"
        ],
        "a",
        "Correct. Control can be more manual or more automated, but planning still matters.",
        "Not quite. Operators still plan flights even when some modes are assisted."
      )
    ],
    5
  ),
  activity(
    "week-7-drone-uses",
    "Where drones are used",
    "Outline practical drone applications including Pixel Forge promotional footage.",
    "Teaching",
    [
      heading("week-7-drone-uses-h", "Where drones are used"),
      para(
        "week-7-drone-uses-p1",
        "Drones are used for photography and film, delivery trials, agriculture surveys, inspections of roofs or towers, and some emergency-service views of hard-to-reach places."
      ),
      para(
        "week-7-drone-uses-p2",
        "Pixel Forge Games might use a drone to capture aerial footage of a launch event or outdoor promo shoot for a trailer, when rules and permissions allow it."
      ),
      sc(
        "week-7-drone-uses-q1",
        "Which is a practical drone use?",
        [
          "Inspecting a tall structure safely from the air",
          "Editing a spreadsheet with no camera",
          "Sending only paper post with no aircraft",
          "Turning off all wireless networks forever"
        ],
        "a",
        "Correct. Inspections and aerial views are common practical uses.",
        "Not quite. Look for an aerial imaging or survey-style use."
      ),
      sc(
        "week-7-drone-uses-q2",
        "How could Pixel Forge use a drone legally and carefully?",
        [
          "To film aerial promotional clips of an outdoor event when permissions allow",
          "To ignore all privacy rules near people's homes",
          "To replace every programmer with a flying camera",
          "To delete the need for any game art"
        ],
        "a",
        "Correct. Promotional aerial footage is a realistic studio use when done responsibly.",
        "Not quite. Focus on careful promotional filming, not rule-breaking."
      )
    ],
    5
  ),
  activity(
    "week-7-drone-limits",
    "Drone benefits, limits and safety",
    "Weigh advantages against safety, privacy and security considerations.",
    "Teaching",
    [
      heading("week-7-drone-limits-h", "Drone benefits, limits and safety"),
      para(
        "week-7-drone-limits-p1",
        "Benefits include useful aerial views, reaching difficult places, and capturing footage that would be hard from the ground. Limitations include battery life, weather, cost, training needs and flight rules."
      ),
      para(
        "week-7-drone-limits-p2",
        "Safety, privacy and security matter. Operators must avoid harming people or property, respect private spaces, and follow local laws. A flying camera can raise privacy concerns if used carelessly."
      ),
      sc(
        "week-7-drone-limits-q1",
        "Which pair correctly matches a benefit and a limitation?",
        [
          "Benefit: aerial views of hard-to-reach places; limitation: weather and battery life can restrict flights",
          "Benefit: unlimited flight with no rules; limitation: drones never carry cameras",
          "Benefit: no training ever needed; limitation: drones cannot fly outdoors",
          "Benefit: privacy is never a concern; limitation: images cannot be stored"
        ],
        "a",
        "Correct. Aerial access is useful; weather and batteries are real limits.",
        "Not quite. Pick a true benefit paired with a true limitation."
      ),
      sc(
        "week-7-drone-limits-q2",
        "Why do privacy and safety matter for drone use?",
        [
          "Careless flights can risk people, property or private spaces",
          "Privacy rules never apply to cameras",
          "Safety only matters for paper planes",
          "Drones cannot collect any images"
        ],
        "a",
        "Correct. Responsible use protects people and respects privacy.",
        "Not quite. Think about harm, private spaces and responsible filming."
      )
    ],
    5
  ),
  activity(
    "week-7-drone-apply",
    "Apply: a drone use for Pixel Forge",
    "Identify a suitable drone use and note one safety or privacy point.",
    "Application",
    [
      heading("week-7-drone-apply-h", "Apply: a drone use for Pixel Forge"),
      para(
        "week-7-drone-apply-p",
        "Choose a realistic promotional or filming use. Mention one safety or privacy point."
      ),
      short(
        "week-7-drone-apply-q",
        "Describe one way Pixel Forge Games could use a drone and one safety or privacy point the team should remember.",
        "A satisfactory answer names a clear use (for example aerial promo footage) and one responsible point such as permissions, avoiding private gardens, or safe distance from people. Write at least 200 characters."
      )
    ],
    6
  ),

  activity(
    "week-7-social-intro",
    "What is social media?",
    "Define social media platforms and how they support communication and sharing.",
    "Teaching",
    [
      heading("week-7-social-intro-h", "What is social media?"),
      para(
        "week-7-social-intro-p1",
        "Social media platforms are online services where people create, share and discuss content. Examples include short-video apps, image feeds and community pages."
      ),
      para(
        "week-7-social-intro-p2",
        "Social media has grown from simple status updates into rich media, live streams and business pages. Users communicate, follow creators and share news or entertainment."
      ),
      sc(
        "week-7-social-intro-q1",
        "What are social media platforms?",
        [
          "Online services where people create, share and discuss content",
          "Only paper noticeboards in one office",
          "Only offline board games",
          "Only 3D printers"
        ],
        "a",
        "Correct. Social media is about creating and sharing content online.",
        "Not quite. Focus on online sharing and discussion."
      ),
      sc(
        "week-7-social-intro-q2",
        "How has social media mainly evolved?",
        [
          "From simple updates toward richer media, communities and business use",
          "By deleting the internet",
          "By banning all images forever",
          "By replacing electricity with candles only"
        ],
        "a",
        "Correct. Platforms now support richer content and wider uses.",
        "Not quite. Think about growth in media types and communities."
      )
    ],
    5
  ),
  activity(
    "week-7-social-algo",
    "Algorithms and recommendations",
    "Explain personalised recommendations in plain Level 2 language.",
    "Teaching",
    [
      heading("week-7-social-algo-h", "Algorithms and recommendations"),
      para(
        "week-7-social-algo-p1",
        "An algorithm here means a set of rules or calculations used by software. Social media often uses algorithms to show personalised recommendations (posts the system predicts you may like based on what you watch, like or follow)."
      ),
      para(
        "week-7-social-algo-p2",
        "That can help people find useful content. It can also create filter bubbles or spread low-quality posts if users are not careful."
      ),
      sc(
        "week-7-social-algo-q1",
        "What do personalised recommendations mainly try to do?",
        [
          "Show content the system predicts the user may engage with",
          "Print every post onto paper overnight",
          "Turn off the user's device permanently",
          "Replace the need for any network"
        ],
        "a",
        "Correct. Recommendations try to match content to predicted interests.",
        "Not quite. Think about suggesting posts based on activity."
      ),
      sc(
        "week-7-social-algo-q2",
        "Which statement is balanced?",
        [
          "Recommendations can help discovery, but users should still think carefully about what they trust and share",
          "Algorithms always show only perfect true information",
          "Algorithms never affect what people see",
          "Social media cannot show any video"
        ],
        "a",
        "Correct. Useful discovery still needs careful judgement.",
        "Not quite. Keep benefits and risks in balance."
      )
    ],
    4
  ),
  activity(
    "week-7-social-uses",
    "Personal and business uses of social media",
    "Outline marketing, engagement and Pixel Forge community examples.",
    "Teaching",
    [
      heading("week-7-social-uses-h", "Personal and business uses of social media"),
      para(
        "week-7-social-uses-p1",
        "People use social media to stay in touch, share hobbies and follow news. Businesses use it for marketing, customer engagement and support."
      ),
      para(
        "week-7-social-uses-p2",
        "Pixel Forge Games can announce releases, share trailers, collect community feedback and talk with players. Social media marketing means promoting a product or brand through these platforms."
      ),
      sc(
        "week-7-social-uses-q1",
        "Which is a business use of social media?",
        [
          "Sharing a game trailer and answering player questions on a studio page",
          "Only writing on sticky notes with no digital tools",
          "Turning off all player communication",
          "Printing a network cable"
        ],
        "a",
        "Correct. Announcements and engagement are common business uses.",
        "Not quite. Look for marketing or community communication."
      ),
      sc(
        "week-7-social-uses-q2",
        "What does customer engagement mean here?",
        [
          "Building ongoing interaction with customers or players through replies, posts and shared content",
          "Never answering any message",
          "Deleting every community page",
          "Replacing players with paper forms only"
        ],
        "a",
        "Correct. Engagement is about ongoing, two-way interaction.",
        "Not quite. Think about talking with and listening to players."
      )
    ],
    5
  ),
  activity(
    "week-7-social-limits",
    "Social media benefits, limits and safety",
    "Cover benefits plus privacy, misinformation and online safety.",
    "Teaching",
    [
      heading("week-7-social-limits-h", "Social media benefits, limits and safety"),
      para(
        "week-7-social-limits-p1",
        "Benefits include wide reach, fast updates and community building. Limitations include time cost, negative comments, platform rule changes and uneven reach."
      ),
      para(
        "week-7-social-limits-p2",
        "Privacy, misinformation and online safety matter. Misinformation means false or misleading information presented as if it were true. Users and studios should protect personal data, check sources and behave respectfully."
      ),
      sc(
        "week-7-social-limits-q1",
        "What is misinformation?",
        [
          "False or misleading information presented as if it were true",
          "A type of drone propeller",
          "A cloud storage folder name only",
          "A printer ink colour"
        ],
        "a",
        "Correct. Misinformation is false or misleading content.",
        "Not quite. Focus on false or misleading information."
      ),
      sc(
        "week-7-social-limits-q2",
        "Which safety practice is sensible for Pixel Forge staff?",
        [
          "Protect account access, avoid sharing private personal data, and check facts before posting",
          "Post every password in public comments",
          "Ignore all privacy settings forever",
          "Assume every viral claim is automatically true"
        ],
        "a",
        "Correct. Protect accounts, privacy and accuracy.",
        "Not quite. Choose responsible online behaviour."
      )
    ],
    5
  ),
  activity(
    "week-7-social-apply",
    "Apply: social media for a game launch",
    "Explain one social media use for Pixel Forge and one risk to manage.",
    "Application",
    [
      heading("week-7-social-apply-h", "Apply: social media for a game launch"),
      para(
        "week-7-social-apply-p",
        "Think about announcements, trailers or community feedback. Add one privacy, misinformation or safety point."
      ),
      short(
        "week-7-social-apply-q",
        "Describe one way Pixel Forge could use social media for a launch and one risk the team should manage.",
        "A satisfactory answer names a clear use (trailer, announcement or player replies) and one risk such as privacy, misinformation, harassment or account security. Write at least 200 characters."
      )
    ],
    6
  ),

  activity(
    "week-7-vlog-intro",
    "What is a vlog?",
    "Define vlogs and contrast them with blogs.",
    "Teaching",
    [
      heading("week-7-vlog-intro-h", "What is a vlog?"),
      para(
        "week-7-vlog-intro-p1",
        "A vlog is a video blog: regular video updates shared online. A blog is usually written text posts. Both can inform or entertain, but a vlog uses video as the main format."
      ),
      para(
        "week-7-vlog-intro-p2",
        "Creators film, edit and upload episodes. Viewers watch on social platforms or video sites."
      ),
      sc(
        "week-7-vlog-intro-q1",
        "What is a vlog?",
        [
          "A video blog: regular video updates shared online",
          "A paper-only diary locked in a drawer",
          "A type of UAV propeller",
          "A spreadsheet formula"
        ],
        "a",
        "Correct. Vlog means video blog.",
        "Not quite. Focus on regular video updates shared online."
      ),
      sc(
        "week-7-vlog-intro-q2",
        "How does a vlog mainly differ from a typical blog?",
        [
          "A vlog centres on video; a typical blog centres on written text",
          "A vlog can never be shared online",
          "A blog always requires a drone",
          "They are identical in every way"
        ],
        "a",
        "Correct. The main difference is video versus written posts.",
        "Not quite. Compare video format with written posts."
      )
    ],
    4
  ),
  activity(
    "week-7-vlog-create",
    "Creating and sharing video content",
    "Outline equipment, software, streaming and recorded video.",
    "Teaching",
    [
      heading("week-7-vlog-create-h", "Creating and sharing video content"),
      para(
        "week-7-vlog-create-p1",
        "Common equipment includes a camera or phone, microphone and lighting. Software is used to edit clips, add titles and export a finished file."
      ),
      para(
        "week-7-vlog-create-p2",
        "Recorded video is filmed first, then edited and uploaded later. Streaming means sending video live as it happens. Both can support tutorials or studio updates."
      ),
      sc(
        "week-7-vlog-create-q1",
        "What is the difference between streaming and recorded video?",
        [
          "Streaming is live as it happens; recorded video is filmed first and shared later",
          "Streaming always means printing DVDs",
          "Recorded video can never be edited",
          "They both require a drone by law"
        ],
        "a",
        "Correct. Live versus filmed-then-uploaded is the key difference.",
        "Not quite. Think about live broadcast versus later upload."
      ),
      sc(
        "week-7-vlog-create-q2",
        "Why might creators use editing software?",
        [
          "To cut clips, add titles and prepare a clearer finished video",
          "To delete the need for any camera",
          "To turn video into a WAN cable",
          "To replace electricity"
        ],
        "a",
        "Correct. Editing improves clarity and presentation.",
        "Not quite. Editing shapes the finished video."
      )
    ],
    5
  ),
  activity(
    "week-7-vlog-uses",
    "Vlogs for games and studios",
    "Cover personal and business uses, including development diaries.",
    "Teaching",
    [
      heading("week-7-vlog-uses-h", "Vlogs for games and studios"),
      para(
        "week-7-vlog-uses-p1",
        "Personal uses include sharing hobbies and daily stories. Business uses include tutorials, product demos and behind-the-scenes updates."
      ),
      para(
        "week-7-vlog-uses-p2",
        "Gaming content creators and studios often publish development diaries, tutorials and promotional videos. Pixel Forge could film short diary episodes about a feature build, then upload them to engage players."
      ),
      callout(
        "week-7-vlog-uses-c",
        "Responsible publishing",
        "Respect copyright (do not use other people's protected work without permission), protect privacy, and avoid sharing confidential studio information."
      ),
      sc(
        "week-7-vlog-uses-q1",
        "Which is a suitable Pixel Forge vlog idea?",
        [
          "A short development diary showing progress on a new feature",
          "Publishing every staff home address",
          "Uploading a competitor's full game files without permission",
          "A vlog that contains only blank audio with no purpose"
        ],
        "a",
        "Correct. Development diaries are a common studio video format.",
        "Not quite. Choose a responsible promotional or diary-style use."
      ),
      sc(
        "week-7-vlog-uses-q2",
        "Why does copyright matter when publishing a vlog?",
        [
          "Creators should not use other people's protected work without permission",
          "Copyright only applies to paper books from 1800",
          "Copyright means drones cannot fly",
          "Copyright deletes all video platforms"
        ],
        "a",
        "Correct. Respect ownership of music, footage and other protected works.",
        "Not quite. Copyright protects creators' work."
      )
    ],
    5
  ),
  activity(
    "week-7-vlog-apply",
    "Apply: a Pixel Forge vlog idea",
    "Propose a short vlog and one responsible publishing point.",
    "Application",
    [
      heading("week-7-vlog-apply-h", "Apply: a Pixel Forge vlog idea"),
      para(
        "week-7-vlog-apply-p",
        "Suggest a tutorial, diary or promo video. Mention copyright, privacy or confidentiality."
      ),
      short(
        "week-7-vlog-apply-q",
        "Describe one vlog Pixel Forge could publish and one responsible publishing point.",
        "A satisfactory answer names a clear video idea (diary, tutorial or promo) and one point about copyright, privacy or not sharing confidential builds. Write at least 200 characters."
      )
    ],
    6
  ),

  activity(
    "week-7-match-uses",
    "Match drones, social media and vlogs",
    "Match each technology to a suitable use case.",
    "Classification",
    [
      heading("week-7-match-uses-h", "Match drones, social media and vlogs"),
      para(
        "week-7-match-uses-p",
        "Choose the best fit for each situation."
      ),
      classify(
        "week-7-match-uses-q",
        "Match each need to the most suitable technology.",
        [
          { id: "drone", label: "Drone / UAV" },
          { id: "social", label: "Social media" },
          { id: "vlog", label: "Vlog" }
        ],
        [
          {
            id: "u1",
            text: "Capture aerial footage of an outdoor Pixel Forge launch event",
            correctCategoryId: "drone"
          },
          {
            id: "u2",
            text: "Post a short trailer announcement and reply to player comments the same day",
            correctCategoryId: "social"
          },
          {
            id: "u3",
            text: "Publish a weekly video development diary episode",
            correctCategoryId: "vlog"
          },
          {
            id: "u4",
            text: "Inspect a tall outdoor sign safely from the air before an event",
            correctCategoryId: "drone"
          },
          {
            id: "u5",
            text: "Run a community poll about which character skin players prefer",
            correctCategoryId: "social"
          }
        ],
        {
          correct:
            "Well matched. Aerial jobs suit drones, fast community posts suit social media, and regular video diaries suit vlogs.",
          incorrect:
            "Not quite. Ask whether the need is aerial capture, quick community posting, or a regular video episode."
        }
      )
    ],
    6
  ),
  activity(
    "week-7-pf-scenarios",
    "Pixel Forge scenarios",
    "Choose suitable tools for short studio scenarios.",
    "Application",
    [
      heading("week-7-pf-scenarios-h", "Pixel Forge scenarios"),
      para(
        "week-7-pf-scenarios-p",
        "More than one tool can appear in a real campaign. These questions highlight the best main fit."
      ),
      sc(
        "week-7-pf-scenarios-q1",
        "The marketing team needs a sweeping outdoor shot of the venue. Which tool fits best?",
        [
          "A drone used with permissions and safety planning",
          "A text-only blog post with no visuals",
          "IPv6 address planning alone",
          "SD-WAN office routing alone"
        ],
        "a",
        "Correct. Aerial venue shots point to a carefully planned drone flight.",
        "Not quite. Look for aerial filming."
      ),
      sc(
        "week-7-pf-scenarios-q2",
        "Players ask questions under a trailer post. Which approach fits best?",
        [
          "Reply through the studio social media accounts",
          "Fly a drone indoors over desks without a plan",
          "Ignore all community channels",
          "Publish staff private phone numbers in the trailer"
        ],
        "a",
        "Correct. Social media supports fast community engagement.",
        "Not quite. Focus on player communication on the platform."
      ),
      sc(
        "week-7-pf-scenarios-q3",
        "Designers want a weekly behind-the-scenes video series. Which format fits best?",
        [
          "A vlog-style development diary",
          "A single unread email with no video",
          "A blockchain ownership record for every brush stroke",
          "A 5G mast installed under every desk"
        ],
        "a",
        "Correct. Regular video diary episodes match a vlog format.",
        "Not quite. Regular video updates point to a vlog."
      )
    ],
    5
  ),

  activity(
    "week-7-consolidate-map",
    "AC1.1 consolidation: match technologies",
    "Match earlier emerging technologies to simple use cases.",
    "Classification",
    [
      heading("week-7-consolidate-map-h", "AC1.1 consolidation: match technologies"),
      para(
        "week-7-consolidate-map-p",
        "Use Weeks 1 to 6 ideas. Pick the technology that best fits each short need."
      ),
      classify(
        "week-7-consolidate-map-q",
        "Match each situation to the most suitable technology group.",
        [
          { id: "iot", label: "IoT / RFID / NFC / wearables" },
          { id: "cloud", label: "Cloud (SaaS / IaaS / PaaS / DaaS)" },
          { id: "ai", label: "AI / smart devices / robots / neural networks" },
          { id: "immersive", label: "VR / AR / 3D / 4D printing" },
          { id: "net", label: "5G / IPv6 / blockchain / serverless / SD-WAN" }
        ],
        [
          {
            id: "c1",
            text: "A warehouse tags stock so scanners can identify items wirelessly",
            correctCategoryId: "iot"
          },
          {
            id: "c2",
            text: "Staff use online apps and remote desktops hosted by a provider",
            correctCategoryId: "cloud"
          },
          {
            id: "c3",
            text: "A game NPC learns patterns from player behaviour to adapt challenges",
            correctCategoryId: "ai"
          },
          {
            id: "c4",
            text: "A headset surrounds a trainee in a computer-made practice world",
            correctCategoryId: "immersive"
          },
          {
            id: "c5",
            text: "A studio needs more IP addresses for thousands of new devices",
            correctCategoryId: "net"
          }
        ],
        {
          correct:
            "Well matched. Tags point to IoT-style tech, hosted apps to cloud, learning NPCs to AI, headsets to VR, and address growth to IPv6 within the networking set.",
          incorrect:
            "Not quite. Re-read each clue: tags, hosted apps, learning behaviour, surrounding headset, or many IP addresses."
        }
      )
    ],
    7
  ),
  activity(
    "week-7-consolidate-check",
    "AC1.1 consolidation: quick outlines",
    "Check that learners can outline key technologies from earlier weeks.",
    "Knowledge check",
    [
      heading("week-7-consolidate-check-h", "AC1.1 consolidation: quick outlines"),
      sc(
        "week-7-consolidate-check-q1",
        "Which statement about the Internet of Things (IoT) is correct?",
        [
          "IoT means everyday objects connected to networks so they can share data",
          "IoT means only paper forms",
          "IoT means deleting all sensors",
          "IoT is identical to a vlog"
        ],
        "a",
        "Correct. Connected objects sharing data is the Level 2 outline.",
        "Not quite. IoT is about connected devices and data."
      ),
      sc(
        "week-7-consolidate-check-q2",
        "Which cloud model usually means ready-made software delivered online?",
        [
          "Software as a Service (SaaS)",
          "Only 4D printing",
          "Only RFID tags",
          "Only SD-WAN cables"
        ],
        "a",
        "Correct. SaaS is software delivered as an online service.",
        "Not quite. Expand SaaS: Software as a Service."
      ),
      sc(
        "week-7-consolidate-check-q3",
        "How do Virtual Reality (VR) and Augmented Reality (AR) differ?",
        [
          "VR surrounds you in a computer-made world; AR adds digital extras to the real world",
          "VR and AR are always the same flat email",
          "AR always hides the entire real world",
          "VR means printing plastic only"
        ],
        "a",
        "Correct. Surround versus overlay is the key difference.",
        "Not quite. Keep VR (surround) and AR (overlay) separate."
      ),
      sc(
        "week-7-consolidate-check-q4",
        "Which technology helps manage network links between multiple offices?",
        [
          "SD-WAN",
          "A vlog microphone alone",
          "A single social media hashtag alone",
          "A paper map with no network"
        ],
        "a",
        "Correct. SD-WAN is about software-managed wide-area links.",
        "Not quite. Multi-site networking points to SD-WAN."
      ),
      sc(
        "week-7-consolidate-check-q5",
        "Which new Week 7 technology is an unmanned aircraft?",
        [
          "A drone (UAV)",
          "SaaS",
          "NFC only",
          "IPv6 only"
        ],
        "a",
        "Correct. Drones are unmanned aircraft.",
        "Not quite. Look for the UAV idea."
      )
    ],
    6
  ),
  activity(
    "week-7-consolidate-write",
    "AC1.1 consolidation: short written outline",
    "Write a short outline of two technologies and one real-world use for each.",
    "Application",
    [
      heading("week-7-consolidate-write-h", "AC1.1 consolidation: short written outline"),
      para(
        "week-7-consolidate-write-p",
        "Pick any two technologies from Weeks 1 to 7. Keep explanations short and clear."
      ),
      short(
        "week-7-consolidate-write-q",
        "Choose two emerging technologies from this unit so far. For each one, say what it is and give one real-world use.",
        "A satisfactory answer names two technologies, gives a plain-English meaning for each, and one practical use for each. Write at least 200 characters."
      )
    ],
    7
  ),

  activity(
    "week-7-knowledge-check",
    "Knowledge check: drones, social media and vlogs",
    "Check definitions, uses and responsible practice.",
    "Knowledge check",
    [
      heading("week-7-kc-h", "Knowledge check: drones, social media and vlogs"),
      sc(
        "week-7-kc-q1",
        "Which expansion is correct?",
        [
          "UAV means Unmanned Aerial Vehicle",
          "SaaS means Social Aerial Aircraft System",
          "Vlog means Very Long Offline Game",
          "IoT means Ink on Toast"
        ],
        "a",
        "Correct. UAV expands to Unmanned Aerial Vehicle.",
        "Not quite. Check the drone acronym again."
      ),
      sc(
        "week-7-kc-q2",
        "Which pair is most accurate?",
        [
          "Social media supports sharing and engagement; users must still watch privacy and misinformation risks",
          "Social media never affects business communication",
          "Vlogs cannot be recorded",
          "Drones never use cameras"
        ],
        "a",
        "Correct. Benefits come with responsibility.",
        "Not quite. Keep a balanced outline."
      ),
      sc(
        "week-7-kc-q3",
        "A studio wants live player Q&A on video. Which option fits best?",
        [
          "A live stream, with a recorded vlog upload later if needed",
          "Only a paper letter posted next year",
          "Flying a drone with no camera indoors over staff silently",
          "Changing every IP address for no reason"
        ],
        "a",
        "Correct. Live Q&A suits streaming; a later upload can extend reach.",
        "Not quite. Think about live video communication."
      ),
      sc(
        "week-7-kc-q4",
        "Which limitation can affect drone flights?",
        [
          "Weather, battery life, rules and privacy concerns",
          "Drones always fly for unlimited hours in any storm",
          "Privacy rules never apply to aerial cameras",
          "Drones cannot capture any outdoor images"
        ],
        "a",
        "Correct. Real-world limits and rules still apply.",
        "Not quite. Keep practical limits and responsibilities in mind."
      ),
      sc(
        "week-7-kc-q5",
        "Why might Pixel Forge publish a development diary vlog?",
        [
          "To show progress, build interest and explain features responsibly",
          "To share confidential passwords with the public",
          "To avoid all player communication",
          "To replace every playtest with silence"
        ],
        "a",
        "Correct. Diaries support engagement when published carefully.",
        "Not quite. Focus on responsible progress updates."
      )
    ],
    6
  ),
  activity(
    "week-7-knowledge-check-b",
    "Knowledge check: AC1.1 judgements",
    "Apply consolidation ideas to short cases without moving into AC2 depth.",
    "Knowledge check",
    [
      heading("week-7-kcb-h", "Knowledge check: AC1.1 judgements"),
      sc(
        "week-7-kcb-q1",
        "A learner must outline a technology and give one use. Which answer is best quality for AC1.1 practice?",
        [
          "RFID uses radio tags to identify items; warehouses can scan tagged stock",
          "RFID is magic and needs no explanation",
          "RFID is the same as VR headsets",
          "RFID only means writing essays about brand values"
        ],
        "a",
        "Correct. Clear outline plus a practical use matches AC1.1 practice.",
        "Not quite. Keep meaning and use plain and specific."
      ),
      sc(
        "week-7-kcb-q2",
        "Which statement stays within AC1.1-style outlining?",
        [
          "Cloud SaaS delivers software online; a studio can use it for email or design tools",
          "A full financial investment case for every department with no technology definition",
          "Only listing wages with no technology names",
          "Ignoring what the technology does"
        ],
        "a",
        "Correct. Definition plus use is the AC1.1 focus here.",
        "Not quite. Avoid drifting into deep cost or investment analysis."
      ),
      sc(
        "week-7-kcb-q3",
        "Which Pixel Forge example correctly pairs technology and use?",
        [
          "AR overlay labels on a real demo booth; social media posts to announce the demo times",
          "Blockchain as the only way to write a tutorial script",
          "IPv6 as a replacement for all cameras",
          "SD-WAN as a type of vlog microphone"
        ],
        "a",
        "Correct. Each technology keeps a sensible use.",
        "Not quite. Match each tool to a realistic job."
      ),
      sc(
        "week-7-kcb-q4",
        "Before finishing AC1.1 practice, what should a learner be able to do?",
        [
          "Identify key emerging technologies, explain them simply, and give real-world uses",
          "Memorise every chip voltage on a drone",
          "Ignore social media safety completely",
          "Skip all examples and only list brand slogans"
        ],
        "a",
        "Correct. Identify, explain simply, and give uses.",
        "Not quite. Stay with clear outlines and applications."
      )
    ],
    5
  ),
  activity(
    "week-7-reflection",
    "Extension: AC1.1 technology profile homework",
    "Optional homework: profile one Week 7 technology or compare two unit technologies.",
    "Extension",
    [
      heading("week-7-ref-h", "Extension: AC1.1 technology profile homework"),
      para(
        "week-7-ref-p",
        "Optional homework: choose drones, social media or vlogs, or compare one of them with an earlier technology. This is formative, not Gateway assignment evidence."
      ),
      reflection(
        "week-7-ref-q",
        "Choose drones, social media or vlogs. Explain what it is, give one Pixel Forge use, one benefit, one limitation, and say how it differs from one technology from Weeks 1 to 6.",
        500,
        "Sentence starters: The technology I chose is... It means... Pixel Forge could use it for... One benefit is... One limitation is... It differs from ... because... Write at least 500 characters. Paste is disabled."
      )
    ],
    13
  ),
  activity(
    "week-7-exit",
    "Exit ticket",
    "Quick check on drones, social media, vlogs and AC1.1 consolidation confidence.",
    "Exit ticket",
    [
      heading("week-7-exit-h", "Exit ticket"),
      sc(
        "week-7-exit-q1",
        "Which short summary is correct?",
        [
          "Drones are unmanned aircraft; social media shares and engages online; vlogs are video blogs; AC1.1 needs clear outlines and real-world uses of emerging technologies",
          "Drones, social media and vlogs are three names for IPv6 only",
          "AC1.1 only means memorising chip voltages",
          "Vlogs cannot be shared and drones never use cameras"
        ],
        "a",
        "Correct. That summary keeps this week's ideas and AC1.1 focus clear.",
        "Not quite. Keep each idea separate and practical."
      ),
      para(
        "week-7-exit-p",
        "Tell your tutor how confident you feel outlining drones, social media, vlogs and the earlier AC1.1 technologies."
      )
    ],
    2
  )
];

const activityIds = week7Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const existing = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek7 = existing.filter((item) => !String(item.id || "").startsWith("week-7-"));
fs.writeFileSync(activitiesPath, `${JSON.stringify([...withoutWeek7, ...week7Activities], null, 2)}\n`);

const sessionsPath = path.join(ROOT, "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8")).filter((item) => item.id !== "week-7-session");
sessions.push(
  envelope(
    "lp.content.session",
    "week-7-session",
    "0.1.0",
    {
      title: "Week 7 session",
      kind: "session",
      summary:
        "One 1.5-hour session: drones, social media, vlogs, Pixel Forge scenarios and AC1.1 consolidation.",
      sortOrder: 1,
      defaultOpen: true,
      status: "available"
    },
    { week: "week-7", activities: activityIds }
  )
);
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

const weeksPath = path.join(ROOT, "weeks.json");
const weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8")).filter((item) => item.id !== "week-7");
weeks.push(
  envelope(
    "lp.content.week",
    "week-7",
    "0.1.0",
    {
      teachingWeek: 7,
      title: "Drones, Social Media, Vlogs and Emerging Technologies Consolidation",
      status: "planned",
      professionalPractice: "LO1 / AC 1.1 - outline drones, social media, vlogs and consolidate emerging technologies",
      route: "week-7/"
    },
    {
      curriculum: "l2e-exploring-emerging-digital-technologies-curriculum",
      learningOutcomes: ["lo1"],
      assignment: "formative-practice",
      sessions: ["week-7-session"]
    }
  )
);
fs.writeFileSync(weeksPath, `${JSON.stringify(weeks, null, 2)}\n`);

const curriculumPath = path.join(ROOT, "curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));
if (!curriculum.relationships.weeks.includes("week-7")) curriculum.relationships.weeks.push("week-7");
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
for (const act of week7Activities) {
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
