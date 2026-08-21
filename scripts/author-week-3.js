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

const week3Activities = [
  activity(
    "week-3-starter",
    "Welcome to Week 3",
    "Retrieve where data lives, then set the focus for cloud service models (AC1.1).",
    "Starter",
    [
      block("week-3-starter-h", "heading", { text: "Welcome to Week 3", level: 2 }),
      block("week-3-starter-p1", "paragraph", {
        text: "This week you outline cloud technology and distinguish SaaS, IaaS, PaaS and DaaS (AC1.1)."
      }),
      block("week-3-starter-p2", "paragraph", {
        text: "By the end, define cloud computing, match everyday services to a model, and write a short cloud profile."
      }),
      sc(
        "week-3-starter-q1",
        "A fitness watch from Week 2 uploads heart-rate readings to an app account. Where is that health data mainly stored for later viewing?",
        [
          "Only inside the watch with no other copy",
          "Often on remote servers accessed over the internet (the cloud), as well as on the device",
          "Only on a printed paper chart",
          "Only in a classroom USB stick that never connects"
        ],
        "b",
        "Connected devices often keep a local copy and also send data to cloud services so it can be viewed later on other devices."
      )
    ],
    8
  ),
  activity(
    "week-3-cloud-outline",
    "What is cloud technology?",
    "Outline cloud computing as internet-delivered resources that can scale.",
    "Teaching",
    [
      block("week-3-cloud-h", "heading", { text: "What is cloud technology?", level: 2 }),
      block("week-3-cloud-p1", "paragraph", {
        text: "Cloud technology delivers computing resources over the internet instead of only from one local device or a single on-site server. Users can often scale up or down and pay for what they use."
      }),
      block("week-3-cloud-p2", "paragraph", {
        text: "Examples include web email, online file storage, rented virtual machines, hosted app platforms and remote desktops."
      }),
      sc(
        "week-3-cloud-q1",
        "Which statement best outlines cloud technology?",
        [
          "Computing resources delivered over the internet, often scaled as needed",
          "A single USB stick that never connects to a network",
          "Only paper filing cabinets in one office",
          "A projector that cannot store or share files"
        ],
        "a",
        "Cloud means resources are delivered over the internet and can usually grow or shrink with demand."
      ),
      sc(
        "week-3-cloud-q2",
        "Saving a document only on the hard drive of one classroom PC (never uploaded) is mainly an example of:",
        [
          "Cloud storage",
          "Local storage",
          "DaaS",
          "IaaS"
        ],
        "b",
        "If the file stays only on that PC, it is local storage, not cloud storage."
      )
    ],
    10
  ),
  activity(
    "week-3-local-vs-cloud",
    "Local storage versus cloud",
    "Classify examples as local storage or cloud storage.",
    "Classification",
    [
      block("week-3-local-h", "heading", { text: "Local storage versus cloud", level: 2 }),
      block("week-3-local-p", "paragraph", {
        text: "Local storage keeps files on a device you control in the room. Cloud storage keeps files on remote servers you reach over the internet."
      }),
      classify(
        "week-3-local-q",
        "Classify each example.",
        [
          { id: "local", label: "Local storage" },
          { id: "cloud", label: "Cloud storage" }
        ],
        [
          { id: "l1", text: "A homework file saved only on a laptop hard drive", correctCategoryId: "local" },
          { id: "l2", text: "Photos backed up to Google Drive or OneDrive", correctCategoryId: "cloud" },
          { id: "l3", text: "Music stored only on a phone with airplane mode and no sync", correctCategoryId: "local" },
          { id: "l4", text: "College email messages held on the provider's mail servers", correctCategoryId: "cloud" },
          { id: "l5", text: "A spreadsheet on a USB stick that never uploads", correctCategoryId: "local" },
          { id: "l6", text: "Shared team files in a browser-based document suite", correctCategoryId: "cloud" }
        ]
      )
    ],
    10
  ),
  activity(
    "week-3-saas",
    "SaaS",
    "Outline Software as a Service with familiar examples.",
    "Teaching",
    [
      block("week-3-saas-h", "heading", { text: "SaaS (Software as a Service)", level: 2 }),
      block("week-3-saas-p", "paragraph", {
        text: "SaaS is software you use through a browser or app. The provider runs and updates the application. You mainly manage your account, content and access rights."
      }),
      sc(
        "week-3-saas-q1",
        "Using college email in a browser is closest to:",
        ["SaaS", "IaaS", "PaaS", "Only local storage with no provider"],
        "a",
        "The email application is provided and managed for you. That is SaaS."
      ),
      sc(
        "week-3-saas-q2",
        "In SaaS, who usually installs security updates for the application itself?",
        [
          "Every learner must install the app updates on school servers",
          "The cloud provider",
          "The electricity company",
          "Nobody ever updates SaaS apps"
        ],
        "b",
        "The provider maintains the SaaS application. Customers focus on using it and managing their data access."
      )
    ],
    10
  ),
  activity(
    "week-3-iaas",
    "IaaS",
    "Outline Infrastructure as a Service: rented virtual machines, storage and networks.",
    "Teaching",
    [
      block("week-3-iaas-h", "heading", { text: "IaaS (Infrastructure as a Service)", level: 2 }),
      block("week-3-iaas-p", "paragraph", {
        text: "IaaS rents infrastructure such as virtual machines, storage and networks. The customer installs and manages operating systems and software. The provider manages the physical data centre hardware."
      }),
      sc(
        "week-3-iaas-q1",
        "An IT team rents virtual servers and then installs its own operating systems and apps. This is mainly:",
        ["SaaS", "IaaS", "DaaS", "A paper archive"],
        "b",
        "Renting virtual servers and managing the software stack yourself is IaaS."
      ),
      sc(
        "week-3-iaas-q2",
        "A college rents extra virtual disks during exam week, then scales down afterwards. This mainly shows:",
        [
          "That cloud capacity cannot change",
          "That IaaS-style resources can scale with demand",
          "That only SaaS can use disks",
          "That local USB sticks are required"
        ],
        "b",
        "Scaling storage up and down is a common cloud benefit, often via infrastructure services."
      )
    ],
    10
  ),
  activity(
    "week-3-paas",
    "PaaS",
    "Outline Platform as a Service for building and running applications.",
    "Teaching",
    [
      block("week-3-paas-h", "heading", { text: "PaaS (Platform as a Service)", level: 2 }),
      block("week-3-paas-p", "paragraph", {
        text: "PaaS gives a ready environment to build, test and run applications. The provider manages the platform. Developers focus on their app code rather than buying and patching every server."
      }),
      sc(
        "week-3-paas-q1",
        "Developers deploy an app into a hosted build-and-run environment. This is mainly:",
        ["SaaS", "IaaS", "PaaS", "DaaS"],
        "c",
        "A hosted environment for building and running apps is PaaS."
      ),
      sc(
        "week-3-paas-q2",
        "Compared with IaaS, PaaS usually means the customer:",
        [
          "Must build the physical data centre",
          "Manages less of the underlying servers and focuses more on the application",
          "Can never write any code",
          "Only prints paper reports"
        ],
        "b",
        "PaaS reduces how much infrastructure the customer manages so they can focus on the application."
      )
    ],
    10
  ),
  activity(
    "week-3-daas",
    "DaaS",
    "Outline Desktop as a Service: a desktop session delivered over the network.",
    "Teaching",
    [
      block("week-3-daas-h", "heading", { text: "DaaS (Desktop as a Service)", level: 2 }),
      block("week-3-daas-p", "paragraph", {
        text: "DaaS delivers a desktop environment over the network. The user works on a remote desktop rather than relying only on software installed on one local PC."
      }),
      sc(
        "week-3-daas-q1",
        "Staff log in to a Windows desktop that runs in the cloud. This is mainly:",
        ["SaaS document editing only", "IaaS bare-metal only", "DaaS", "A USB stick OS"],
        "c",
        "A full desktop session delivered remotely is Desktop as a Service (DaaS)."
      ),
      sc(
        "week-3-daas-q2",
        "DaaS is best outlined as:",
        [
          "A desktop environment delivered over the network",
          "A physical tower PC that cannot be accessed remotely",
          "Only a barcode scanner",
          "Only a printed timetable"
        ],
        "a",
        "DaaS provides a desktop session remotely over the network."
      )
    ],
    10
  ),
  activity(
    "week-3-models-match",
    "Match services to cloud models",
    "Classify everyday services as SaaS, IaaS, PaaS or DaaS.",
    "Classification",
    [
      block("week-3-models-h", "heading", { text: "Match services to cloud models", level: 2 }),
      block("week-3-models-p", "paragraph", {
        text: "Ask what you are buying: a ready app (SaaS), raw infrastructure (IaaS), an app platform (PaaS), or a remote desktop (DaaS)."
      }),
      classify(
        "week-3-models-q",
        "Classify each example.",
        [
          { id: "saas", label: "SaaS" },
          { id: "iaas", label: "IaaS" },
          { id: "paas", label: "PaaS" },
          { id: "daas", label: "DaaS" }
        ],
        [
          { id: "m1", text: "Learners write documents in a browser-based office suite", correctCategoryId: "saas" },
          { id: "m2", text: "An IT team rents virtual servers and installs its own software stack", correctCategoryId: "iaas" },
          { id: "m3", text: "Developers deploy an app into a hosted build-and-run environment", correctCategoryId: "paas" },
          { id: "m4", text: "Staff log in to a Windows desktop that runs in the cloud", correctCategoryId: "daas" },
          { id: "m5", text: "A class uses a hosted quiz tool with no local install", correctCategoryId: "saas" },
          { id: "m6", text: "A college rents extra virtual disks during exam week", correctCategoryId: "iaas" },
          { id: "m7", text: "College email opened in a browser", correctCategoryId: "saas" },
          { id: "m8", text: "A remote desktop used from a thin client in a library", correctCategoryId: "daas" }
        ]
      )
    ],
    14
  ),
  activity(
    "week-3-responsibility",
    "Who manages what?",
    "Classify responsibilities as mainly customer or mainly provider.",
    "Classification",
    [
      block("week-3-resp-h", "heading", { text: "Who manages what?", level: 2 }),
      block("week-3-resp-p", "paragraph", {
        text: "In cloud models, some jobs stay with the customer and some stay with the provider. The split changes across SaaS, IaaS, PaaS and DaaS."
      }),
      classify(
        "week-3-resp-q",
        "For a typical SaaS email service, classify each responsibility.",
        [
          { id: "customer", label: "Mainly the customer" },
          { id: "provider", label: "Mainly the provider" }
        ],
        [
          { id: "r1", text: "Choosing strong passwords and careful sharing settings", correctCategoryId: "customer" },
          { id: "r2", text: "Patching the email application on the provider servers", correctCategoryId: "provider" },
          { id: "r3", text: "Deciding which classmates may edit a shared folder", correctCategoryId: "customer" },
          { id: "r4", text: "Keeping the data centre power and cooling running", correctCategoryId: "provider" },
          { id: "r5", text: "Writing the message content of your own emails", correctCategoryId: "customer" },
          { id: "r6", text: "Updating the SaaS product features for all tenants", correctCategoryId: "provider" }
        ]
      )
    ],
    12
  ),
  activity(
    "week-3-scenarios",
    "Which model fits?",
    "Choose the best cloud model for each organisational scenario.",
    "Knowledge check",
    [
      block("week-3-scen-h", "heading", { text: "Which model fits?", level: 2 }),
      block("week-3-scen-p", "paragraph", {
        text: "Read each scenario and pick the model that best matches what the organisation is buying."
      }),
      sc(
        "week-3-scen-q1",
        "A small charity wants staff to use email and shared docs without running its own mail servers. Best fit:",
        ["IaaS", "SaaS", "Only local hard drives", "DaaS physical towers only"],
        "b",
        "Ready-to-use apps with little server management point to SaaS."
      ),
      sc(
        "week-3-scen-q2",
        "A college IT team wants full control of operating systems on rented virtual machines. Best fit:",
        ["SaaS", "IaaS", "Only paper records", "DaaS without any network"],
        "b",
        "Control of OS and software on rented machines is IaaS."
      ),
      sc(
        "week-3-scen-q3",
        "A start-up wants developers to deploy code quickly without building servers from scratch. Best fit:",
        ["PaaS", "Only USB sticks", "Printed manuals", "Barcode-only systems"],
        "a",
        "A ready build-and-run platform for developers is PaaS."
      ),
      sc(
        "week-3-scen-q4",
        "A business wants staff to open the same managed Windows desktop from home or campus. Best fit:",
        ["DaaS", "Only a classroom whiteboard", "Local-only floppy disks", "NFC tags with no network"],
        "a",
        "A managed desktop delivered over the network is DaaS."
      )
    ],
    12
  ),
  activity(
    "week-3-benefits-risks",
    "Cloud benefits and dependencies",
    "Check benefits of cloud use and key dependencies or risks.",
    "Knowledge check",
    [
      block("week-3-br-h", "heading", { text: "Benefits, dependencies and risks", level: 2 }),
      block("week-3-br-p", "paragraph", {
        text: "Cloud can reduce on-site equipment needs and support scaling. It can also create dependency on a provider, internet access and good account security."
      }),
      sc(
        "week-3-br-q1",
        "A clear benefit of cloud for many organisations is:",
        [
          "They never need internet access again",
          "They can often scale capacity without buying new on-site hardware every time",
          "Providers delete all customer data daily by default with no backup option",
          "Cloud always means zero cost"
        ],
        "b",
        "Scaling without constantly buying new local hardware is a common cloud benefit."
      ),
      sc(
        "week-3-br-q2",
        "A key dependency or risk of heavy cloud use is:",
        [
          "No one ever needs a password",
          "Service outages or lock-in can affect work if the provider or internet link fails",
          "Paper printers stop existing",
          "USB sticks become illegal"
        ],
        "b",
        "Organisations depend on connectivity and the provider. Outages and lock-in are real risks to manage."
      ),
      short(
        "week-3-br-q3",
        "Give one benefit of using cloud technology and one dependency or risk an organisation should manage.",
        "Write at least 300 characters. Mention one benefit and one dependency or risk. Paste is disabled.",
        300
      )
    ],
    12
  ),
  activity(
    "week-3-org-example",
    "Organisational cloud example",
    "Outline one organisation and how it uses a cloud model.",
    "Short response",
    [
      block("week-3-org-h", "heading", { text: "Organisational cloud example", level: 2 }),
      block("week-3-org-p", "paragraph", {
        text: "Organisations use cloud services for email, storage, development platforms, virtual machines and remote desktops."
      }),
      short(
        "week-3-org-q",
        "Name one organisation (real or realistic). State which cloud model it uses in your example and what the service is for.",
        "Write at least 300 characters. Name the organisation, the model (SaaS, IaaS, PaaS or DaaS), and the purpose. Paste is disabled.",
        300
      )
    ],
    10
  ),
  activity(
    "week-3-extension",
    "Extension: SaaS or IaaS for a small business?",
    "Explain why a small business might choose SaaS rather than IaaS.",
    "Extension",
    [
      block("week-3-ext-h", "heading", { text: "Extension: SaaS or IaaS?", level: 2 }),
      block("week-3-ext-p", "paragraph", {
        text: "Small organisations often prefer ready apps over managing servers. Larger IT teams may want IaaS for control."
      }),
      sc(
        "week-3-ext-q1",
        "A three-person charity with no IT team needs email and shared files quickly. The stronger first choice is usually:",
        ["IaaS with self-managed servers", "SaaS apps from a provider", "Only handwritten letters", "Building a private data centre first"],
        "b",
        "With little IT capacity, SaaS reduces the need to run and patch your own servers."
      ),
      short(
        "week-3-ext-q2",
        "In your own words, explain why a small business might choose SaaS rather than IaaS.",
        "Write at least 250 characters. Link your reason to skills, time or cost. Paste is disabled.",
        250
      )
    ],
    10
  ),
  activity(
    "week-3-profile",
    "Cloud technology profile",
    "Produce a short cloud profile naming the service, model and organisation context.",
    "Reflection",
    [
      block("week-3-profile-h", "heading", { text: "Cloud technology profile", level: 2 }),
      block("week-3-profile-p", "paragraph", {
        text: "Independent task: build a short profile you could reuse when outlining technologies for AC1.1 practice. This is formative, not Gateway assignment evidence."
      }),
      reflection(
        "week-3-profile-q",
        "Write a cloud profile: name one cloud service, state whether it is closest to SaaS, IaaS, PaaS or DaaS, say who uses it, give one benefit, and give one dependency or risk.",
        500,
        "Cover service, model, who uses it, one benefit and one dependency or risk. Write at least 500 characters. Paste is disabled."
      )
    ],
    12
  ),
  activity(
    "week-3-exit",
    "Exit ticket",
    "Quick check that you can outline cloud models and judge your confidence.",
    "Exit ticket",
    [
      block("week-3-exit-h", "heading", { text: "Exit ticket", level: 2 }),
      sc(
        "week-3-exit-q1",
        "Which pair is correct?",
        [
          "SaaS = rent virtual machines; IaaS = browser email only",
          "SaaS = ready software over the internet; IaaS = rented infrastructure such as VMs",
          "DaaS = paper only; PaaS = USB sticks only",
          "Cloud = no network; Local = always remote servers"
        ],
        "b",
        "SaaS is ready software. IaaS is rented infrastructure such as virtual machines."
      ),
      sc(
        "week-3-exit-q2",
        "How confident are you outlining SaaS, IaaS, PaaS and DaaS?",
        [
          "Not yet. I need another look at the definitions.",
          "Getting there. I can give one example for most.",
          "Confident. I can define each and give a use plus a risk."
        ],
        "c",
        "Use this rating to decide what to revise before Assignment 1 practice."
      )
    ],
    6
  )
];

const activityIds = week3Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const existing = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek3 = existing.filter((item) => !String(item.id || "").startsWith("week-3-"));
const week1End = withoutWeek3.findIndex((item) => String(item.id || "").startsWith("week-2-"));
const insertAt = week1End === -1 ? withoutWeek3.length : (() => {
  // keep week-1 then week-2 then week-3
  let lastWeek2 = -1;
  withoutWeek3.forEach((item, index) => {
    if (String(item.id || "").startsWith("week-2-")) lastWeek2 = index;
  });
  return lastWeek2 === -1 ? withoutWeek3.length : lastWeek2 + 1;
})();
const nextActivities = withoutWeek3.slice();
nextActivities.splice(insertAt, 0, ...week3Activities);
fs.writeFileSync(activitiesPath, `${JSON.stringify(nextActivities, null, 2)}\n`);

const sessionsPath = path.join(ROOT, "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
const week3Session = sessions.find((item) => item.id === "week-3-session");
if (!week3Session) throw new Error("week-3-session missing");
week3Session.metadata.summary =
  "One 1.5-hour session: cloud technology, SaaS, IaaS, PaaS, DaaS, benefits, dependencies and a cloud profile (AC1.1).";
week3Session.relationships.activities = activityIds;
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

const weeks = JSON.parse(fs.readFileSync(path.join(ROOT, "weeks.json"), "utf8"));
const week3 = weeks.find((item) => item.id === "week-3");
if (week3) {
  week3.metadata.professionalPractice =
    "LO1 / AC 1.1 - outline cloud technology and service models (SaaS, IaaS, PaaS, DaaS)";
  fs.writeFileSync(path.join(ROOT, "weeks.json"), `${JSON.stringify(weeks, null, 2)}\n`);
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

const typeCounts = {};
for (const act of week3Activities) {
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
