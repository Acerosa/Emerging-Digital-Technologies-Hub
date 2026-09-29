#!/usr/bin/env node
"use strict";

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

const week4Activities = [
  // A. Week 3 recap
  activity(
    "week-4-starter",
    "Welcome to Week 4",
    "Recap the Week 3 cloud models, then set the focus for AI and intelligent computing (AC1.1).",
    "Starter",
    [
      heading("week-4-starter-h", "Welcome to Week 4"),
      para("week-4-starter-p1", "This week you outline artificial intelligence (AI) and intelligent computing: smart devices, robots and neural networks (AC1.1)."),
      callout(
        "week-4-starter-c",
        "By the end of this week",
        "You will be able to explain what AI is and is not. You will describe how smart devices and robots sense, decide and act. You will outline how a neural network learns from examples. You will weigh up the benefits and limitations of AI in real situations."
      ),
      para("week-4-starter-p2", "First, a quick recap of Week 3. Ask what the customer is getting: a ready app (SaaS), a platform to build apps (PaaS), rented infrastructure (IaaS) or a remote desktop (DaaS)."),
      classify(
        "week-4-starter-q1",
        "Match each Week 3 example to its cloud service model.",
        [
          { id: "saas", label: "SaaS" },
          { id: "paas", label: "PaaS" },
          { id: "iaas", label: "IaaS" },
          { id: "daas", label: "DaaS" }
        ],
        [
          { id: "r1", text: "A class uses a browser-based spreadsheet with nothing to install", correctCategoryId: "saas" },
          { id: "r2", text: "Developers upload their app code to a hosted build-and-run environment", correctCategoryId: "paas" },
          { id: "r3", text: "An IT team rents virtual servers and installs its own operating system", correctCategoryId: "iaas" },
          { id: "r4", text: "Staff log in to a full Windows desktop that runs on a provider's servers", correctCategoryId: "daas" }
        ],
        {
          correct: "Well recalled. SaaS gives you a ready app, PaaS gives developers a platform, IaaS rents raw infrastructure such as virtual servers, and DaaS delivers a whole desktop.",
          incorrect: "Not quite. Ask what is being provided. A ready-to-use app is SaaS. A place to build and run your own code is PaaS. Rented servers you manage yourself are IaaS. A complete remote desktop is DaaS."
        }
      ),
      sc(
        "week-4-starter-q2",
        "Many AI services, such as voice assistants, send your request to powerful remote servers to be processed. Which Week 3 idea does this link to?",
        [
          "Cloud computing: processing happens on remote servers reached over the internet",
          "Local storage: everything happens only on the device",
          "DaaS: the assistant gives you a full remote desktop",
          "IaaS: the speaker rents you your own virtual server to manage"
        ],
        "a",
        "Correct. Many AI features rely on the cloud because training and running AI can need more computing power than a phone or speaker has.",
        "Not quite. The request is sent over the internet to cloud servers, where the heavy processing happens. You are not given a desktop (DaaS) or a server to manage (IaaS), and the work does not stay only on the device."
      )
    ],
    5
  ),

  // B. AI and intelligent computing
  activity(
    "week-4-ai-intro",
    "What is AI?",
    "Define artificial intelligence and compare it with rule-based software.",
    "Teaching",
    [
      heading("week-4-ai-h", "What is AI?"),
      para("week-4-ai-p1", "Artificial intelligence (AI) lets computers do tasks that normally need human intelligence. Examples are recognising a face, understanding speech or predicting what might happen next."),
      para("week-4-ai-p2", "Rule-based software is different. It follows fixed instructions written by a programmer: \"if this happens, do that\". It does the same thing every time and cannot improve on its own. A calculator and a timer are rule-based."),
      para("week-4-ai-p3", "Many AI systems use machine learning. The programmer does not write every rule. Instead, the system is trained on lots of examples and finds patterns in them. It can then deal with new data it has not seen before."),
      para("week-4-ai-p4", "AI can be very good at spotting patterns, but it does not think, understand or feel like a person."),
      callout("week-4-ai-c", "Not all software is AI", "Most software is rule-based. Software only counts as AI when it recognises patterns, learns from data or makes predictions. Being automatic or clever-looking is not enough."),
      sc(
        "week-4-ai-q1",
        "Which statement best defines artificial intelligence?",
        [
          "Any program that runs on a computer",
          "Technology that lets computers do tasks that normally need human intelligence, such as recognising patterns or making predictions",
          "A computer that has feelings and thinks exactly like a person",
          "Software that only follows a fixed list of instructions"
        ],
        "b",
        "Correct. AI is about carrying out tasks that usually need human intelligence, such as recognising patterns, understanding language or making predictions.",
        "Not quite. Not every program is AI, and AI does not have feelings or think like a person. A fixed list of instructions describes rule-based software. AI handles tasks that normally need human intelligence, such as spotting patterns or making predictions."
      ),
      sc(
        "week-4-ai-q2",
        "A spam filter improves over time as it sees thousands of emails that people mark as spam. A different filter only blocks emails containing the exact word \"prize\". Which is the better description?",
        [
          "Both filters are AI because they both block emails",
          "The first filter learns from examples (AI); the second follows one fixed rule (rule-based)",
          "The second filter is AI because it has a rule",
          "Neither filter is software"
        ],
        "b",
        "Correct. The first filter learns patterns from labelled examples, which is machine learning. The second follows a fixed rule a programmer wrote, so it is rule-based software.",
        "Not quite. Doing a useful job does not make software AI. The filter that learns from thousands of labelled emails is AI (machine learning). The filter that only checks for one exact word follows a fixed rule, so it is rule-based."
      )
    ],
    5
  ),
  activity(
    "week-4-ai-examples",
    "AI in everyday life",
    "Recognise everyday examples of AI: recommendations, voice assistants, image recognition, navigation, spam detection and game AI.",
    "Teaching",
    [
      heading("week-4-ex-h", "AI in everyday life"),
      para("week-4-ex-p1", "You probably use AI every day without noticing. Here are six common examples."),
      para("week-4-ex-p2", "Recommendations: streaming and shopping sites suggest films or products based on what you, and people like you, chose before."),
      para("week-4-ex-p3", "Voice assistants: smart speakers and phones recognise spoken words and work out what you want."),
      para("week-4-ex-p4", "Image recognition: phones group photos by faces, and apps can identify a plant from a picture."),
      para("week-4-ex-p5", "Navigation: map apps use data from thousands of journeys to predict traffic and suggest faster routes."),
      para("week-4-ex-p6", "Spam detection: email services learn what junk mail usually looks like and filter it out."),
      para("week-4-ex-p7", "Game AI: some computer-controlled characters learn from how you play and change their tactics."),
      sc(
        "week-4-ex-q1",
        "A map app suggests a new route because it predicts heavy traffic ahead, based on data from thousands of other journeys. What is the AI doing?",
        [
          "Recognising patterns in large amounts of data to make a prediction",
          "Printing a paper map",
          "Following one fixed route that never changes",
          "Storing the map on a USB stick"
        ],
        "a",
        "Correct. The app spots patterns in lots of journey data and predicts where traffic will build up. Pattern recognition and prediction are typical AI tasks.",
        "Not quite. A route that never changes would be rule-based. The app is using lots of journey data to spot patterns and predict traffic, which is what makes it AI."
      )
    ],
    3
  ),
  activity(
    "week-4-ai-or-not",
    "AI or not AI?",
    "Classify examples as AI or not AI to show that not all software is AI.",
    "Classification",
    [
      heading("week-4-aon-h", "AI or not AI?"),
      para("week-4-aon-p", "Ask: does it learn from data, recognise patterns or make predictions? If it only follows fixed steps that a programmer set, it is not AI, even if it happens automatically."),
      classify(
        "week-4-aon-q",
        "For each example, choose AI or Not AI.",
        [
          { id: "ai", label: "AI" },
          { id: "not-ai", label: "Not AI (fixed rules)" }
        ],
        [
          { id: "a1", text: "A phone unlocks after recognising the owner's face", correctCategoryId: "ai" },
          { id: "a2", text: "A calculator app adds two numbers", correctCategoryId: "not-ai" },
          { id: "a3", text: "A music app builds a playlist from your listening habits", correctCategoryId: "ai" },
          { id: "a4", text: "A microwave turns off when its timer reaches zero", correctCategoryId: "not-ai" },
          { id: "a5", text: "A translation app listens to a spoken sentence and translates it", correctCategoryId: "ai" },
          { id: "a6", text: "A spreadsheet totals a column using the SUM formula", correctCategoryId: "not-ai" },
          { id: "a7", text: "A voice assistant understands a spoken question", correctCategoryId: "ai" },
          { id: "a8", text: "Street lights switch on at 7pm every evening on a timer", correctCategoryId: "not-ai" }
        ],
        {
          correct: "Well done. Face unlock, playlists, translation and voice assistants all recognise patterns or learn from data. Calculators, timers, formulas and fixed schedules just follow set rules.",
          incorrect: "Some are not right yet. Being automatic is not the same as being AI. Timers, formulas and fixed schedules follow rules set by a person. AI recognises patterns or learns from data, such as recognising a face or a voice."
        }
      )
    ],
    4
  ),

  // C. Smart devices
  activity(
    "week-4-smart-devices",
    "How smart devices work",
    "Describe the smart system flow: sensors, data, processing, then a decision or action.",
    "Teaching",
    [
      heading("week-4-sd-h", "How smart devices work"),
      para("week-4-sd-p1", "A smart device senses the world around it and responds. Most follow the same four-step flow: Sensors → Data → Processing → Decision or action."),
      para("week-4-sd-p2", "1. Sensors measure something, such as temperature, movement, sound, light or heart rate."),
      para("week-4-sd-p3", "2. The measurements are stored as data (usually numbers)."),
      para("week-4-sd-p4", "3. Processing: the device, or a cloud service, checks the data and works out what it means."),
      para("week-4-sd-p5", "4. Decision or action: the device does something, such as turning the heating on or sending an alert."),
      para("week-4-sd-p6", "Examples: a smart thermostat, a smartwatch, a smart speaker, a smart doorbell camera and smart lighting."),
      callout("week-4-sd-c", "Smart does not always mean AI", "Some smart devices follow a simple rule, such as a light that switches off after ten minutes with no movement. Others use AI, such as a thermostat that learns your weekly routine. Ask: does it only follow a rule, or does it learn or recognise patterns?"),
      sc(
        "week-4-sd-q1",
        "In a smart thermostat, which part is the sensor?",
        [
          "The temperature sensor that measures how warm the room is",
          "The boiler turning on",
          "The app on your phone",
          "The heating schedule saved in the thermostat"
        ],
        "a",
        "Correct. The temperature sensor measures the room. Its readings become data that the thermostat processes before deciding whether to switch the heating on.",
        "Not quite. The boiler turning on is the action at the end of the flow, and a saved schedule is stored data. The sensor is the part that measures the world: here, the temperature sensor."
      ),
      sc(
        "week-4-sd-q2",
        "A smart light switches off when nobody has moved in a room for ten minutes. Which part of the flow is \"switching off\"?",
        ["Sensor", "Data", "Processing", "Decision or action"],
        "d",
        "Correct. Switching off is the action. This light follows one simple rule (no movement for ten minutes means switch off), so it is smart but does not need AI.",
        "Not quite. The motion sensor detects movement (sensor), its readings are stored (data), and they are checked (processing). Switching the light off is the final decision or action."
      )
    ],
    5
  ),
  activity(
    "week-4-smart-flow",
    "Order the smart system flow",
    "Put the steps of a smart system in the correct order.",
    "Ordering",
    [
      heading("week-4-sf-h", "Order the smart system flow"),
      para("week-4-sf-p", "A smartwatch warns its wearer when their heart rate is unusually high while they are sitting still. The four things the watch does are listed below in the wrong order."),
      classify(
        "week-4-sf-q",
        "Put the watch's actions in order. For each one, choose Step 1 (happens first) to Step 4 (happens last). Use each step once.",
        steps(4),
        [
          { id: "f4", text: "The watch vibrates and shows a warning on the screen", correctCategoryId: "step-4" },
          { id: "f1", text: "A light on the back of the watch detects the wearer's pulse", correctCategoryId: "step-1" },
          { id: "f3", text: "The watch checks the numbers against the wearer's usual resting heart rate", correctCategoryId: "step-3" },
          { id: "f2", text: "Each pulse measurement is saved as a number, such as 118 beats per minute", correctCategoryId: "step-2" }
        ],
        {
          correct: "Correct order. The watch senses the pulse, saves it as data, processes it by comparing with normal, then acts with a warning. That is Sensors → Data → Processing → Decision or action.",
          incorrect: "Not in the right order yet. A smart system must sense something before it has any data. It can only check data it has already saved. The warning is the action, so it comes last."
        }
      )
    ],
    3
  ),
  activity(
    "week-4-iot-and-ai",
    "IoT and AI: not the same thing",
    "Link to Week 2: IoT and AI can work together, but they are not the same thing.",
    "Classification",
    [
      heading("week-4-ia-h", "IoT and AI: not the same thing"),
      para("week-4-ia-p1", "In Week 2 you met the Internet of Things (IoT): everyday devices that connect to the internet and share data. IoT is about connecting and sharing."),
      para("week-4-ia-p2", "AI is about learning from data, recognising patterns and making predictions."),
      para("week-4-ia-p3", "A device can be IoT without any AI, such as a smart plug you switch on from an app. When IoT and AI work together, the connected devices collect the data and AI makes sense of it."),
      sc(
        "week-4-ia-q1",
        "Which statement about IoT and AI is correct?",
        [
          "IoT and AI mean exactly the same thing",
          "Every IoT device uses AI",
          "IoT connects devices to share data; AI can analyse that data. They can work together but are different",
          "AI only works without the internet"
        ],
        "c",
        "Correct. IoT is about connected devices sharing data. AI is about learning from data and making decisions. Together, IoT can collect the data and AI can find patterns in it.",
        "Not quite. Many IoT devices simply send readings or respond to app commands with no AI at all. IoT connects and shares data; AI learns from data. They often work together, but they are not the same."
      ),
      classify(
        "week-4-ia-q2",
        "For each connected device, choose IoT only or IoT and AI together.",
        [
          { id: "iot", label: "IoT only (connects and shares data)" },
          { id: "both", label: "IoT and AI together (also learns or recognises)" }
        ],
        [
          { id: "i1", text: "A smart plug you switch on remotely from a phone app", correctCategoryId: "iot" },
          { id: "i2", text: "A thermostat that learns your weekly routine and adjusts the heating", correctCategoryId: "both" },
          { id: "i3", text: "A fridge that sends its temperature reading to your phone", correctCategoryId: "iot" },
          { id: "i4", text: "A doorbell camera that recognises the difference between a person and a parcel", correctCategoryId: "both" },
          { id: "i5", text: "A fitness tracker that uploads your step count to an app", correctCategoryId: "iot" },
          { id: "i6", text: "A smart speaker that understands a spoken request", correctCategoryId: "both" }
        ],
        {
          correct: "Well done. Sending readings or responding to app commands is IoT. Learning routines, recognising images or understanding speech adds AI.",
          incorrect: "Some are not right yet. Ask: does the device only connect and share data, or does it also learn, recognise or predict? Uploading a step count is IoT only. Recognising a person in a camera image needs AI."
        }
      )
    ],
    6
  ),

  // D. Robots
  activity(
    "week-4-robots",
    "What is a robot?",
    "Describe robots in terms of sensors, a controller and actuators, and compare programmed and AI-enabled behaviour.",
    "Teaching",
    [
      heading("week-4-rb-h", "What is a robot?"),
      para("week-4-rb-p1", "A robot is a machine that can sense its surroundings and carry out physical actions. Most robots have three main parts."),
      para("week-4-rb-p2", "Sensors take information in, for example cameras, bump sensors and distance sensors."),
      para("week-4-rb-p3", "The controller is the robot's computer. It runs the program and decides what to do."),
      para("week-4-rb-p4", "Actuators make the robot move or do physical work, for example motors, wheels, grippers and arms."),
      para("week-4-rb-p5", "Programmed behaviour means the robot follows fixed steps, such as a factory arm welding the same spot on every car. AI-enabled behaviour means the robot can recognise things and adapt, such as a delivery robot spotting an obstacle and finding a way round it."),
      para("week-4-rb-p6", "Robots are used in manufacturing, warehouses, homes (robot vacuums), deliveries, self-driving vehicles and hospitals, where they can help surgeons or carry medicines between wards."),
      callout("week-4-rb-c", "A robot is not automatically AI", "Many robots just repeat programmed movements very accurately. A robot only uses AI if it can learn, recognise or adapt, for example by recognising objects with a camera."),
      sc(
        "week-4-rb-q1",
        "Which part of a robot makes it physically move, for example its wheels or gripper?",
        ["Sensor", "Controller", "Actuator", "Data"],
        "c",
        "Correct. Actuators, such as motors, wheels and grippers, turn the controller's decisions into physical movement.",
        "Not quite. Sensors gather information and the controller decides what to do. The parts that actually move, such as motors, wheels and grippers, are actuators."
      ),
      sc(
        "week-4-rb-q2",
        "A factory robot arm places a lid on every jar in exactly the same way, all day. Which is true?",
        [
          "It must be AI because it is a robot",
          "It is a robot following programmed behaviour, so it does not need AI",
          "It is not a robot because it does not walk",
          "It is IoT because it is in a factory"
        ],
        "b",
        "Correct. Repeating the same programmed movement is robotics without AI. Robots only use AI when they need to recognise, learn or adapt.",
        "Not quite. Being a robot does not make something AI, and robots do not need to walk. This arm follows the same programmed steps each time, so it is robotics without AI."
      )
    ],
    5
  ),
  activity(
    "week-4-robot-parts",
    "Match robot parts to their role",
    "Match robot components to sensor, controller or actuator.",
    "Matching",
    [
      heading("week-4-rp-h", "Match robot parts to their role"),
      para("week-4-rp-p", "A robot vacuum cleaner has several parts. Sensors take information in, the controller decides, and actuators act."),
      classify(
        "week-4-rp-q",
        "Match each robot vacuum part to its role: Sensor, Controller or Actuator.",
        [
          { id: "sensor", label: "Sensor" },
          { id: "controller", label: "Controller" },
          { id: "actuator", label: "Actuator" }
        ],
        [
          { id: "p1", text: "Bump sensor on the front edge", correctCategoryId: "sensor" },
          { id: "p2", text: "Motors that turn the wheels", correctCategoryId: "actuator" },
          { id: "p3", text: "Onboard computer running the cleaning program", correctCategoryId: "controller" },
          { id: "p4", text: "Cliff sensor that detects the top of the stairs", correctCategoryId: "sensor" },
          { id: "p5", text: "Spinning brush that sweeps up dust", correctCategoryId: "actuator" },
          { id: "p6", text: "Camera that detects objects in the room", correctCategoryId: "sensor" }
        ],
        {
          correct: "Well done. Bump, cliff and camera sensors take information in. The onboard computer decides. Wheel motors and brushes carry out the actions.",
          incorrect: "Some are not right yet. If a part gathers information, it is a sensor (a camera is a sensor too). If it decides, it is the controller. If it moves or does physical work, it is an actuator."
        }
      )
    ],
    3
  ),
  activity(
    "week-4-automation-vs-ai",
    "Predetermined automation or AI-enabled?",
    "Classify behaviours as predetermined automation or AI-enabled behaviour.",
    "Classification",
    [
      heading("week-4-ava-h", "Predetermined automation or AI-enabled?"),
      para("week-4-ava-p1", "Automation means a machine or program does a job without a person doing it by hand."),
      para("week-4-ava-p2", "Predetermined means decided in advance. Predetermined automation follows steps that a person set up, and does the same thing every time the same thing happens."),
      para("week-4-ava-p3", "AI-enabled behaviour can cope with new situations by recognising patterns or learning from data."),
      callout("week-4-ava-c", "Automation is not the same as AI", "A machine can be fully automatic and still use no AI at all. Using a sensor does not make something AI either: automatic doors use a sensor but always do the same thing."),
      classify(
        "week-4-ava-q",
        "For each behaviour, choose Predetermined automation or AI-enabled behaviour.",
        [
          { id: "auto", label: "Predetermined automation" },
          { id: "ai", label: "AI-enabled behaviour" }
        ],
        [
          { id: "v1", text: "A car-wash machine runs the same wash cycle for every car", correctCategoryId: "auto" },
          { id: "v2", text: "A delivery robot recognises a dog on the pavement and steers around it", correctCategoryId: "ai" },
          { id: "v3", text: "A bottling machine fills each bottle with exactly 500 ml", correctCategoryId: "auto" },
          { id: "v4", text: "A robot vacuum builds a map of your home and learns the fastest cleaning route", correctCategoryId: "ai" },
          { id: "v5", text: "Automatic doors open whenever the motion sensor is triggered", correctCategoryId: "auto" },
          { id: "v6", text: "A hospital robot recognises which ward it is in from camera images", correctCategoryId: "ai" },
          { id: "v7", text: "A traffic light changes colour every 60 seconds on a fixed timer", correctCategoryId: "auto" },
          { id: "v8", text: "A self-driving car predicts that a cyclist is about to turn and slows down", correctCategoryId: "ai" }
        ],
        {
          correct: "Well done. Fixed cycles, set amounts and timers are predetermined. Recognising objects, learning a map and predicting what people will do are AI-enabled.",
          incorrect: "Some are not right yet. Ask: would it behave exactly the same way every time? If yes, it is predetermined, even if it uses a sensor like the automatic doors. AI-enabled behaviour recognises, learns or predicts, like spotting a dog and steering around it."
        }
      )
    ],
    6
  ),
  activity(
    "week-4-robot-types",
    "Extension: Automation, robotics, AI or a combination?",
    "Classify examples as automation, robotics, AI or a combination of robotics and AI.",
    "Extension",
    [
      heading("week-4-rt-h", "Extension: Automation, robotics, AI or a combination?"),
      para("week-4-rt-p1", "This board has four groups:"),
      para("week-4-rt-p2", "Automation only: software that follows fixed rules. No robot and no AI."),
      para("week-4-rt-p3", "Robotics only: a physical robot that follows programmed steps. No AI."),
      para("week-4-rt-p4", "AI only: software that learns or recognises patterns. No robot body."),
      para("week-4-rt-p5", "Robotics and AI combined: a physical robot that also uses AI."),
      callout("week-4-rt-c", "Two questions to ask", "1. Is there a physical machine that moves? 2. Does it learn, recognise or predict? Yes and yes means combined. No and no means automation only."),
      classify(
        "week-4-rt-q",
        "For each example, choose one of the four groups.",
        [
          { id: "automation", label: "Automation only" },
          { id: "robotics", label: "Robotics only" },
          { id: "ai", label: "AI only" },
          { id: "combination", label: "Robotics and AI combined" }
        ],
        [
          { id: "t1", text: "Payroll software pays staff every Friday using fixed rules", correctCategoryId: "automation" },
          { id: "t2", text: "A robot lawnmower drives back and forth inside a boundary wire", correctCategoryId: "robotics" },
          { id: "t3", text: "A photo app groups pictures by recognising faces", correctCategoryId: "ai" },
          { id: "t4", text: "A farm drone uses its camera to spot unhealthy crops and flies over to them", correctCategoryId: "combination" },
          { id: "t5", text: "An email system sends an automatic \"out of office\" reply", correctCategoryId: "automation" },
          { id: "t6", text: "A basic robot vacuum that bumps into walls and turns in a random direction", correctCategoryId: "robotics" },
          { id: "t7", text: "A chatbot on a website understands typed questions", correctCategoryId: "ai" },
          { id: "t8", text: "A warehouse robot uses a camera to recognise items and pick the right one", correctCategoryId: "combination" }
        ],
        {
          correct: "Well done. Payroll and auto-replies are software following rules. The lawnmower and basic vacuum are robots without AI. Face grouping and chatbots are AI without a robot body. The farm drone and item-picking robot combine both.",
          incorrect: "Some are not right yet. Check two things: is there a physical machine that moves (robotics)? Does it learn, recognise or predict (AI)? If both, it is a combination. If neither, it is automation only."
        }
      )
    ],
    7
  ),

  // E. Neural networks
  activity(
    "week-4-neural-networks",
    "What is a neural network?",
    "Outline a neural network as inputs passing through connected nodes to produce an output.",
    "Teaching",
    [
      heading("week-4-nn-h", "What is a neural network?"),
      para("week-4-nn-p1", "A neural network is a type of AI that is especially good at recognising patterns, such as spotting a cat in a photo."),
      para("week-4-nn-p2", "It is made of many small processing units called nodes. The nodes are connected to each other and arranged in rows called layers."),
      para("week-4-nn-p3", "It works in three stages: Inputs → Connected nodes → Output."),
      para("week-4-nn-p4", "Inputs: the data goes in. For a photo, this is the colour of each tiny dot (pixel) in the picture."),
      para("week-4-nn-p5", "Connected nodes: the data passes through the layers. Early layers pick out simple patterns, such as edges. Later layers combine these into bigger features, such as ears or whiskers."),
      para("week-4-nn-p6", "Output: the network gives its answer, such as \"cat: 92% likely\"."),
      para("week-4-nn-p7", "A network can only do this after it has been trained on lots of examples. You will see how training works shortly."),
      callout("week-4-nn-c", "Common misconception", "The idea of connected nodes was loosely inspired by brain cells, but a neural network is not a brain. It does not understand, think or feel like a person. It finds patterns in data, and only the kinds of patterns it has been trained on."),
      sc(
        "week-4-nn-q1",
        "Which description best matches a neural network?",
        [
          "Inputs pass through layers of connected nodes to produce an output",
          "A cable network that connects computers in an office",
          "A human brain placed inside a computer",
          "A list of fixed if-then rules written by a programmer"
        ],
        "a",
        "Correct. A neural network takes inputs, passes them through layers of connected nodes that pick out patterns, and produces an output.",
        "Not quite. Despite the word \"network\", it has nothing to do with cables between computers, and it is not a real brain. It is also not a list of fixed rules: it learns patterns from examples. The structure is inputs → connected nodes → output."
      ),
      sc(
        "week-4-nn-q2",
        "A friend says: \"Neural networks think and understand just like humans do.\" What is the best response?",
        [
          "That is true; they have feelings too",
          "That is not accurate: they find patterns in data they have been trained on but do not think or understand like people",
          "That is true, but only on smartphones",
          "Neural networks cannot do anything useful"
        ],
        "b",
        "Correct. Neural networks are loosely inspired by the brain, but they are pattern-finding tools. They do not understand meaning, have feelings or use human judgement.",
        "Not quite. Neural networks are useful, but they do not think, understand or feel. They find patterns in the data they were trained on, and can get things badly wrong outside that data."
      )
    ],
    6
  ),
  activity(
    "week-4-nn-flow",
    "Order the neural network flow",
    "Order the steps a trained neural network follows when it identifies a new photo.",
    "Ordering",
    [
      heading("week-4-nf-h", "Order the neural network flow"),
      para("week-4-nf-p", "A neural network that has already been trained to recognise animals is given a new photo. What happens inside it is listed below in the wrong order."),
      classify(
        "week-4-nf-q",
        "Put the stages in order. For each one, choose Step 1 (happens first) to Step 4 (happens last). Use each step once.",
        steps(4),
        [
          { id: "n3", text: "Later layers combine those patterns into features such as ears and whiskers", correctCategoryId: "step-3" },
          { id: "n1", text: "The colour of each pixel in the photo goes in as input data", correctCategoryId: "step-1" },
          { id: "n4", text: "The network gives its answer: \"cat: 92% likely\"", correctCategoryId: "step-4" },
          { id: "n2", text: "Early layers of connected nodes pick out simple patterns, such as edges", correctCategoryId: "step-2" }
        ],
        {
          correct: "Correct order. Inputs, then connected nodes finding simple patterns, then bigger features, then the output. The answer always comes last.",
          incorrect: "Not in the right order yet. The photo has to go in as input data first. Simple patterns such as edges are found before bigger features such as ears. The answer (the output) comes last."
        }
      )
    ],
    3
  ),
  activity(
    "week-4-nn-training",
    "How a neural network learns",
    "Explain training with a cat and dog example, and why good data matters.",
    "Teaching",
    [
      heading("week-4-nt-h", "How a neural network learns"),
      para("week-4-nt-p1", "Training is how a neural network learns. Imagine teaching one to tell cats from dogs."),
      para("week-4-nt-p2", "1. People collect thousands of photos and label each one \"cat\" or \"dog\"."),
      para("week-4-nt-p3", "2. The network looks at a photo and guesses. At first, its guesses are almost random."),
      para("week-4-nt-p4", "3. It is told the correct label and adjusts its connections a little, so it is more likely to be right next time. This repeats thousands of times."),
      para("week-4-nt-p5", "4. It is tested on photos it has never seen. If it does well, it has learned general patterns, not just memorised the training photos."),
      callout("week-4-nt-c", "Data matters, and mistakes still happen", "A network can only learn from the examples it is given. If the training photos are limited or unbalanced, its answers will be too. Even a well-trained network still gets some answers wrong, for example a fluffy dog in a dark photo."),
      classify(
        "week-4-nt-q1",
        "Put the training stages in order. For each one, choose Step 1 (happens first) to Step 4 (happens last). Use each step once.",
        steps(4),
        [
          { id: "t4", text: "It is given photos it has never seen, to check how well it has learned", correctCategoryId: "step-4" },
          { id: "t2", text: "It is shown a photo and guesses whether it is a cat or a dog", correctCategoryId: "step-2" },
          { id: "t1", text: "Lots of animal photos are gathered and each one is labelled", correctCategoryId: "step-1" },
          { id: "t3", text: "It finds out the right answer and adjusts its connections slightly", correctCategoryId: "step-3" }
        ],
        {
          correct: "Correct order. Labelled data first, then guess, compare and adjust (repeated many times), then test on unseen photos.",
          incorrect: "Not in the right order yet. You cannot train without labelled examples, so collecting them comes first. Testing on new photos comes last, to check the network learned general patterns."
        }
      ),
      sc(
        "week-4-nt-q2",
        "A network was trained only on photos of ginger cats. It then fails to recognise a black cat. What is the most likely reason?",
        [
          "Black cats are not really cats",
          "The training data was too limited, so it never learned what other cats look like",
          "The network was switched off",
          "Neural networks cannot recognise animals"
        ],
        "b",
        "Correct. The network only learned from ginger cats, so it did not learn that cats can be other colours. Varied, balanced training data leads to better results.",
        "Not quite. Neural networks can recognise animals, but only from patterns in their training data. With only ginger cats to learn from, the network has never seen what a black cat looks like."
      )
    ],
    7
  ),
  activity(
    "week-4-nn-applications",
    "Extension: Where neural networks are used",
    "Match real uses to neural network applications: image, speech, handwriting, recommendations and fraud detection.",
    "Extension",
    [
      heading("week-4-na-h", "Extension: Where neural networks are used"),
      para("week-4-na-p1", "Neural networks are used wherever there are patterns in large amounts of data. Five common uses are:"),
      para("week-4-na-p2", "Image recognition: identifying objects or people in pictures, such as a plant-identifying app."),
      para("week-4-na-p3", "Speech recognition: working out which words someone has spoken, such as live captions on a video call."),
      para("week-4-na-p4", "Handwriting recognition: reading handwritten letters and numbers, such as a tablet turning your notes into typed text."),
      para("week-4-na-p5", "Recommendations: suggesting what you might like next, based on past choices, such as a music app."),
      para("week-4-na-p6", "Fraud detection: spotting activity that looks unusual and might be criminal, such as a bank checking card payments."),
      classify(
        "week-4-na-q",
        "Match each real use to one of the five types of application.",
        [
          { id: "image", label: "Image recognition" },
          { id: "speech", label: "Speech recognition" },
          { id: "handwriting", label: "Handwriting recognition" },
          { id: "recommend", label: "Recommendations" },
          { id: "fraud", label: "Fraud detection" }
        ],
        [
          { id: "u1", text: "A phone unlocks when it recognises its owner's face", correctCategoryId: "image" },
          { id: "u2", text: "A voice assistant turns spoken words into text", correctCategoryId: "speech" },
          { id: "u3", text: "A postal machine reads handwritten postcodes on envelopes", correctCategoryId: "handwriting" },
          { id: "u4", text: "An online shop suggests products similar to your past purchases", correctCategoryId: "recommend" },
          { id: "u5", text: "A bank blocks an unusual card payment made abroad at 3am", correctCategoryId: "fraud" },
          { id: "u6", text: "A hospital system highlights possible problems on X-ray images for a doctor to check", correctCategoryId: "image" }
        ],
        {
          correct: "Well done. Faces and X-rays are image recognition, spoken words are speech recognition, postcodes are handwriting recognition, product suggestions are recommendations, and unusual payments are fraud detection.",
          incorrect: "Some are not right yet. Ask what kind of data is being analysed: pictures (image), voices (speech), written letters and numbers (handwriting), past choices (recommendations) or unusual payment patterns (fraud)."
        }
      )
    ],
    6
  ),

  // F. Benefits and limitations
  activity(
    "week-4-benefits-limitations",
    "Benefits and limitations of AI",
    "Classify benefits and limitations of AI and intelligent computing.",
    "Classification",
    [
      heading("week-4-bl-h", "Benefits and limitations of AI"),
      para("week-4-bl-p1", "Benefits. AI can:"),
      para("week-4-bl-p2", "work very fast; automate repetitive tasks; analyse huge amounts of data (often called big data); give consistent results; spot patterns people might miss; and work day and night without breaks."),
      para("week-4-bl-p3", "Limitations. AI:"),
      para("week-4-bl-p4", "is only as good as its data; can make mistakes; can be biased, meaning unfair to some groups, if its training data was unbalanced; can be expensive to build and run; can raise privacy concerns because it often collects personal data; and lacks human judgement, empathy and common sense."),
      callout("week-4-bl-c", "Spotting patterns is not the same as judgement", "An AI can recognise patterns very well and still make a poor decision in an unusual situation, because it does not understand people's circumstances the way a person does."),
      classify(
        "week-4-bl-q",
        "For each statement, choose Benefit or Limitation.",
        [
          { id: "benefit", label: "Benefit" },
          { id: "limitation", label: "Limitation" }
        ],
        [
          { id: "b1", text: "Checks thousands of bank transactions per second", correctCategoryId: "benefit" },
          { id: "b2", text: "Gives unfair results if its training data was biased", correctCategoryId: "limitation" },
          { id: "b3", text: "Can run 24 hours a day without getting tired", correctCategoryId: "benefit" },
          { id: "b4", text: "May collect personal data such as voice recordings", correctCategoryId: "limitation" },
          { id: "b5", text: "Spots patterns in medical scans that people might miss", correctCategoryId: "benefit" },
          { id: "b6", text: "Can be expensive to develop, train and maintain", correctCategoryId: "limitation" },
          { id: "b7", text: "Checks every product on a production line to the same standard, without getting bored", correctCategoryId: "benefit" },
          { id: "b8", text: "Cannot use empathy or common sense in unusual situations", correctCategoryId: "limitation" }
        ],
        {
          correct: "Well done. Speed, working continuously, pattern recognition and consistency are benefits. Bias, privacy, cost and lack of human judgement are limitations.",
          incorrect: "Some are not right yet. Benefits are things AI does well: speed, consistency, continuous work and finding patterns. Limitations are risks or weaknesses: bias from data, privacy, cost and no real human judgement."
        }
      )
    ],
    7
  ),
  activity(
    "week-4-limitations-check",
    "Extension: Limitations in practice",
    "Apply ideas about bias, errors, privacy and human judgement to short scenarios.",
    "Extension",
    [
      heading("week-4-lc-h", "Extension: Limitations in practice"),
      para("week-4-lc-p", "Each scenario shows one limitation. Choose the limitation it shows best."),
      sc(
        "week-4-lc-q1",
        "A face recognition system works well for some groups of people but often fails for others. Its training photos mostly showed one group. Which limitation does this show?",
        ["High cost", "Bias caused by unbalanced training data", "Privacy", "Lack of empathy"],
        "b",
        "Correct. The training data did not represent everyone fairly, so the AI is less accurate for some groups. That is bias, and it comes from the data.",
        "Not quite. The clue is that the system fails for groups that were missing from its training photos. Unfair results caused by unbalanced data are called bias."
      ),
      sc(
        "week-4-lc-q2",
        "A smart speaker is always listening for its wake word, and some recordings are stored on the provider's servers. Which limitation is this?",
        ["Bias", "Privacy", "High cost", "It can make mistakes"],
        "b",
        "Correct. Collecting and storing voice recordings raises privacy concerns about who can access personal data and how it is used.",
        "Not quite. Nothing here is unfair to a group (bias) or about money (cost). The concern is that recordings of people's voices are being collected and stored, which is a privacy issue."
      ),
      sc(
        "week-4-lc-q3",
        "An AI system suggests refusing a customer's refund. The customer's situation is unusual and upsetting. Why should a person review the decision?",
        [
          "Because AI is always wrong",
          "Because AI lacks human judgement and empathy, and may not handle unusual cases well",
          "Because people are always faster than AI",
          "Because AI cannot read numbers"
        ],
        "b",
        "Correct. AI can be helpful, but it lacks human judgement and empathy. Unusual or sensitive cases often need a person to review the decision.",
        "Not quite. AI is not always wrong and it is usually faster than people. The issue is that it lacks human judgement and empathy, which matter most in unusual or sensitive cases."
      )
    ],
    4
  ),

  // G. Applied scenarios
  activity(
    "week-4-game-npc",
    "Scenario: a game character that adapts",
    "Decide whether two adapting game characters use AI, and what data an AI character learns from.",
    "Application",
    [
      heading("week-4-npc-h", "Scenario: a game character that adapts"),
      para("week-4-npc-p1", "A non-player character (NPC) is a character in a game that the computer controls. Two fighting games both have an enemy NPC that changes as you play."),
      para("week-4-npc-p2", "Game A: the designers wrote a rule. If you lose three fights in a row, the enemy's health drops by 20%."),
      para("week-4-npc-p3", "Game B: over many fights, the enemy notices that you usually attack from the left. It starts guarding its left side and tries new tactics you have not seen before."),
      sc(
        "week-4-npc-q1",
        "Both enemies change as you play. Which one shows AI-enabled behaviour?",
        [
          "Game A, because it changes the difficulty automatically",
          "Game B, because it recognises patterns in how you play and adapts to them",
          "Both, because anything that adapts is AI",
          "Neither, because games cannot use AI"
        ],
        "b",
        "Correct. Game B spots a pattern in your play and responds to it. Game A only follows a rule the designers wrote in advance, so it is automatic but not AI.",
        "Not quite. Changing automatically is not the same as AI. Game A follows one fixed rule the designers wrote (three losses means less health). Game B recognises a pattern in how you fight and adapts, which is AI-enabled behaviour."
      ),
      sc(
        "week-4-npc-q2",
        "What data does the Game B enemy need to learn from?",
        [
          "Records of your moves in past fights, such as which side you attack from",
          "The game's fixed rule about losing three fights",
          "Your screen brightness setting",
          "The make of your games console"
        ],
        "a",
        "Correct. To spot your habits, the enemy needs data about what you actually do in fights, collected over many games.",
        "Not quite. A fixed rule is what Game A uses, not something to learn from, and screen settings or the console make say nothing about how you fight. To learn your habits, the enemy needs records of your moves."
      )
    ],
    4
  ),
  activity(
    "week-4-smart-gaming",
    "Extension: Scenario: a smart gaming setup",
    "Select which data a smart gaming setup needs and identify a privacy concern.",
    "Extension",
    [
      heading("week-4-sg-h", "Extension: Scenario: a smart gaming setup"),
      para("week-4-sg-p1", "A smart gaming setup has three jobs:"),
      para("week-4-sg-p2", "1. Change the colour of the room lights to match what is happening in the game."),
      para("week-4-sg-p3", "2. Dim the lights when the room is bright."),
      para("week-4-sg-p4", "3. Turn the game volume down when someone speaks to the player."),
      para("week-4-sg-p5", "A well-designed device should only collect the data it needs for its jobs. Collecting extra personal data creates privacy risks."),
      classify(
        "week-4-sg-q1",
        "Which data does the setup need? For each item, choose Needed if one of the three jobs cannot work without it, or Not needed if none of the jobs uses it.",
        [
          { id: "needed", label: "Needed" },
          { id: "not-needed", label: "Not needed" }
        ],
        [
          { id: "g1", text: "Game events, such as an explosion or a boss battle starting", correctCategoryId: "needed" },
          { id: "g2", text: "Light level readings from a light sensor in the room", correctCategoryId: "needed" },
          { id: "g3", text: "Microphone input to detect when someone starts speaking", correctCategoryId: "needed" },
          { id: "g4", text: "The player's heart rate from a smartwatch", correctCategoryId: "not-needed" },
          { id: "g5", text: "Full recordings of everything said in the room, stored online", correctCategoryId: "not-needed" },
          { id: "g6", text: "The player's location from their phone's GPS", correctCategoryId: "not-needed" }
        ],
        {
          correct: "Well done. Game events, light readings and detecting speech are each needed for one job. Heart rate and location are not used by any job, and the setup only needs to notice that someone is speaking, not record and store what they say.",
          incorrect: "Some are not right yet. Link each item to a job: game events for the colours, the light sensor for dimming, the microphone for the volume. Heart rate and location are not used by any job, and detecting speech does not require storing full recordings online."
        }
      ),
      short(
        "week-4-sg-q2",
        "The setup uses a microphone that is always on. Describe one privacy concern and one way to reduce it.",
        "Write at least 200 characters. Name one privacy concern and one sensible way to reduce it, for example a mute button or processing sound only on the device. Paste is disabled.",
        200
      )
    ],
    11
  ),
  activity(
    "week-4-warehouse-robot",
    "Scenario: a warehouse robot",
    "Identify the sensors and inputs, processing and actions of a warehouse robot.",
    "Application",
    [
      heading("week-4-wr-h", "Scenario: a warehouse robot"),
      para("week-4-wr-p", "An online shop uses robots in its warehouse. Each robot drives to a shelf, uses a camera to recognise the correct item, picks it up with a gripper and carries it to a packing station. It slows down if a worker walks in front of it."),
      classify(
        "week-4-wr-q1",
        "For each part of the robot's work, choose Sensor or input, Processing, or Action.",
        [
          { id: "input", label: "Sensor or input" },
          { id: "processing", label: "Processing" },
          { id: "action", label: "Action" }
        ],
        [
          { id: "w1", text: "A camera captures images of items on the shelf", correctCategoryId: "input" },
          { id: "w2", text: "A distance sensor detects a worker in the path", correctCategoryId: "input" },
          { id: "w3", text: "AI software recognises which item matches the order", correctCategoryId: "processing" },
          { id: "w4", text: "The controller plans the quickest safe route to the packing station", correctCategoryId: "processing" },
          { id: "w5", text: "The gripper picks up the item", correctCategoryId: "action" },
          { id: "w6", text: "The wheels slow down and stop", correctCategoryId: "action" }
        ],
        {
          correct: "Well done. Cameras and distance sensors provide the inputs. Recognising items and planning routes is processing. Gripping and slowing down are actions carried out by actuators.",
          incorrect: "Some are not right yet. Inputs come from sensors such as cameras. Processing is the thinking step, such as recognising the item or planning a route. Actions are physical movements, such as gripping or stopping."
        }
      ),
      sc(
        "week-4-wr-q2",
        "Which part of the warehouse robot's work is AI-enabled rather than simple programmed movement?",
        [
          "Recognising the correct item from camera images",
          "Driving forward when told to",
          "Opening and closing the gripper",
          "Stopping when its battery is empty"
        ],
        "a",
        "Correct. Recognising items from camera images needs pattern recognition, which is AI. Driving, gripping and stopping can all be simple programmed actions.",
        "Not quite. Driving, gripping and stopping on low battery can all be programmed with fixed rules. Recognising the correct item from images needs AI pattern recognition."
      )
    ],
    6
  ),
  activity(
    "week-4-image-recognition",
    "Scenario: spotting prohibited objects",
    "Apply image recognition to screening bags for prohibited objects, including benefits and limitations.",
    "Application",
    [
      heading("week-4-ir-h", "Scenario: spotting prohibited objects"),
      para("week-4-ir-p", "A concert venue scans bags with an X-ray machine. An image recognition system checks each scan and flags any bag that might contain a prohibited object, such as a knife or a glass bottle. Security staff then check every flagged bag by hand."),
      sc(
        "week-4-ir-q1",
        "What is the input to the image recognition system?",
        [
          "The X-ray image of each bag",
          "The warning on screen that a bag might contain a knife",
          "The security guard's decision after checking the bag",
          "The list of prohibited items printed at the entrance"
        ],
        "a",
        "Correct. The X-ray image goes in (input). The warning on screen is the output, and the guard's check happens afterwards.",
        "Not quite. The input is what goes into the system: the X-ray image of each bag. The on-screen warning is the output, and the guard's decision comes after the system has finished."
      ),
      sc(
        "week-4-ir-q2",
        "Why must the system be trained on thousands of scans showing prohibited objects in many different positions?",
        [
          "So that it can recognise objects even when they are turned, hidden or partly covered",
          "So that it runs without electricity",
          "So that it never needs updating",
          "So that it can read the owner's name"
        ],
        "a",
        "Correct. Varied training examples help the system recognise objects from different angles and positions, instead of only the exact examples it has seen.",
        "Not quite. Training data is about accuracy. The system needs many varied examples so it can still recognise a knife or bottle when it is turned, hidden or partly covered."
      ),
      sc(
        "week-4-ir-q3",
        "Why do security staff still check flagged bags by hand?",
        [
          "Because the system can make mistakes, such as flagging a harmless object or missing a real one",
          "Because AI is never useful",
          "Because staff are faster than the system at scanning every bag",
          "Because image recognition cannot see inside bags"
        ],
        "a",
        "Correct. Image recognition can make errors in both directions. A person checks the flagged bags so decisions are not left to the AI alone.",
        "Not quite. The system is useful and fast, but it can make errors: flagging a harmless umbrella, or missing a real knife. Human checks add judgement and catch mistakes."
      ),
      short(
        "week-4-ir-q4",
        "Give one benefit and one limitation of using image recognition to screen bags at the venue.",
        "Write at least 200 characters. Give one benefit, such as speed or consistency, and one limitation, such as errors, bias or cost. Explain each briefly. Paste is disabled.",
        200
      )
    ],
    12
  ),

  // Mixed knowledge check
  activity(
    "week-4-knowledge-check",
    "Mixed knowledge check",
    "Apply everything from Week 4 to new situations.",
    "Knowledge check",
    [
      heading("week-4-kc-h", "Mixed knowledge check"),
      para("week-4-kc-p", "These questions mix ideas from the whole week. Read each situation carefully and apply what you have learned."),
      sc(
        "week-4-kc-q1",
        "A school's online booking form checks that every email address contains an @ symbol before it is accepted. Is this AI?",
        [
          "Yes, because it checks data automatically",
          "No, it follows one fixed rule written by a programmer",
          "Yes, because it runs online",
          "Yes, because it uses the cloud"
        ],
        "b",
        "Correct. Checking for an @ symbol is a single fixed rule. Being automatic or online does not make software AI.",
        "Not quite. Working automatically, online or in the cloud does not make software AI. Checking for an @ symbol is one fixed rule, so it is rule-based."
      ),
      sc(
        "week-4-kc-q2",
        "A smart doorbell notices movement, records a short clip, recognises that the visitor is a delivery driver and sends you a notification. Which part is the processing step?",
        [
          "Noticing the movement",
          "Recording the clip",
          "Recognising that the visitor is a delivery driver",
          "Sending the notification"
        ],
        "c",
        "Correct. Recognising who is at the door is the processing step, and it uses AI image recognition. Movement is sensed, the clip is data, and the notification is the action.",
        "Not quite. Follow the flow: noticing movement is the sensor, the clip is the data, and the notification is the action. Recognising the visitor is the processing step."
      ),
      sc(
        "week-4-kc-q3",
        "A hospital uses a robot that follows lines on the floor to carry medicines between wards. It stops when its bump sensor is pressed. Which best describes it?",
        [
          "A robot using programmed behaviour, not AI",
          "AI software with no robot body",
          "A neural network",
          "A DaaS service"
        ],
        "a",
        "Correct. It has sensors and actuators, so it is a robot, but following lines and stopping on a bump are fixed rules. It does not need AI.",
        "Not quite. It is a physical machine with sensors and actuators, so it is a robot. Following lines and stopping when bumped are fixed rules, so it uses programmed behaviour rather than AI."
      ),
      sc(
        "week-4-kc-q4",
        "A company wants a neural network to spot fraudulent card payments. What does it need first?",
        [
          "Lots of past payment records, each labelled as fraudulent or genuine",
          "One fixed rule, such as \"block every payment over £100\"",
          "A robot to watch the bank's cash machines",
          "Only customers' names and home addresses"
        ],
        "a",
        "Correct. A neural network learns from labelled examples. Past payments marked as fraudulent or genuine let it learn the patterns of fraud.",
        "Not quite. A single fixed rule would be rule-based, not a neural network, and names or addresses alone show no payment patterns. A neural network learns from labelled examples: many past payments marked as fraudulent or genuine."
      ),
      sc(
        "week-4-kc-q5",
        "Fridge 1 sends a photo of its shelves to your phone when you ask. Fridge 2 also recognises which foods are running low and adds them to your shopping list. Which statement is correct?",
        [
          "Both fridges use AI because they are both connected to the internet",
          "Fridge 1 is IoT only; Fridge 2 is IoT and AI working together",
          "Neither fridge is IoT because fridges are not computers",
          "Fridge 1 uses AI because it takes a photo"
        ],
        "b",
        "Correct. Both are IoT because they connect and share data. Only Fridge 2 recognises what is in the photo and makes a decision, so only Fridge 2 adds AI.",
        "Not quite. Being connected makes a device IoT, not AI, and taking a photo is just sensing. Fridge 2 recognises the foods in the image and acts on it, which is where the AI comes in."
      ),
      sc(
        "week-4-kc-q6",
        "A bank discovers that its loan AI was trained mostly on data from one age group, and it is refusing more loans to older customers. What is the best thing for the bank to do?",
        [
          "Keep using it unchanged, because AI decisions are always fair",
          "Retrain it with data that represents all age groups, and have a person review refused applications",
          "Make the AI run faster so it can process more applications",
          "Stop telling customers that AI is used"
        ],
        "b",
        "Correct. Better, more balanced data tackles the cause of the bias, and a human review adds judgement for important decisions about people.",
        "Not quite. AI is not automatically fair: it copies patterns from its data, including unfair ones. Speed does not fix bias, and hiding it makes things worse. The bank should retrain with balanced data and have people review refusals."
      )
    ],
    8
  ),
  activity(
    "week-4-reflection",
    "Extension: AI technology profile",
    "Write a short profile of one AI-enabled device or system.",
    "Extension",
    [
      heading("week-4-ref-h", "Extension: AI technology profile"),
      para("week-4-ref-p", "Independent task: build a short profile you could reuse when outlining technologies for AC1.1 practice. This is formative, not Gateway assignment evidence."),
      reflection(
        "week-4-ref-q",
        "Choose one AI-enabled device or system, such as a smart speaker, robot vacuum, self-driving car or recommendation system. Explain what it does, what data or sensors it uses, what the AI part does, one benefit and one limitation.",
        500,
        "Cover what it does, the data or sensors, what the AI does, one benefit and one limitation. Write at least 500 characters. Paste is disabled."
      )
    ],
    13
  ),
  activity(
    "week-4-exit",
    "Exit ticket",
    "Quick check that you can outline AI, smart devices, robots and neural networks, and rate your confidence.",
    "Exit ticket",
    [
      heading("week-4-exit-h", "Exit ticket"),
      sc(
        "week-4-exit-q1",
        "Which statement is correct?",
        [
          "Every robot uses AI",
          "Every program is AI",
          "A robot can follow programmed steps without AI, and AI can run with no robot body",
          "Neural networks think exactly like humans"
        ],
        "c",
        "Correct. Robotics and AI are different things that can work together. Many robots follow fixed programs, and much AI is software only.",
        "Not quite. Not every robot or program uses AI, and neural networks do not think like humans. Robots can run without AI, and AI can run without a robot body."
      ),
      sc(
        "week-4-exit-q2",
        "How confident are you outlining AI, smart devices, robots and neural networks?",
        [
          "Not yet. I need another look at the definitions.",
          "Getting there. I can give an example for most of them.",
          "Confident. I can explain each one and give a benefit and a limitation."
        ],
        "c",
        "Use this rating to decide what to revise before Assignment 1 practice."
      )
    ],
    2
  )
];

const activityIds = week4Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const existing = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek4 = existing.filter((item) => !String(item.id || "").startsWith("week-4-"));
fs.writeFileSync(activitiesPath, `${JSON.stringify([...withoutWeek4, ...week4Activities], null, 2)}\n`);

const sessionsPath = path.join(ROOT, "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8")).filter((item) => item.id !== "week-4-session");
sessions.push(envelope(
  "lp.content.session",
  "week-4-session",
  "0.1.0",
  {
    title: "Week 4 session",
    kind: "session",
    summary: "One 1.5-hour session: AI and intelligent computing, smart devices, robots, neural networks, benefits, limitations and applied scenarios (AC1.1).",
    sortOrder: 1,
    defaultOpen: true,
    status: "available"
  },
  { week: "week-4", activities: activityIds }
));
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

// Planned until a teacher makes it available in Admin; bundled status is the fallback when the live publication has no week-4.
const weeksPath = path.join(ROOT, "weeks.json");
const weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8")).filter((item) => item.id !== "week-4");
weeks.push(envelope(
  "lp.content.week",
  "week-4",
  "0.1.0",
  {
    teachingWeek: 4,
    title: "AI and Intelligent Computing: Smart Devices, Robots and Neural Networks",
    status: "planned",
    professionalPractice: "LO1 / AC 1.1 - outline AI and intelligent computing: smart devices, robots and neural networks",
    route: "week-4/"
  },
  {
    curriculum: "l2e-exploring-emerging-digital-technologies-curriculum",
    learningOutcomes: ["lo1"],
    assignment: "formative-practice",
    sessions: ["week-4-session"]
  }
));
fs.writeFileSync(weeksPath, `${JSON.stringify(weeks, null, 2)}\n`);

const curriculumPath = path.join(ROOT, "curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));
if (!curriculum.relationships.weeks.includes("week-4")) curriculum.relationships.weeks.push("week-4");
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
for (const act of week4Activities) {
  for (const b of act.blocks) {
    if (["single-choice", "classification", "short-response", "reflection"].includes(b.type)) {
      typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
    }
  }
}

console.log(
  JSON.stringify(
    {
      activities: activityIds.length,
      types: typeCounts,
      ids: activityIds
    },
    null,
    2
  )
);
