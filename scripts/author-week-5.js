#!/usr/bin/env node
"use strict";

/**
 * Author Week 5: VR, AR, 3D printing and 4D printing (AC1.1).
 * Regenerates week-5 activities, session, week row and package.json.
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

function steps(count) {
  return Array.from({ length: count }, (_, index) => ({ id: `step-${index + 1}`, label: `Step ${index + 1}` }));
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

const week5Activities = [
  // A. Recap
  activity(
    "week-5-starter",
    "Welcome to Week 5",
    "Recap Week 4 AI ideas, then set the focus for VR, AR, 3D printing and 4D printing (AC1.1).",
    "Starter",
    [
      heading("week-5-starter-h", "Welcome to Week 5"),
      para(
        "week-5-starter-p1",
        "This week you outline four more emerging technologies: virtual reality (VR), augmented reality (AR), 3D printing and 4D printing (AC1.1)."
      ),
      callout(
        "week-5-starter-c",
        "By the end of this week",
        "You will be able to say what VR and AR are and how they differ. You will outline how 3D printing builds objects in layers. You will explain how 4D printing adds change over time. You will pick a suitable technology for simple Pixel Forge Games scenarios."
      ),
      para(
        "week-5-starter-p2",
        "First, a quick check from Week 4. AI means software that learns from data, recognises patterns or makes predictions. Not every automatic program is AI."
      ),
      sc(
        "week-5-starter-q1",
        "Which statement from Week 4 is correct?",
        [
          "Every program that runs on a computer is AI",
          "AI can recognise patterns or learn from data, but it does not think or feel like a person",
          "A calculator is AI because it works quickly",
          "Robots and AI are always the same thing"
        ],
        "b",
        "Correct. AI handles tasks that usually need human intelligence, such as spotting patterns. It does not think or feel like a person, and not every program or robot is AI.",
        "Not quite. Not every program is AI, and a calculator usually follows fixed rules. Robots and AI can work together but they are not always the same thing."
      ),
      sc(
        "week-5-starter-q2",
        "Which four technologies will you outline this week for AC1.1?",
        [
          "Email, spreadsheets, passwords and printers only",
          "Virtual reality, augmented reality, 3D printing and 4D printing",
          "Only robots and RFID tags",
          "Only cloud storage and Wi-Fi routers"
        ],
        "b",
        "Correct. This week focuses on VR, AR, 3D printing and 4D printing so you can outline them for AC1.1.",
        "Not quite. Read the welcome text again. This week is about VR, AR, 3D printing and 4D printing."
      )
    ],
    5
  ),
  activity(
    "week-5-recap-ai",
    "Recap: smart systems and AI",
    "Refresh the smart-system flow and the difference between fixed rules and AI.",
    "Classification",
    [
      heading("week-5-recap-ai-h", "Recap: smart systems and AI"),
      para(
        "week-5-recap-ai-p",
        "A smart system often follows Sensors, Data, Processing, then Decision or action. AI is involved when the processing learns from data or recognises patterns, not when it only follows one fixed rule."
      ),
      classify(
        "week-5-recap-ai-q",
        "Sort each example as Fixed rules or AI-style processing.",
        [
          { id: "rules", label: "Fixed rules" },
          { id: "ai", label: "AI-style processing" }
        ],
        [
          { id: "r1", text: "A light turns off after ten minutes with no movement", correctCategoryId: "rules" },
          { id: "r2", text: "A phone groups photos by recognising faces", correctCategoryId: "ai" },
          { id: "r3", text: "A music app builds a playlist from your listening habits", correctCategoryId: "ai" },
          { id: "r4", text: "A microwave runs for the number of seconds you typed", correctCategoryId: "rules" }
        ],
        {
          correct: "Well sorted. Timers and simple on/off rules are fixed. Face grouping and playlists recognise patterns or learn from data.",
          incorrect: "Not quite yet. Ask whether the system only follows a set instruction, or whether it learns from data or recognises patterns."
        }
      )
    ],
    4
  ),
  activity(
    "week-5-recap-tech",
    "Recap: linking earlier technologies",
    "Connect IoT, cloud and AI ideas to this week's immersive and making technologies.",
    "Teaching",
    [
      heading("week-5-recap-tech-h", "Linking earlier technologies"),
      para(
        "week-5-recap-tech-p1",
        "VR, AR and 3D printing often use ideas you have already met. A headset can be a connected device (IoT). Heavy graphics or AI features can run in the cloud. Sensors on a headset track where you look and move."
      ),
      para(
        "week-5-recap-tech-p2",
        "You do not need to invent new words here. Use the ones you know: sensors collect data, processing makes sense of it, and an action or display updates what you see."
      ),
      sc(
        "week-5-recap-tech-q1",
        "A VR headset tracks head movement and updates the scene. Which earlier idea does the tracking mainly use?",
        [
          "Sensors collecting data about movement",
          "DaaS giving you a full remote desktop",
          "RFID tags stuck on every wall",
          "A calculator following only fixed sums"
        ],
        "a",
        "Correct. Tracking uses sensors to collect movement data so the system can update what you see.",
        "Not quite. Head tracking is about sensors and data. It is not a remote desktop (DaaS), RFID on walls, or a simple calculator sum."
      ),
      sc(
        "week-5-recap-tech-q2",
        "Which statement is most accurate?",
        [
          "VR, AR and 3D printing replace the need for any earlier digital technologies",
          "VR, AR and 3D printing can use sensors, cloud services and software ideas you already know",
          "Cloud computing only works with email",
          "IoT devices can never be used with VR or AR"
        ],
        "b",
        "Correct. These technologies build on sensors, networks, cloud services and software rather than replacing everything you have learned.",
        "Not quite. New technologies usually combine earlier ideas. Cloud is not limited to email, and connected devices can support VR or AR."
      )
    ],
    5
  ),

  // B. Virtual Reality
  activity(
    "week-5-vr-intro",
    "What is virtual reality?",
    "Define VR in simple language and give a familiar example.",
    "Teaching",
    [
      heading("week-5-vr-intro-h", "What is virtual reality?"),
      para(
        "week-5-vr-intro-p1",
        "Virtual reality (VR) puts you inside a computer-made world. You usually wear a headset over your eyes. When you turn your head, the view changes as if you were really there."
      ),
      para(
        "week-5-vr-intro-p2",
        "The word virtual means created by software, not built from bricks or wood. The world can look like a game level, a training room or a quiet beach."
      ),
      para(
        "week-5-vr-intro-p3",
        "A familiar example is a VR game where you stand in a virtual arena and look around. Another example is a training simulation where a learner practises a task in a safe virtual space."
      ),
      callout(
        "week-5-vr-intro-c",
        "Key term: immersive",
        "Immersive means the experience surrounds you so strongly that it feels as if you are inside it. VR aims to be immersive by filling your view and responding to your movement."
      ),
      sc(
        "week-5-vr-intro-q1",
        "Which statement best defines virtual reality?",
        [
          "Any video watched on a phone screen",
          "A computer-made world that surrounds you, usually through a headset",
          "A printed poster stuck over a real object",
          "A spreadsheet stored in the cloud"
        ],
        "b",
        "Correct. VR is a computer-made world that surrounds you. A headset is the usual way to enter that world.",
        "Not quite. Watching a normal video or using a spreadsheet is not VR. VR surrounds you in a computer-made world, usually with a headset."
      ),
      sc(
        "week-5-vr-intro-q2",
        "Why does turning your head matter in VR?",
        [
          "It charges the headset battery",
          "The view should update so the virtual world stays lined up with your movement",
          "It prints a 3D object",
          "It switches the headset into a calculator"
        ],
        "b",
        "Correct. Tracking your head lets the system update the view so the virtual world feels consistent as you look around.",
        "Not quite. Head movement is tracked so the display updates. It does not print objects or turn the headset into a calculator."
      )
    ],
    6
  ),
  activity(
    "week-5-vr-kit",
    "VR equipment and tracking",
    "Name common VR kit and explain what tracking does.",
    "Teaching",
    [
      heading("week-5-vr-kit-h", "VR equipment and tracking"),
      para(
        "week-5-vr-kit-p1",
        "Common VR kit includes a headset (the display over your eyes), controllers (hand devices for pointing or grabbing), and sensors or cameras that track movement."
      ),
      para(
        "week-5-vr-kit-p2",
        "Tracking means the system keeps checking where your head and hands are. Without tracking, the virtual world would not stay lined up with how you move."
      ),
      para(
        "week-5-vr-kit-p3",
        "Some headsets need a powerful computer nearby. Others are standalone: the computing happens inside the headset. Both types still create a virtual world."
      ),
      sc(
        "week-5-vr-kit-q1",
        "What is the main job of VR tracking?",
        [
          "To print plastic parts",
          "To keep the virtual view lined up with the user's head and hand movement",
          "To send emails automatically",
          "To store paper documents"
        ],
        "b",
        "Correct. Tracking follows movement so the virtual view stays lined up with the user.",
        "Not quite. Tracking is about movement and the display. Printing, email and paper storage are different jobs."
      ),
      sc(
        "week-5-vr-kit-q2",
        "A learner puts on a headset and holds two hand controllers. Which statement is correct?",
        [
          "Only the headset matters; controllers are never used in VR",
          "The headset shows the world; controllers can let the learner point, grab or select in that world",
          "Controllers replace the need for any display",
          "Tracking only works if the room has no light"
        ],
        "b",
        "Correct. The headset is the display. Controllers are common tools for interacting inside the virtual world.",
        "Not quite. Controllers support interaction. They do not replace the display, and tracking does not require a pitch-dark room."
      )
    ],
    5
  ),
  activity(
    "week-5-vr-uses",
    "Where VR is used",
    "Outline practical VR applications beyond entertainment.",
    "Teaching",
    [
      heading("week-5-vr-uses-h", "Where VR is used"),
      para(
        "week-5-vr-uses-p1",
        "VR is well known for games, but it is also used for training, design reviews and virtual visits. For example, a trainee can practise a safety drill without real danger."
      ),
      para(
        "week-5-vr-uses-p2",
        "Designers can walk through a virtual building before it is built. Museums and schools can offer virtual tours of places that are hard to visit."
      ),
      para(
        "week-5-vr-uses-p3",
        "These uses are already happening in many organisations. They are practical applications, not science fiction."
      ),
      sc(
        "week-5-vr-uses-q1",
        "Which is a practical use of VR outside entertainment?",
        [
          "Training someone in a safe virtual environment before they try the real task",
          "Editing a spreadsheet with no display",
          "Sending a text message with no graphics",
          "Printing a paper poster with no headset"
        ],
        "a",
        "Correct. Safe training simulations are a real and useful VR application.",
        "Not quite. VR can support training and virtual visits. Spreadsheets, plain texts and paper posters alone are not VR uses."
      ),
      sc(
        "week-5-vr-uses-q2",
        "A design team wants to check how a new shop layout feels before building it. How can VR help?",
        [
          "By letting the team walk through a virtual version of the shop",
          "By replacing the design drawings with a paper calculator",
          "By turning the shop plan into an email attachment only",
          "By hiding the design so nobody can review it"
        ],
        "a",
        "Correct. A virtual walkthrough lets people review a design before expensive building work begins.",
        "Not quite. VR helps people experience a design digitally so they can review it before building."
      )
    ],
    5
  ),
  activity(
    "week-5-vr-or-not",
    "VR or not VR?",
    "Classify examples as VR or not VR using the surround-and-headset idea.",
    "Classification",
    [
      heading("week-5-vr-or-not-h", "VR or not VR?"),
      para(
        "week-5-vr-or-not-p",
        "Ask: does the person enter a computer-made world that surrounds their view, usually with a headset? Looking at a normal flat screen in the real room is not the same as VR."
      ),
      classify(
        "week-5-vr-or-not-q",
        "For each example, choose VR or Not VR.",
        [
          { id: "vr", label: "VR" },
          { id: "not", label: "Not VR" }
        ],
        [
          { id: "v1", text: "A learner wears a headset and stands inside a virtual training kitchen", correctCategoryId: "vr" },
          { id: "v2", text: "A student watches a normal YouTube video on a laptop screen", correctCategoryId: "not" },
          { id: "v3", text: "A gamer looks around a fully virtual arena using a headset", correctCategoryId: "vr" },
          { id: "v4", text: "A tourist reads a paper map on a street corner", correctCategoryId: "not" }
        ],
        {
          correct: "Well sorted. Headset experiences that surround you are VR. A laptop video or paper map stays in the real world as a flat view.",
          incorrect: "Not quite. VR surrounds you in a computer-made world, usually with a headset. A normal laptop video or paper map is not VR."
        }
      )
    ],
    4
  ),
  activity(
    "week-5-vr-limits",
    "VR benefits and limitations",
    "Weigh up benefits and limitations of VR for learners and organisations.",
    "Teaching",
    [
      heading("week-5-vr-limits-h", "VR benefits and limitations"),
      para(
        "week-5-vr-limits-p1",
        "Benefits of VR include safe practice, strong immersion and the chance to visit places that are hard to reach. Teams can also review designs together in a shared virtual space."
      ),
      para(
        "week-5-vr-limits-p2",
        "Limitations include cost of headsets, the need for space to move safely, motion sickness for some users, and the time needed to build good virtual content."
      ),
      para(
        "week-5-vr-limits-p3",
        "VR is powerful, but it is not the right tool for every job. Sometimes a simple video or a real practice session is clearer and cheaper."
      ),
      sc(
        "week-5-vr-limits-q1",
        "Which statement is a limitation of VR?",
        [
          "It can let people practise dangerous tasks safely",
          "Some users feel motion sickness and headsets can be expensive",
          "It can support immersive games",
          "It can show a virtual building before it is built"
        ],
        "b",
        "Correct. Cost and motion sickness are real limitations. The other options are benefits or uses.",
        "Not quite. Safe practice, immersion and virtual walkthroughs are benefits. Cost and sickness risk are limitations."
      ),
      short(
        "week-5-vr-limits-q2",
        "In two or three sentences, give one benefit and one limitation of using VR for training.",
        "Sentence starters: One benefit of VR for training is... One limitation is... Write at least 200 characters.",
        200
      )
    ],
    6
  ),

  // C. Augmented Reality
  activity(
    "week-5-ar-intro",
    "What is augmented reality?",
    "Define AR and contrast it with replacing the real world.",
    "Teaching",
    [
      heading("week-5-ar-intro-h", "What is augmented reality?"),
      para(
        "week-5-ar-intro-p1",
        "Augmented reality (AR) adds digital objects on top of the real world. You still see your room, street or classroom. Extra labels, characters or arrows appear over what the camera sees."
      ),
      para(
        "week-5-ar-intro-p2",
        "Augmented means added to. AR does not usually replace the whole view with a virtual world. It layers helpful digital information onto reality."
      ),
      para(
        "week-5-ar-intro-p3",
        "A familiar example is a phone app that places a virtual character on your living-room floor through the camera. Another example is an app that shows directions as arrows over the street view."
      ),
      callout(
        "week-5-ar-intro-c",
        "Remember",
        "VR surrounds you in a virtual world. AR keeps the real world and adds digital extras on top."
      ),
      sc(
        "week-5-ar-intro-q1",
        "Which statement best defines augmented reality?",
        [
          "A headset that blocks out the real world completely",
          "Digital information or objects added on top of the real world",
          "A printer that builds plastic layers",
          "A cloud folder used only for spreadsheets"
        ],
        "b",
        "Correct. AR adds digital content to what you already see in the real world.",
        "Not quite. Blocking out the real world is closer to VR. Printing layers is 3D printing. AR adds digital extras to reality."
      ),
      sc(
        "week-5-ar-intro-q2",
        "A learner points a phone camera at a desk and a virtual game character appears on the desk. Which technology is this?",
        [
          "VR, because the desk disappears",
          "AR, because the real desk stays visible and a digital object is added",
          "4D printing, because the character is plastic",
          "RFID, because the phone scanned a paper tag"
        ],
        "b",
        "Correct. The real desk remains visible while a digital character is added. That is AR.",
        "Not quite. If the real scene stays and digital objects are layered on top, it is AR, not VR or printing."
      )
    ],
    6
  ),
  activity(
    "week-5-ar-devices",
    "Devices used for AR",
    "Identify phones, tablets and AR glasses as common AR devices.",
    "Teaching",
    [
      heading("week-5-ar-devices-h", "Devices used for AR"),
      para(
        "week-5-ar-devices-p1",
        "Most school and everyday AR uses a smartphone or tablet camera. The screen shows the real scene plus digital overlays."
      ),
      para(
        "week-5-ar-devices-p2",
        "Some workplaces use AR glasses. These leave your hands free while labels or instructions appear in front of you."
      ),
      para(
        "week-5-ar-devices-p3",
        "You do not always need an expensive headset for AR. Many useful AR tools already run on devices learners know."
      ),
      sc(
        "week-5-ar-devices-q1",
        "Which device is commonly used for everyday AR?",
        [
          "A smartphone or tablet camera and screen",
          "A paper notebook with no camera",
          "A toaster with no display",
          "A wired keyboard with no internet and no camera"
        ],
        "a",
        "Correct. Phones and tablets are the most common everyday AR devices.",
        "Not quite. AR needs a camera view of the real world and a way to show digital overlays. Phones and tablets do that well."
      ),
      sc(
        "week-5-ar-devices-q2",
        "Why might a technician prefer AR glasses instead of holding a phone?",
        [
          "Glasses always print plastic parts",
          "Hands-free overlays can show instructions while both hands stay on the job",
          "Glasses remove the need for any training",
          "Phones cannot show any digital information"
        ],
        "b",
        "Correct. AR glasses can keep instructions visible while hands stay free for the task.",
        "Not quite. The advantage is hands-free guidance. Glasses do not print parts or replace all training, and phones can also show digital information."
      )
    ],
    5
  ),
  activity(
    "week-5-ar-uses",
    "Where AR is used",
    "Outline AR uses in learning, navigation and product preview.",
    "Teaching",
    [
      heading("week-5-ar-uses-h", "Where AR is used"),
      para(
        "week-5-ar-uses-p1",
        "AR can label parts of a machine for training, show furniture in your room before you buy it, or add navigation arrows over a street view."
      ),
      para(
        "week-5-ar-uses-p2",
        "In education, AR can place a 3D model of a heart or engine on a desk so learners can walk around it. In retail, shoppers can preview products at home."
      ),
      para(
        "week-5-ar-uses-p3",
        "These are current, practical uses. They help people understand something in context without building a full virtual world."
      ),
      sc(
        "week-5-ar-uses-q1",
        "Which is a practical AR use?",
        [
          "Showing a virtual sofa in your real living room through a phone camera",
          "Blocking out the whole room with a fully virtual beach for every task",
          "Building a physical house with no design file and no camera",
          "Editing a spreadsheet with the camera switched off"
        ],
        "a",
        "Correct. Product preview in a real room is a common AR use.",
        "Not quite. AR adds digital content to a real scene. Fully replacing the view is closer to VR."
      ),
      sc(
        "week-5-ar-uses-q2",
        "A tutor wants learners to see labels on a real classroom 3D printer. How can AR help?",
        [
          "By overlaying names of parts on the live camera view of the printer",
          "By hiding the printer completely behind a virtual wall",
          "By removing all safety guidance from the lesson",
          "By turning the printer into a text-only email"
        ],
        "a",
        "Correct. AR can place labels on top of the real printer through a camera view.",
        "Not quite. AR supports learning by adding clear digital labels to the real object."
      )
    ],
    5
  ),
  activity(
    "week-5-ar-or-not",
    "AR or not AR?",
    "Classify examples as AR or not AR.",
    "Classification",
    [
      heading("week-5-ar-or-not-h", "AR or not AR?"),
      para(
        "week-5-ar-or-not-p",
        "Ask: does the person still see the real world, with digital extras added? If the real world is fully replaced by a virtual scene, it is not AR."
      ),
      classify(
        "week-5-ar-or-not-q",
        "For each example, choose AR or Not AR.",
        [
          { id: "ar", label: "AR" },
          { id: "not", label: "Not AR" }
        ],
        [
          { id: "a1", text: "A phone shows arrows over the live street to guide you to a shop", correctCategoryId: "ar" },
          { id: "a2", text: "A headset blocks the room and shows only a virtual desert", correctCategoryId: "not" },
          { id: "a3", text: "A catalogue app places a virtual lamp on your real table", correctCategoryId: "ar" },
          { id: "a4", text: "A learner reads a printed textbook with no camera overlay", correctCategoryId: "not" }
        ],
        {
          correct: "Well sorted. Live overlays on the real world are AR. A fully virtual headset scene or a plain textbook is not AR.",
          incorrect: "Not quite. AR keeps the real world and adds digital extras. A full virtual-only view is closer to VR."
        }
      )
    ],
    4
  ),
  activity(
    "week-5-ar-limits",
    "AR benefits and limitations",
    "Identify benefits and limitations of AR.",
    "Teaching",
    [
      heading("week-5-ar-limits-h", "AR benefits and limitations"),
      para(
        "week-5-ar-limits-p1",
        "Benefits of AR include using familiar devices, keeping users aware of their real surroundings, and adding clear guidance in context."
      ),
      para(
        "week-5-ar-limits-p2",
        "Limitations include needing a clear camera view, possible distraction, battery use, and overlays that can be inaccurate if tracking fails."
      ),
      sc(
        "week-5-ar-limits-q1",
        "Which statement is a benefit of AR compared with fully immersive VR?",
        [
          "Users can often keep seeing the real room or workplace while digital help is added",
          "AR always costs more than any other technology",
          "AR never needs a camera",
          "AR always blocks out the real world"
        ],
        "a",
        "Correct. AR usually keeps the real world visible, which can be safer and more practical for many tasks.",
        "Not quite. A key AR benefit is seeing the real surroundings with digital extras. AR typically needs a camera view and does not block out reality."
      ),
      sc(
        "week-5-ar-limits-q2",
        "Which is a limitation of AR?",
        [
          "It can label real objects for training",
          "Poor lighting or tracking errors can make overlays sit in the wrong place",
          "It can preview products at home",
          "It can run on many smartphones"
        ],
        "b",
        "Correct. If tracking fails, overlays can look wrong. The other options are benefits or strengths.",
        "Not quite. Labelling, product preview and phone support are strengths. Tracking and lighting problems are limitations."
      )
    ],
    5
  ),

  // D. VR vs AR
  activity(
    "week-5-compare-intro",
    "VR and AR: the key difference",
    "Explain the core difference between VR and AR in plain language.",
    "Teaching",
    [
      heading("week-5-compare-intro-h", "VR and AR: the key difference"),
      para(
        "week-5-compare-intro-p1",
        "VR replaces what you see with a virtual world. AR keeps the real world and adds digital extras."
      ),
      para(
        "week-5-compare-intro-p2",
        "Both can be interactive and both can use sensors. The deciding question is: are you inside a computer-made world, or are you still looking at the real place with extras on top?"
      ),
      sc(
        "week-5-compare-intro-q1",
        "What is the clearest difference between VR and AR?",
        [
          "VR surrounds you in a virtual world; AR adds digital content to the real world",
          "VR only works on paper; AR only works underwater",
          "AR always needs a full headset that blocks reality; VR never uses a display",
          "They are identical and the names are random"
        ],
        "a",
        "Correct. That surrounding-versus-overlay difference is the key idea for Level 2.",
        "Not quite. Remember: VR surrounds you in a virtual world; AR overlays digital content on reality."
      ),
      sc(
        "week-5-compare-intro-q2",
        "A museum app shows dinosaur labels over exhibits through a phone camera. Is this closer to VR or AR?",
        [
          "AR, because the real exhibits stay visible with digital labels added",
          "VR, because the museum building disappears",
          "4D printing, because labels are made of plastic",
          "Neither, because phones cannot show digital text"
        ],
        "a",
        "Correct. Real exhibits remain in view while labels are added. That is AR.",
        "Not quite. If the real scene stays and digital labels are added, it is AR."
      )
    ],
    5
  ),
  activity(
    "week-5-compare-sort",
    "Sort benefits and limitations",
    "Classify statements as a benefit or a limitation for VR or AR.",
    "Classification",
    [
      heading("week-5-compare-sort-h", "Sort benefits and limitations"),
      para(
        "week-5-compare-sort-p",
        "You already know the VR versus AR difference. Now sort each statement as a Benefit or a Limitation. Use what you learned about cost, safety, immersion and staying aware of real surroundings."
      ),
      classify(
        "week-5-compare-sort-q",
        "Sort each statement as Benefit or Limitation.",
        [
          { id: "benefit", label: "Benefit" },
          { id: "limit", label: "Limitation" }
        ],
        [
          { id: "c1", text: "VR lets trainees practise risky tasks without real danger", correctCategoryId: "benefit" },
          { id: "c2", text: "Some VR users feel motion sickness and headsets can be expensive", correctCategoryId: "limit" },
          { id: "c3", text: "AR can keep the real workplace visible while adding helpful labels", correctCategoryId: "benefit" },
          { id: "c4", text: "AR overlays can sit in the wrong place if tracking or lighting is poor", correctCategoryId: "limit" }
        ],
        {
          correct: "Well sorted. Safe practice and in-context labels are benefits. Cost, sickness and tracking errors are limitations.",
          incorrect: "Ask whether the statement helps the user or organisation, or whether it is a drawback such as cost, sickness or tracking errors."
        }
      )
    ],
    4
  ),
  activity(
    "week-5-compare-choose",
    "Choose VR or AR for the job",
    "Select the more suitable technology for short workplace scenarios.",
    "Application",
    [
      heading("week-5-compare-choose-h", "Choose VR or AR for the job"),
      para(
        "week-5-compare-choose-p",
        "Read each need carefully. If people must stay aware of a real place, AR is often better. If they need a fully controlled virtual environment, VR is often better."
      ),
      sc(
        "week-5-compare-choose-q1",
        "Warehouse staff need labels on real shelves while they walk the aisle. Which technology fits better?",
        [
          "AR overlays on a phone or glasses while the real aisle stays visible",
          "VR that hides the warehouse completely",
          "4D printing that turns shelves into water",
          "A paper calculator with no display of the shelves"
        ],
        "a",
        "Correct. Staff still need to see the real shelves, so AR overlays are the better fit.",
        "Not quite. Hiding the warehouse would make picking harder. They need digital help on top of the real aisle."
      ),
      sc(
        "week-5-compare-choose-q2",
        "A team wants to practise evacuating a building that is still being designed and does not exist yet. Which technology fits better?",
        [
          "VR, so learners can enter a virtual version of the planned building",
          "AR overlays on an empty field with no virtual building model",
          "3D printing a single brick with no practice scenario",
          "Cloud storage that only saves files with no building view"
        ],
        "a",
        "Correct. When the real building is not there yet, a virtual world (VR) can provide a safe practice space.",
        "Not quite. Practising in a building that does not exist yet usually needs a virtual environment, which is VR."
      )
    ],
    5
  ),

  // E. 3D printing
  activity(
    "week-5-3d-intro",
    "What is 3D printing?",
    "Define 3D printing as building a solid object from a digital design.",
    "Teaching",
    [
      heading("week-5-3d-intro-h", "What is 3D printing?"),
      para(
        "week-5-3d-intro-p1",
        "3D printing builds a solid object from a digital design. The printer usually adds material layer by layer until the shape is complete."
      ),
      para(
        "week-5-3d-intro-p2",
        "The digital design is often made in 3D modelling software. The printer then follows that design. Without a design file, the printer does not know what to build."
      ),
      para(
        "week-5-3d-intro-p3",
        "A familiar school example is printing a small plastic phone stand or a simple game-character model for a display."
      ),
      callout(
        "week-5-3d-intro-c",
        "Key idea",
        "3D printing is additive manufacturing: material is added in layers. That is different from carving material away from a block."
      ),
      sc(
        "week-5-3d-intro-q1",
        "Which statement best defines 3D printing?",
        [
          "Building a solid object from a digital design, usually layer by layer",
          "Taking a photo of an object",
          "Sending an email with an attachment",
          "Watching a flat video on a phone"
        ],
        "a",
        "Correct. 3D printing turns a digital design into a physical object, usually by adding layers.",
        "Not quite. Photos, emails and videos are not 3D printing. 3D printing builds a physical object from a design."
      ),
      sc(
        "week-5-3d-intro-q2",
        "Why does a 3D printer need a digital design?",
        [
          "So it knows the shape and size to build",
          "So it can cook food",
          "So it can replace the school Wi-Fi",
          "So it can write essays automatically"
        ],
        "a",
        "Correct. The design tells the printer what to make.",
        "Not quite. The design file guides the shape. Printing does not cook food, run Wi-Fi or write essays."
      )
    ],
    6
  ),
  activity(
    "week-5-3d-process",
    "The basic 3D printing process",
    "Order the main steps from design to finished object.",
    "Ordering",
    [
      heading("week-5-3d-process-h", "The basic 3D printing process"),
      para(
        "week-5-3d-process-p",
        "A simple process is: create or download a 3D design, prepare the file for the printer, print layer by layer, then finish the object (for example remove supports and check the part)."
      ),
      classify(
        "week-5-3d-process-q",
        "Put the steps in order. Use each step once.",
        steps(4),
        [
          { id: "p3", text: "The printer builds the object layer by layer", correctCategoryId: "step-3" },
          { id: "p1", text: "A digital 3D design is created or chosen", correctCategoryId: "step-1" },
          { id: "p4", text: "Supports are removed and the part is checked", correctCategoryId: "step-4" },
          { id: "p2", text: "The design is prepared as instructions the printer can follow", correctCategoryId: "step-2" }
        ],
        {
          correct: "Correct order. Design first, then prepare instructions, then print layers, then finish and check the part.",
          incorrect: "Not in the right order yet. You need a design before the printer can be instructed. Printing happens before finishing the part."
        }
      ),
      sc(
        "week-5-3d-process-q2",
        "What does \"layer by layer\" mean in 3D printing?",
        [
          "The printer adds thin layers of material one after another to build the shape",
          "The printer deletes layers of a spreadsheet",
          "The printer only prints flat posters",
          "The printer paints an existing metal car"
        ],
        "a",
        "Correct. Most school 3D printers build height by stacking thin layers of material.",
        "Not quite. Layer by layer means adding material gradually to form the 3D shape."
      )
    ],
    5
  ),
  activity(
    "week-5-3d-materials",
    "Materials and school printers",
    "Outline common materials and safe classroom expectations.",
    "Teaching",
    [
      heading("week-5-3d-materials-h", "Materials and school printers"),
      para(
        "week-5-3d-materials-p1",
        "Many school printers use plastic filament that is heated and placed in layers. Other industrial printers can use resins, powders or even metal, but those systems are specialised."
      ),
      para(
        "week-5-3d-materials-p2",
        "Different materials suit different jobs. A display model may use a cheap plastic. A stronger part may need a tougher material and a more advanced printer."
      ),
      para(
        "week-5-3d-materials-p3",
        "Safety matters: hot nozzles, moving parts and fumes mean learners follow tutor rules and do not touch a printer mid-print without permission."
      ),
      sc(
        "week-5-3d-materials-q1",
        "Which material is common in many school 3D printers?",
        [
          "Plastic filament that is heated and laid down in layers",
          "Liquid nitrogen used as ink for paper posters",
          "Wet cement poured into a keyboard",
          "Cloud storage folders"
        ],
        "a",
        "Correct. Heated plastic filament is common in classroom printers.",
        "Not quite. School printers usually melt and place plastic filament. Cloud folders are not a printing material."
      ),
      sc(
        "week-5-3d-materials-q2",
        "Why might an industrial metal 3D printer be unsuitable for a normal classroom?",
        [
          "It can need specialised equipment, training and safety controls beyond a typical school setup",
          "Metal printing never exists anywhere",
          "All metal printers fit in a pencil case",
          "Metal printers only print emails"
        ],
        "a",
        "Correct. Industrial metal systems are specialised. Schools usually start with safer plastic filament printers.",
        "Not quite. Metal 3D printing exists in industry, but it is not a typical classroom starter technology."
      )
    ],
    5
  ),
  activity(
    "week-5-3d-uses",
    "Applications of 3D printing",
    "Identify practical 3D printing uses including prototypes.",
    "Teaching",
    [
      heading("week-5-3d-uses-h", "Applications of 3D printing"),
      para(
        "week-5-3d-uses-p1",
        "3D printing is widely used for prototypes: early versions of a product made quickly so a design can be tested and improved."
      ),
      para(
        "week-5-3d-uses-p2",
        "Other uses include custom tools, replacement parts, medical models for planning, and teaching aids. Some fashion and jewellery makers also print complex shapes."
      ),
      para(
        "week-5-3d-uses-p3",
        "3D printing is excellent for one-off or small-batch items. For millions of identical parts, traditional factory methods can still be faster and cheaper."
      ),
      sc(
        "week-5-3d-uses-q1",
        "What is a prototype in this context?",
        [
          "An early physical version of a design made so it can be tested and improved",
          "The final mass-produced product sold in every shop worldwide",
          "A random file with no shape",
          "A password for the school network"
        ],
        "a",
        "Correct. Prototypes help teams test ideas before committing to expensive final production.",
        "Not quite. A prototype is an early test version, not necessarily the final mass-produced item."
      ),
      sc(
        "week-5-3d-uses-q2",
        "When is 3D printing often a good choice?",
        [
          "When you need a custom or small-batch part quickly from a digital design",
          "When you need a billion identical screws at the lowest factory cost with no design changes",
          "When you only need to send a text message",
          "When you want to avoid having any design at all"
        ],
        "a",
        "Correct. Custom and small-batch work suits 3D printing well.",
        "Not quite. Huge identical runs often suit traditional manufacturing better. Printing still needs a design."
      )
    ],
    5
  ),
  activity(
    "week-5-3d-limits",
    "3D printing benefits and limitations",
    "Balance speed and customisation against strength, time and cost limits.",
    "Teaching",
    [
      heading("week-5-3d-limits-h", "3D printing benefits and limitations"),
      para(
        "week-5-3d-limits-p1",
        "Benefits include fast prototyping, custom shapes, less waste than some cutting methods, and the ability to make parts on demand."
      ),
      para(
        "week-5-3d-limits-p2",
        "Limitations include print time for large objects, limited strength of some plastics, surface finish that may need sanding, and the cost of larger industrial machines."
      ),
      sc(
        "week-5-3d-limits-q1",
        "Which statement is a benefit of 3D printing?",
        [
          "You can turn a digital design into a custom physical prototype relatively quickly",
          "Every printed plastic part is always stronger than steel",
          "Printing never takes any time",
          "You never need a design file"
        ],
        "a",
        "Correct. Fast custom prototypes are a major benefit.",
        "Not quite. Strength and time depend on the job. You still need a design, and plastic is not always stronger than steel."
      ),
      short(
        "week-5-3d-limits-q2",
        "Explain one benefit and one limitation of 3D printing for a small business making prototypes.",
        "Sentence starters: One benefit for a small business is... One limitation is... Write at least 200 characters.",
        200
      )
    ],
    6
  ),

  // F. 4D printing
  activity(
    "week-5-4d-intro",
    "What is 4D printing?",
    "Introduce 4D printing as printed objects that can change after printing.",
    "Teaching",
    [
      heading("week-5-4d-intro-h", "What is 4D printing?"),
      para(
        "week-5-4d-intro-p1",
        "4D printing starts like 3D printing: an object is built from a digital design. The extra idea is that the finished object can change shape or behaviour later when conditions change."
      ),
      para(
        "week-5-4d-intro-p2",
        "The \"fourth dimension\" here means time. After printing, the object may bend, unfold or stiffen when it meets heat, water or light."
      ),
      para(
        "week-5-4d-intro-p3",
        "4D printing is still emerging. Some research and specialist projects already exist, but it is not as common in schools as basic 3D printing."
      ),
      callout(
        "week-5-4d-intro-c",
        "Be clear",
        "Treat everyday classroom plastic prints as 3D printing unless the material is designed to change later. Do not claim every 3D print is 4D."
      ),
      sc(
        "week-5-4d-intro-q1",
        "What extra idea does 4D printing add to 3D printing?",
        [
          "The printed object can change shape or behaviour over time when conditions change",
          "The printer only prints in black and white",
          "The object can never be touched",
          "The design file is deleted automatically"
        ],
        "a",
        "Correct. Time and change after printing are the key 4D idea.",
        "Not quite. 4D printing is about designed change after printing, not about deleting files or forbidding touch."
      ),
      sc(
        "week-5-4d-intro-q2",
        "Which statement is most accurate for Level 2 learners?",
        [
          "4D printing is an emerging idea; some specialist examples exist, but school work usually starts with 3D printing",
          "Every home already uses 4D printers for toast",
          "4D printing replaced all factories in 1990",
          "4D printing means drawing on paper with four pencils"
        ],
        "a",
        "Correct. Keep 4D printing in the emerging-technology category while recognising real research and specialist uses.",
        "Not quite. 4D printing is emerging and specialist. Everyday school making usually starts with 3D printing."
      )
    ],
    6
  ),
  activity(
    "week-5-4d-vs-3d",
    "How 4D printing differs from 3D printing",
    "Compare 3D and 4D printing with clear examples.",
    "Teaching",
    [
      heading("week-5-4d-vs-3d-h", "How 4D printing differs from 3D printing"),
      para(
        "week-5-4d-vs-3d-p1",
        "A normal 3D-printed phone stand keeps its shape after printing. That is 3D printing."
      ),
      para(
        "week-5-4d-vs-3d-p2",
        "A 4D-printed object is made so that a later trigger, such as heat or water, causes a planned change. The change is designed, not an accident."
      ),
      sc(
        "week-5-4d-vs-3d-q1",
        "A plastic keyring is printed and stays the same shape on a learner's bag. What is this?",
        [
          "3D printing of a stable object",
          "4D printing, because time always turns every object into 4D",
          "VR, because the keyring is virtual",
          "AR, because the keyring is a label"
        ],
        "a",
        "Correct. A finished object that is meant to stay the same is a normal 3D print.",
        "Not quite. Time passing alone does not make something 4D. 4D needs a designed change after printing."
      ),
      sc(
        "week-5-4d-vs-3d-q2",
        "Which example is closer to 4D printing?",
        [
          "A printed strip designed to curl when placed in warm water",
          "A printed cube that is sanded smooth and then left unchanged",
          "A photo of a cube on a phone",
          "A cloud backup of a spreadsheet"
        ],
        "a",
        "Correct. A planned response to a trigger such as warm water matches the 4D idea.",
        "Not quite. Sanding a stable cube is finishing a 3D print. Photos and spreadsheets are not 4D printing."
      )
    ],
    5
  ),
  activity(
    "week-5-4d-triggers",
    "Triggers that can change a 4D object",
    "Identify heat, water and light as example triggers.",
    "Classification",
    [
      heading("week-5-4d-triggers-h", "Triggers that can change a 4D object"),
      para(
        "week-5-4d-triggers-p",
        "Researchers often design materials that react to heat, water or light. The trigger is chosen to match the job. Not every material reacts to every trigger."
      ),
      classify(
        "week-5-4d-triggers-q",
        "Sort each item as a possible 4D trigger example or Not a trigger example.",
        [
          { id: "trigger", label: "Possible trigger example" },
          { id: "not", label: "Not a trigger example" }
        ],
        [
          { id: "t1", text: "Warm water that makes a printed strip curl", correctCategoryId: "trigger" },
          { id: "t2", text: "Heat that causes a designed fold to open", correctCategoryId: "trigger" },
          { id: "t3", text: "A random password with no effect on the material", correctCategoryId: "not" },
          { id: "t4", text: "Light that changes a specially designed material", correctCategoryId: "trigger" }
        ],
        {
          correct: "Well sorted. Heat, water and light can be designed triggers. A password does not change the material by itself.",
          incorrect: "Look for conditions that act on the material, such as heat, water or light. A password is not a physical trigger."
        }
      ),
      sc(
        "week-5-4d-triggers-q2",
        "Why must a 4D trigger be planned in the design?",
        [
          "So the change is controlled and useful, not a surprise failure",
          "So the printer can send emails",
          "So the object never needs a design file",
          "So VR headsets become unnecessary forever"
        ],
        "a",
        "Correct. 4D printing is about designed change, not accidental melting or breaking.",
        "Not quite. The point of a trigger is a planned, useful response built into the design."
      )
    ],
    5
  ),
  activity(
    "week-5-4d-future",
    "4D printing: practical today and possible later",
    "Separate current specialist uses from speculative future ideas.",
    "Teaching",
    [
      heading("week-5-4d-future-h", "Practical today and possible later"),
      para(
        "week-5-4d-future-p1",
        "Today, 4D printing appears mainly in research labs and specialist projects. Examples include experimental medical devices and adaptive structures."
      ),
      para(
        "week-5-4d-future-p2",
        "Possible future ideas include packaging that changes shape in transit, or adaptive sports equipment. These ideas need careful testing before everyday use."
      ),
      para(
        "week-5-4d-future-p3",
        "For AC1.1, you should be able to outline the idea and give a sensible example. You should also say clearly when something is still experimental."
      ),
      sc(
        "week-5-4d-future-q1",
        "Which statement is fairest about 4D printing today?",
        [
          "It is an emerging technology with specialist and research examples, not a common school printer feature",
          "Every supermarket already sells home 4D printers for toast",
          "4D printing is imaginary and has never been researched",
          "4D printing is identical to watching VR videos"
        ],
        "a",
        "Correct. Keep your answer balanced: emerging and specialist, not everyday classroom kit.",
        "Not quite. 4D printing is researched and specialist, but it is not everyday school equipment or the same as VR."
      ),
      sc(
        "week-5-4d-future-q2",
        "A learner claims a 4D object will change usefully with no designed material and no trigger. What is wrong?",
        [
          "The claim is speculative and ignores how designs, materials and triggers actually work",
          "Nothing is wrong because every printed object is automatically 4D",
          "4D printing never needs a digital design",
          "4D printing is the same as watching a flat video"
        ],
        "a",
        "Correct. Good Level 2 answers stay realistic. Designed material change needs a plan and a trigger.",
        "Not quite. Outline real ideas carefully. Do not invent change with no design or trigger."
      )
    ],
    5
  ),

  // G. Pixel Forge Games
  activity(
    "week-5-pf-immersive",
    "Pixel Forge Games: VR and AR choices",
    "Apply VR and AR to Pixel Forge Games product ideas.",
    "Application",
    [
      heading("week-5-pf-immersive-h", "Pixel Forge Games: VR and AR choices"),
      para(
        "week-5-pf-immersive-p1",
        "Pixel Forge Games is a fictional games development company used across this course. The studio designs digital games and is now exploring emerging technologies that could improve how players experience those games."
      ),
      para(
        "week-5-pf-immersive-p2",
        "This week the design team is comparing two ideas. Idea A is a headset game where players feel fully inside a fantasy arena. Idea B is a phone game where digital creatures appear on real pavements through the camera."
      ),
      para(
        "week-5-pf-immersive-p3",
        "Both ideas can be valuable. The team must match the technology to the player experience they want."
      ),
      sc(
        "week-5-pf-immersive-q1",
        "Pixel Forge wants players to feel fully inside a fantasy arena. Which technology fits best?",
        [
          "VR with a headset so the player is surrounded by the virtual arena",
          "AR labels on a paper instruction sheet only",
          "3D printing a single plastic coin for the desk",
          "A spreadsheet of enemy names with no graphics"
        ],
        "a",
        "Correct. Feeling fully inside an arena is a VR goal.",
        "Not quite. Full immersion in a virtual arena points to VR, not paper labels or a spreadsheet."
      ),
      sc(
        "week-5-pf-immersive-q2",
        "Pixel Forge wants a mobile game where creatures appear on real pavements through the phone camera. Which technology fits best?",
        [
          "AR that keeps the real street visible and adds digital creatures",
          "VR that hides the street completely behind a headset view",
          "3D printing that builds a pavement model with no camera view",
          "Cloud storage that only saves files without showing the street"
        ],
        "a",
        "Correct. Digital creatures on a live camera view of real streets is AR.",
        "Not quite. If the real street stays visible with digital extras, choose AR."
      )
    ],
    5
  ),
  activity(
    "week-5-pf-print",
    "Pixel Forge Games: 3D and 4D making",
    "Use 3D printing for prototypes and keep 4D ideas clearly experimental.",
    "Application",
    [
      heading("week-5-pf-print-h", "Pixel Forge Games: 3D and 4D making"),
      para(
        "week-5-pf-print-p1",
        "Remember: Pixel Forge Games is the same fictional studio. Alongside digital games, its hardware team sometimes makes physical objects to test how controllers feel and to show characters on marketing desks."
      ),
      para(
        "week-5-pf-print-p2",
        "Today the team needs a prototype controller grip and a small character model. Those jobs suit everyday 3D printing from a digital design."
      ),
      para(
        "week-5-pf-print-p3",
        "A researcher also suggests an experimental accessory that changes stiffness when warmed by a player's hand. That idea would need specialist 4D materials and careful testing. It is not a normal school print."
      ),
      sc(
        "week-5-pf-print-q1",
        "Which job is a clear, practical use of 3D printing for Pixel Forge today?",
        [
          "Printing a prototype controller grip from a digital design so the shape can be tested",
          "Printing a finished million-unit factory run with no design review",
          "Replacing all game software with plastic parts",
          "Using a headset to hide the real workshop completely"
        ],
        "a",
        "Correct. Prototyping a grip is a realistic 3D printing use.",
        "Not quite. Prototypes and models are practical now. Huge unreviewed factory runs are not a sensible first step."
      ),
      sc(
        "week-5-pf-print-q2",
        "How should the team describe the hand-warming accessory idea?",
        [
          "As an experimental 4D-style concept that would need specialist materials and testing",
          "As a standard school 3D print that every learner already makes each lesson",
          "As proof that 4D printing is identical to AR",
          "As a finished product already sold worldwide with no risks"
        ],
        "a",
        "Correct. Keep speculative adaptive materials in the experimental category.",
        "Not quite. Adaptive change after printing is closer to emerging 4D ideas and needs careful testing."
      )
    ],
    5
  ),
  activity(
    "week-5-pf-choose",
    "Pixel Forge Games: pick the right technology",
    "Select suitable technologies for mixed Pixel Forge scenarios.",
    "Application",
    [
      heading("week-5-pf-choose-h", "Pixel Forge Games: pick the right technology"),
      para(
        "week-5-pf-choose-p1",
        "Pixel Forge Games is deciding which emerging technology fits each job. Use what you have learned: VR for fully virtual worlds, AR for digital extras on the real world, 3D printing for stable physical prototypes, and 4D printing only for experimental designed change after printing."
      ),
      para(
        "week-5-pf-choose-p",
        "Match each need to the best technology. Prefer practical options first. Mark futuristic ideas as experimental when needed."
      ),
      classify(
        "week-5-pf-choose-q",
        "Match each Pixel Forge need to the best technology.",
        [
          { id: "vr", label: "VR" },
          { id: "ar", label: "AR" },
          { id: "p3d", label: "3D printing" },
          { id: "p4d", label: "4D printing (experimental)" }
        ],
        [
          { id: "s1", text: "Playtest a headset game set entirely inside a virtual spaceship", correctCategoryId: "vr" },
          { id: "s2", text: "Let fans point a phone at a poster so a character appears on top of it", correctCategoryId: "ar" },
          { id: "s3", text: "Make a quick plastic prototype of a new controller shape", correctCategoryId: "p3d" },
          { id: "s4", text: "Research a material that softens when warmed by the player's hand", correctCategoryId: "p4d" }
        ],
        {
          correct: "Well matched. Virtual-only play is VR, poster overlays are AR, prototypes are 3D printing, and adaptive materials are experimental 4D ideas.",
          incorrect: "Try again. Ask whether the world is fully virtual, overlaid on reality, a stable printed object, or a designed change after printing."
        }
      )
    ],
    5
  ),

  // H. Knowledge checks and close
  activity(
    "week-5-knowledge-check",
    "Knowledge check: VR, AR and printing",
    "Check key AC1.1 ideas from this week without repeating earlier wording.",
    "Knowledge check",
    [
      heading("week-5-kc-h", "Knowledge check"),
      sc(
        "week-5-kc-q1",
        "A training company wants staff to practise a dangerous drill before using real equipment. Which technology is the best fit?",
        [
          "VR, so staff can practise inside a safe virtual environment",
          "AR labels on a blank wall with no practise scenario",
          "3D printing a poster with no interactive practice",
          "4D printing with no designed training task"
        ],
        "a",
        "Correct. Safe practice of a dangerous drill is a strong VR use.",
        "Not quite. When people need a controlled practice world, VR is usually the better fit."
      ),
      sc(
        "week-5-kc-q2",
        "A warehouse needs digital shelf labels while staff still see the real aisle. Which technology is the best fit?",
        [
          "AR overlays that keep the real aisle visible",
          "VR that hides the warehouse completely",
          "3D printing that replaces every shelf overnight",
          "4D printing with no warehouse task"
        ],
        "a",
        "Correct. Staff still need the real aisle, so AR overlays are the better fit.",
        "Not quite. Keeping the real workplace visible with digital help points to AR."
      ),
      sc(
        "week-5-kc-q3",
        "Which statement about 3D printing is correct?",
        [
          "It builds a physical object from a digital design, often layer by layer",
          "It only edits cloud spreadsheets",
          "It always creates food from light alone",
          "It means watching a flat video"
        ],
        "a",
        "Correct. Design to physical object, usually in layers, is the core 3D printing idea.",
        "Not quite. 3D printing makes physical objects from designs."
      ),
      sc(
        "week-5-kc-q4",
        "How does 4D printing differ from ordinary 3D printing?",
        [
          "The object is designed to change later when conditions such as heat or water change",
          "The object can never leave the computer screen",
          "The printer refuses to use any digital design",
          "It is another name for AR glasses"
        ],
        "a",
        "Correct. Designed change after printing is the 4D difference.",
        "Not quite. 4D printing still starts with a physical printed object, then adds planned change over time."
      ),
      sc(
        "week-5-kc-q5",
        "Pixel Forge needs a plastic desk model of a character for a marketing stand. Which technology is the most practical first choice?",
        [
          "3D printing a prototype model from a digital design",
          "4D printing that must change shape every minute to be useful on a desk",
          "VR that only exists inside a headset",
          "AR overlays with no physical model at all"
        ],
        "a",
        "Correct. A stable physical marketing model is a classic 3D printing job.",
        "Not quite. A desk model needs a physical object. Start with 3D printing."
      )
    ],
    8
  ),
  activity(
    "week-5-knowledge-check-b",
    "Knowledge check: benefits, limits and choices",
    "Apply benefits, limitations and technology choice to short cases.",
    "Knowledge check",
    [
      heading("week-5-kcb-h", "Knowledge check: benefits, limits and choices"),
      sc(
        "week-5-kcb-q1",
        "Which pair correctly matches a benefit to a limitation?",
        [
          "VR can support safe training; VR headsets can be costly and some users feel sick",
          "AR never needs a camera; AR always blocks the real world",
          "3D printing never needs a design; 3D printing always makes steel stronger than titanium",
          "4D printing is identical to email; email is identical to VR"
        ],
        "a",
        "Correct. Safe training is a VR benefit; cost and sickness risk are limitations.",
        "Not quite. Look for a true benefit paired with a true limitation."
      ),
      sc(
        "week-5-kcb-q2",
        "Staff must keep both hands on a real machine while seeing step labels. Which choice is best?",
        [
          "AR glasses or a carefully placed AR display that keeps the real machine visible",
          "VR that hides the machine completely",
          "3D printing a new machine during the repair",
          "Removing all step labels from the job"
        ],
        "a",
        "Correct. Hands-free guidance on a real machine points to AR.",
        "Not quite. Hiding the machine would make the job harder. They need overlays on reality."
      ),
      sc(
        "week-5-kcb-q3",
        "Why might a business still use factory moulds instead of 3D printing for a million identical parts?",
        [
          "Traditional methods can be faster and cheaper for very large identical runs",
          "3D printing cannot make any physical object",
          "Factories are not allowed to use digital designs",
          "Million-part runs never need quality checks"
        ],
        "a",
        "Correct. 3D printing shines for custom and small batches; huge identical runs often suit other methods.",
        "Not quite. Scale and cost matter. 3D printing is powerful, but not always best for huge identical runs."
      ),
      sc(
        "week-5-kcb-q4",
        "Which statement shows good Level 2 judgement about 4D printing?",
        [
          "It is emerging; outline the idea and keep speculative products clearly experimental",
          "It already replaced all packaging worldwide last year",
          "It means the same as watching a tutorial video",
          "It only exists as a spelling mistake for 3D printing"
        ],
        "a",
        "Correct. Balanced answers outline the idea without over-claiming.",
        "Not quite. Treat 4D printing as emerging and specialist, not as science fiction or a typo."
      )
    ],
    6
  ),
  activity(
    "week-5-reflection",
    "Extension: technology profile homework",
    "Optional homework: build a short AC1.1-style profile of one Week 5 technology.",
    "Extension",
    [
      heading("week-5-ref-h", "Extension: technology profile homework"),
      para(
        "week-5-ref-p",
        "Optional homework or research: choose VR, AR, 3D printing or 4D printing and write a short profile you could reuse when outlining technologies for AC1.1 practice. This is formative, not Gateway assignment evidence."
      ),
      reflection(
        "week-5-ref-q",
        "Choose one technology from this week (VR, AR, 3D printing or 4D printing). Explain what it is, give one practical example, one benefit, one limitation, and say whether your example is everyday, specialist or experimental.",
        500,
        "Sentence starters: The technology I chose is... It means... One practical example is... One benefit is... One limitation is... My example is everyday / specialist / experimental because... Write at least 500 characters. Paste is disabled."
      )
    ],
    13
  ),
  activity(
    "week-5-exit",
    "Exit ticket",
    "Quick check that you can outline VR, AR, 3D printing and 4D printing, and rate your confidence.",
    "Exit ticket",
    [
      heading("week-5-exit-h", "Exit ticket"),
      sc(
        "week-5-exit-q1",
        "Which short summary is correct?",
        [
          "VR surrounds you; AR adds digital extras to the real world; 3D prints objects; 4D adds planned change later",
          "VR, AR, 3D printing and 4D printing are four names for the same phone app",
          "3D printing means watching videos and VR means printing plastic",
          "AR always hides the real world completely"
        ],
        "a",
        "Correct. That short summary captures the four ideas from this week.",
        "Not quite. Keep the four ideas separate: surround (VR), overlay (AR), build objects (3D), planned change later (4D)."
      ),
      para(
        "week-5-exit-p",
        "Before you finish, tell your tutor how confident you feel outlining VR, AR, 3D printing and 4D printing."
      )
    ],
    2
  )
];

const activityIds = week5Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const existing = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek5 = existing.filter((item) => !String(item.id || "").startsWith("week-5-"));
fs.writeFileSync(activitiesPath, `${JSON.stringify([...withoutWeek5, ...week5Activities], null, 2)}\n`);

const sessionsPath = path.join(ROOT, "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8")).filter((item) => item.id !== "week-5-session");
sessions.push(envelope(
  "lp.content.session",
  "week-5-session",
  "0.1.0",
  {
    title: "Week 5 session",
    kind: "session",
    summary: "One 1.5-hour session: VR, AR, 3D printing, 4D printing, benefits, limitations and Pixel Forge Games scenarios (AC1.1).",
    sortOrder: 1,
    defaultOpen: true,
    status: "available"
  },
  { week: "week-5", activities: activityIds }
));
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

// Planned until a teacher makes it available in Admin; bundled status is the fallback when the live publication has no week-5.
const weeksPath = path.join(ROOT, "weeks.json");
const weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8")).filter((item) => item.id !== "week-5");
weeks.push(envelope(
  "lp.content.week",
  "week-5",
  "0.1.0",
  {
    teachingWeek: 5,
    title: "Virtual Reality, Augmented Reality, 3D Printing and 4D Printing",
    status: "planned",
    professionalPractice: "LO1 / AC 1.1 - outline VR, AR, 3D printing and 4D printing",
    route: "week-5/"
  },
  {
    curriculum: "l2e-exploring-emerging-digital-technologies-curriculum",
    learningOutcomes: ["lo1"],
    assignment: "formative-practice",
    sessions: ["week-5-session"]
  }
));
fs.writeFileSync(weeksPath, `${JSON.stringify(weeks, null, 2)}\n`);

const curriculumPath = path.join(ROOT, "curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));
if (!curriculum.relationships.weeks.includes("week-5")) curriculum.relationships.weeks.push("week-5");
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
for (const act of week5Activities) {
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
