#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const content = require("@learning-platform/content");

const ROOT = path.join(__dirname, "..", "content", "l2e-exploring-emerging-digital-technologies");

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

function sc(id, prompt, options, correctOptionId, feedback) {
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
      correct: feedback,
      incorrect: feedback
    },
    sourceType: "single"
  });
}

function classify(id, prompt, categories, items) {
  return block(id, "classification", {
    formative: true,
    questionId: id,
    prompt,
    categories,
    items,
    feedback: {
      correct: "Those matches look right.",
      incorrect: "Check the definition and try again."
    }
  });
}

function short(id, prompt, guidance) {
  return block(id, "short-response", {
    formative: true,
    questionId: id,
    prompt,
    guidance
  });
}

function reflection(id, prompt) {
  return block(id, "reflection", {
    formative: true,
    questionId: id,
    prompt
  });
}

const week2Activities = [
  activity(
    "week-2-starter",
    "Welcome to Week 2",
    "Set the focus for AC1.1: outline IoT, connected devices, RFID, NFC and wearables.",
    "Starter",
    [
      block("week-2-starter-h", "heading", { text: "Welcome to Week 2", level: 2 }),
      block("week-2-starter-p1", "paragraph", {
        text: "This week you outline Internet of Things (IoT), connected devices, RFID, NFC and wearables (AC1.1)."
      }),
      block("week-2-starter-p2", "paragraph", {
        text: "By the end, define each technology, give an example, and note one benefit and one risk."
      }),
      sc(
        "week-2-starter-q1",
        "Which best describes the Internet of Things (IoT)?",
        [
          "A single desktop PC with no network link",
          "Physical devices that collect or share data over a network",
          "Printed barcodes that never use radio",
          "A paper rota on a noticeboard"
        ],
        "b",
        "IoT is a network of physical devices that collect or share data, often automatically."
      )
    ],
    8
  ),
  activity(
    "week-2-iot",
    "IoT and connected devices",
    "Outline what IoT is and what makes a device 'connected'.",
    "Teaching",
    [
      block("week-2-iot-h", "heading", { text: "IoT and connected devices", level: 2 }),
      block("week-2-iot-p1", "paragraph", {
        text: "IoT devices sense, act or share data with little manual input. A connected device can send or receive data over a network (Wi-Fi, mobile, Bluetooth or similar)."
      }),
      block("week-2-iot-p2", "paragraph", {
        text: "Examples: smart thermostat, warehouse temperature sensor, connected street light, hospital infusion pump that reports status."
      }),
      sc(
        "week-2-iot-q1",
        "A device is 'connected' mainly when it can:",
        [
          "Only store data offline with no network path",
          "Send or receive data over a network",
          "Be made of metal only",
          "Print on paper without electronics"
        ],
        "b",
        "Connected devices exchange data over a network."
      ),
      sc(
        "week-2-iot-q2",
        "Which is the best IoT example?",
        [
          "A paper clipboard in a storeroom",
          "Soil moisture sensors uploading readings to a farm dashboard",
          "A whiteboard marker",
          "An unplugged desk lamp with no radio"
        ],
        "b",
        "Sensors sharing field data are a classic IoT use."
      )
    ],
    12
  ),
  activity(
    "week-2-iot-sectors",
    "Consumer, industrial and healthcare IoT",
    "Classify IoT examples by sector.",
    "Classification",
    [
      block("week-2-iot-sectors-h", "heading", { text: "Consumer, industrial and healthcare IoT", level: 2 }),
      block("week-2-iot-sectors-p", "paragraph", {
        text: "Consumer IoT is for homes and personal use. Industrial IoT supports factories, farms and logistics. Healthcare IoT supports patients and clinical monitoring."
      }),
      classify(
        "week-2-iot-sectors-q",
        "Match each example to the sector.",
        [
          { id: "consumer", label: "Consumer IoT" },
          { id: "industrial", label: "Industrial IoT" },
          { id: "healthcare", label: "Healthcare IoT" }
        ],
        [
          { id: "s1", text: "Smart home heating controlled from a phone", correctCategoryId: "consumer" },
          { id: "s2", text: "Factory machine vibration sensors for maintenance", correctCategoryId: "industrial" },
          { id: "s3", text: "Wearable heart-rate monitor used in a clinic trial", correctCategoryId: "healthcare" },
          { id: "s4", text: "Fridge camera helping a household reorder milk", correctCategoryId: "consumer" },
          { id: "s5", text: "Cold-store sensors in a warehouse", correctCategoryId: "industrial" },
          { id: "s6", text: "Connected drip pump reporting dose alerts", correctCategoryId: "healthcare" }
        ]
      )
    ],
    12
  ),
  activity(
    "week-2-rfid",
    "RFID principles",
    "Outline how RFID tags and readers identify items.",
    "Teaching",
    [
      block("week-2-rfid-h", "heading", { text: "RFID", level: 2 }),
      block("week-2-rfid-p1", "paragraph", {
        text: "RFID uses radio tags and readers to identify items. Readers can often scan tags without lining every item up under a camera, which helps stock and asset tracking."
      }),
      block("week-2-rfid-p2", "paragraph", {
        text: "Typical uses: clothing tags in retail, pallet tags in warehouses, library books, tool tracking on a site."
      }),
      sc(
        "week-2-rfid-q1",
        "RFID is most useful when an organisation needs to:",
        [
          "Identify tagged items at short distance without lining each one under a camera",
          "Replace all radio with paper only",
          "Project a hologram in a classroom",
          "Run a spreadsheet with no tags"
        ],
        "a",
        "RFID readers identify tagged items at short range, including when items are not lined up one by one."
      ),
      short(
        "week-2-rfid-q2",
        "Give one business use of RFID.",
        "Mention tagged items and tracking or scanning. One sentence is enough."
      )
    ],
    12
  ),
  activity(
    "week-2-nfc",
    "NFC principles",
    "Outline NFC as very short-range radio for secure taps.",
    "Teaching",
    [
      block("week-2-nfc-h", "heading", { text: "NFC", level: 2 }),
      block("week-2-nfc-p1", "paragraph", {
        text: "NFC (Near Field Communication) is very short-range radio, usually centimetres. It suits short taps such as contactless payment, door badges and ticket gates."
      }),
      sc(
        "week-2-nfc-q1",
        "NFC is designed to work over:",
        [
          "Satellite distances",
          "Very short range (about a few centimetres)",
          "Cross-country microwave links only",
          "Paper-only delivery"
        ],
        "b",
        "NFC is for close taps over a few centimetres."
      ),
      sc(
        "week-2-nfc-q2",
        "Which is the best NFC example?",
        [
          "Tapping a phone on a till to pay",
          "A weather satellite downlink",
          "A printed poster with no electronics",
          "A long-range warehouse aisle scan of 200 tagged boxes at once"
        ],
        "a",
        "Contactless payment taps use NFC."
      )
    ],
    10
  ),
  activity(
    "week-2-rfid-vs-nfc",
    "RFID versus NFC",
    "Compare RFID and NFC by range and typical use.",
    "Classification",
    [
      block("week-2-rfid-vs-nfc-h", "heading", { text: "RFID versus NFC", level: 2 }),
      block("week-2-rfid-vs-nfc-p", "paragraph", {
        text: "Both use radio, but NFC is for very close taps. RFID often supports stock/asset tagging where a reader covers a short area and many tags."
      }),
      classify(
        "week-2-rfid-vs-nfc-q",
        "Classify each statement.",
        [
          { id: "rfid", label: "RFID" },
          { id: "nfc", label: "NFC" }
        ],
        [
          { id: "v1", text: "Best for scanning many tagged boxes in a stock room", correctCategoryId: "rfid" },
          { id: "v2", text: "Best for a phone tap at a payment terminal", correctCategoryId: "nfc" },
          { id: "v3", text: "Often used on clothing security tags", correctCategoryId: "rfid" },
          { id: "v4", text: "Usually limited to a few centimetres", correctCategoryId: "nfc" }
        ]
      )
    ],
    10
  ),
  activity(
    "week-2-wearables",
    "Wearable technologies",
    "Outline wearables and how they link to IoT.",
    "Teaching",
    [
      block("week-2-wearables-h", "heading", { text: "Wearables", level: 2 }),
      block("week-2-wearables-p1", "paragraph", {
        text: "Wearables are devices worn on the body: fitness watches, smart badges, medical patches. Many are IoT devices when they upload activity or health data."
      }),
      sc(
        "week-2-wearables-q1",
        "Which is a wearable?",
        [
          "A rack server in a data centre",
          "A fitness watch counting steps",
          "A wall-mounted classroom projector",
          "A paper timetable"
        ],
        "b",
        "Wearables are worn on the body."
      ),
      sc(
        "week-2-wearables-q2",
        "A wearable becomes an IoT example mainly when it:",
        [
          "Never leaves airplane mode and never shares data",
          "Shares sensor data over a network to an app or service",
          "Is made of plastic only",
          "Is larger than a fridge"
        ],
        "b",
        "Shared sensor data over a network makes it an IoT wearable."
      )
    ],
    10
  ),
  activity(
    "week-2-smart-settings",
    "Smart homes, cities and healthcare settings",
    "Match connected examples to smart home, smart city or healthcare.",
    "Classification",
    [
      block("week-2-smart-settings-h", "heading", { text: "Smart homes, cities and healthcare", level: 2 }),
      block("week-2-smart-settings-p", "paragraph", {
        text: "The same IoT idea appears in homes, cities and healthcare, with different goals: comfort, public services, or patient safety."
      }),
      classify(
        "week-2-smart-settings-q",
        "Match each example.",
        [
          { id: "home", label: "Smart home" },
          { id: "city", label: "Smart city" },
          { id: "health", label: "Healthcare" }
        ],
        [
          { id: "m1", text: "Connected thermostat learning household routines", correctCategoryId: "home" },
          { id: "m2", text: "Street lights that dim when roads are empty", correctCategoryId: "city" },
          { id: "m3", text: "Remote monitoring of a patient's oxygen levels", correctCategoryId: "health" },
          { id: "m4", text: "Smart door lock for a flat", correctCategoryId: "home" },
          { id: "m5", text: "Traffic sensors feeding a live congestion map", correctCategoryId: "city" },
          { id: "m6", text: "Hospital bed sensor alerting when a patient leaves the bed", correctCategoryId: "health" }
        ]
      )
    ],
    12
  ),
  activity(
    "week-2-benefits-risks",
    "Benefits, risks and security",
    "Check benefits of connected tech and key security risks.",
    "Knowledge check",
    [
      block("week-2-benefits-risks-h", "heading", { text: "Benefits, risks and security", level: 2 }),
      block("week-2-benefits-risks-p", "paragraph", {
        text: "Benefits include automation, better decisions from live data, and convenience. Risks include hacking, outages, cost, and poor configuration."
      }),
      sc(
        "week-2-benefits-risks-q1",
        "A clear benefit of industrial IoT sensors is that they can:",
        [
          "Remove the need for any safety rules",
          "Provide live data to spot faults earlier",
          "Guarantee zero cyber risk",
          "Replace all human staff overnight"
        ],
        "b",
        "Live sensor data helps spot faults and improve decisions."
      ),
      sc(
        "week-2-benefits-risks-q2",
        "A key security risk for always-on IoT devices is:",
        [
          "They never use electricity",
          "Weak passwords or unpatched firmware can be exploited",
          "They only work on paper",
          "They cannot store any data"
        ],
        "b",
        "Weak credentials and missing updates are common IoT security risks."
      )
    ],
    10
  ),
  activity(
    "week-2-privacy",
    "Privacy and case study thinking",
    "Consider privacy implications and outline a short case study.",
    "Application",
    [
      block("week-2-privacy-h", "heading", { text: "Privacy and real-world cases", level: 2 }),
      block("week-2-privacy-p", "paragraph", {
        text: "Wearables and healthcare IoT often handle sensitive data. Organisations need consent, clear purpose, access control and secure storage."
      }),
      sc(
        "week-2-privacy-q1",
        "Main privacy risk if a fitness wearable leaks heart-rate data?",
        [
          "Faster Wi-Fi only",
          "Private health details exposed without consent",
          "Larger fonts on the screen",
          "Longer battery life"
        ],
        "b",
        "Leaked health data is a privacy and consent issue."
      ),
      short(
        "week-2-privacy-q2",
        "Outline one real-world case: name the technology (IoT, RFID, NFC or wearable), who uses it, and one risk to manage.",
        "Write 2-4 short sentences. This is practice only."
      )
    ],
    12
  ),
  activity(
    "week-2-trends",
    "Emerging trends",
    "Spot sensible near-term trends for connected devices.",
    "Knowledge check",
    [
      block("week-2-trends-h", "heading", { text: "Emerging trends", level: 2 }),
      block("week-2-trends-p", "paragraph", {
        text: "Trends include more sensors in cities, tighter security expectations, edge processing on devices, and wearables used in workplace health programmes."
      }),
      sc(
        "week-2-trends-q1",
        "Which statement is a realistic emerging trend?",
        [
          "All IoT devices will stop using networks",
          "More organisations expect stronger IoT security and updates",
          "RFID will only work on the Moon",
          "NFC will replace all long-distance radio"
        ],
        "b",
        "Security and update expectations for IoT are rising."
      )
    ],
    8
  ),
  activity(
    "week-2-reflection",
    "Portfolio reflection",
    "Write a short note covering the Week 2 technologies.",
    "Reflection",
    [
      block("week-2-reflection-h", "heading", { text: "Portfolio reflection", level: 2 }),
      block("week-2-reflection-p", "paragraph", {
        text: "Write one example each for IoT, RFID, NFC and wearables. This is practice only, not Gateway assignment evidence."
      }),
      reflection(
        "week-2-reflection-q",
        "List one example for IoT, RFID, NFC and wearables. For one of them, add one benefit and one privacy or security risk."
      )
    ],
    10
  ),
  activity(
    "week-2-exit",
    "Exit ticket",
    "Quick check: can you outline the Week 2 technologies?",
    "Exit ticket",
    [
      block("week-2-exit-h", "heading", { text: "Exit ticket", level: 2 }),
      sc(
        "week-2-exit-q1",
        "Which pair is correct?",
        [
          "NFC = long-range satellite; RFID = paper only",
          "RFID = tagged item identification; NFC = very short-range tap",
          "Wearable = data-centre rack; IoT = printed poster",
          "IoT = no network; NFC = continental radio"
        ],
        "b",
        "RFID identifies tagged items; NFC is for close taps."
      ),
      sc(
        "week-2-exit-q2",
        "How confident are you with IoT, RFID, NFC and wearables?",
        [
          "Not yet. I need another look at the definitions.",
          "Getting there. I can give one example for most.",
          "Confident. I can define each and give a use plus a risk.",
          "I can teach it to a classmate tomorrow"
        ],
        "c",
        "Aim to define each technology, give a use, and note a risk."
      )
    ],
    6
  )
];

const activityIds = week2Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const sessionsPath = path.join(ROOT, "sessions.json");
const packagePath = path.join(ROOT, "package.json");

const activities = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek2 = activities.filter((item) => !String(item.id || "").startsWith("week-2-"));
const week1End = withoutWeek2.findIndex((item) => String(item.id || "").startsWith("week-3-"));
const merged =
  week1End === -1
    ? withoutWeek2.concat(week2Activities)
    : withoutWeek2.slice(0, week1End).concat(week2Activities, withoutWeek2.slice(week1End));
fs.writeFileSync(activitiesPath, `${JSON.stringify(merged, null, 2)}\n`);

const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
const week2Session = sessions.find((item) => item.id === "week-2-session");
if (!week2Session) throw new Error("week-2-session missing");
week2Session.metadata.summary =
  "One 1.5-hour session: IoT, connected devices, RFID, NFC, wearables, benefits, risks and privacy (AC1.1).";
week2Session.relationships.activities = activityIds;
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

const weeks = JSON.parse(fs.readFileSync(path.join(ROOT, "weeks.json"), "utf8"));
const week2 = weeks.find((item) => item.id === "week-2");
if (week2) {
  week2.metadata.professionalPractice =
    "LO1 / AC 1.1 - outline IoT, connected devices, RFID, NFC and wearables";
  fs.writeFileSync(path.join(ROOT, "weeks.json"), `${JSON.stringify(weeks, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

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

console.log(
  JSON.stringify(
    {
      activities: activityIds.length,
      interactive: week2Activities.reduce((count, act) => {
        return (
          count +
          act.blocks.filter((b) =>
            ["single-choice", "classification", "short-response", "reflection"].includes(b.type)
          ).length
        );
      }, 0),
      valid: true
    },
    null,
    2
  )
);
