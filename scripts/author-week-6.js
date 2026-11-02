#!/usr/bin/env node
"use strict";

/**
 * Author Week 6: 5G, IPv6, Blockchain, Serverless Computing and SD-WAN (AC1.1).
 * Regenerates week-6 activities, session, week row and package.json.
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

const week6Activities = [
  // A. Starter and prior knowledge
  activity(
    "week-6-starter",
    "Welcome to Week 6",
    "Recap Week 5 ideas, then set the focus for 5G, IPv6, blockchain, serverless computing and SD-WAN (AC1.1).",
    "Starter",
    [
      heading("week-6-starter-h", "Welcome to Week 6"),
      para(
        "week-6-starter-p1",
        "This week you outline five more emerging technologies: 5G (fifth-generation mobile networks), IPv6 (Internet Protocol version 6), blockchain, serverless computing and SD-WAN (Software-Defined Wide Area Network) (AC1.1)."
      ),
      callout(
        "week-6-starter-c",
        "By the end of this week",
        "You will be able to describe what each technology is, give a practical use for each one, and explain how they differ. You will use Pixel Forge Games examples where they help you see real workplace uses."
      ),
      para(
        "week-6-starter-p2",
        "First, a quick check from Week 5. Virtual reality (VR) surrounds you in a computer-made world. Augmented reality (AR) adds digital extras to the real world. 3D printing builds objects in layers. 4D printing adds planned change over time."
      ),
      sc(
        "week-6-starter-q1",
        "Which statement from Week 5 is correct?",
        [
          "VR and AR are two names for the same flat phone video",
          "VR surrounds you in a computer-made world; AR adds digital extras to the real world",
          "3D printing means watching a tutorial video",
          "4D printing always replaces email"
        ],
        "b",
        "Correct. VR surrounds you. AR overlays digital information on the real world. Keep those ideas separate.",
        "Not quite. VR surrounds you in a virtual world. AR keeps the real world in view and adds digital extras."
      ),
      sc(
        "week-6-starter-q2",
        "Which five technologies will you outline this week for AC1.1?",
        [
          "Email, printers, passwords, spreadsheets and calculators only",
          "5G, IPv6, blockchain, serverless computing and SD-WAN",
          "Only VR headsets and 3D printers",
          "Only robots and RFID tags"
        ],
        "b",
        "Correct. This week focuses on 5G, IPv6, blockchain, serverless computing and SD-WAN so you can outline them for AC1.1.",
        "Not quite. Read the welcome text again. This week covers five networking and computing technologies."
      )
    ],
    5
  ),
  activity(
    "week-6-recap-connect",
    "Linking earlier technologies",
    "Connect IoT, cloud and networks to this week's infrastructure technologies.",
    "Teaching",
    [
      heading("week-6-recap-connect-h", "Linking earlier technologies"),
      para(
        "week-6-recap-connect-p1",
        "You have already met connected devices (the Internet of Things, or IoT), cloud services and wireless ideas. This week's technologies often support those systems behind the scenes."
      ),
      para(
        "week-6-recap-connect-p2",
        "5G can carry mobile traffic for games and devices. IPv6 helps give more devices their own network addresses. Blockchain can record histories of digital items. Serverless computing can run small pieces of cloud code. SD-WAN can link company sites together."
      ),
      sc(
        "week-6-recap-connect-q1",
        "Which statement is most accurate?",
        [
          "This week's technologies replace everything you learned in Weeks 1 to 5",
          "This week's technologies often support networks, devices and cloud services you already know",
          "Cloud computing only works with paper forms",
          "IoT devices never need network addresses"
        ],
        "b",
        "Correct. New technologies usually build on networks, devices and cloud services rather than wiping them out.",
        "Not quite. Think of this week as adding tools that help networks and applications work at scale."
      ),
      sc(
        "week-6-recap-connect-q2",
        "Pixel Forge Games wants smoother mobile play, more connected devices and linked offices. Why does that fit this week?",
        [
          "Because the topics cover mobile networks, IP addressing, cloud code and site-to-site networking",
          "Because the only topic this week is 3D printing plastic cases",
          "Because games never use networks",
          "Because AC1.1 only covers paper-based technologies"
        ],
        "a",
        "Correct. Mobile networks, addressing, cloud functions and wide-area links all appear in this week's five technologies.",
        "Not quite. Pixel Forge's needs map to the networking and cloud ideas in this week's list."
      )
    ],
    4
  ),

  // B. 5G
  activity(
    "week-6-5g-intro",
    "What is 5G?",
    "Define 5G as fifth-generation mobile network technology in plain English.",
    "Teaching",
    [
      heading("week-6-5g-intro-h", "What is 5G?"),
      para(
        "week-6-5g-intro-p1",
        "5G means fifth-generation mobile network technology. It is the next major step after earlier mobile generations such as 4G. Phones, tablets and some connected devices can use 5G where coverage is available."
      ),
      para(
        "week-6-5g-intro-p2",
        "In suitable conditions, 5G can provide high-speed mobile connectivity. It can also support many connected devices in the same area. That matters for busy cities, stadiums and large events."
      ),
      callout(
        "week-6-5g-intro-c",
        "Key idea",
        "5G is about mobile networks. It is not a new games console, and it is not the same thing as home Wi-Fi, even though both can give wireless internet access."
      ),
      sc(
        "week-6-5g-intro-q1",
        "What does 5G stand for in this unit?",
        [
          "Fifth-generation mobile network technology",
          "Five free games online",
          "A type of 3D printer filament",
          "A blockchain wallet password"
        ],
        "a",
        "Correct. 5G means fifth-generation mobile network technology.",
        "Not quite. Expand the acronym: fifth-generation mobile network technology."
      ),
      sc(
        "week-6-5g-intro-q2",
        "Which statement about 5G is most accurate?",
        [
          "It can support high-speed mobile connections and many devices where the network is ready",
          "It always works at full speed in every building worldwide",
          "It only works on paper maps",
          "It replaces the need for any IP addresses"
        ],
        "a",
        "Correct. 5G can offer high speed and support many devices, but only where the network and conditions allow it.",
        "Not quite. Coverage and conditions still matter. 5G does not remove the need for IP addressing."
      )
    ],
    5
  ),
  activity(
    "week-6-5g-latency",
    "What does latency mean?",
    "Explain latency with a simple gaming example and link it to 5G claims.",
    "Teaching",
    [
      heading("week-6-5g-latency-h", "What does latency mean?"),
      para(
        "week-6-5g-latency-p1",
        "Latency is the delay before a response arrives. In a game, high latency can mean you press jump and the character jumps a moment later. Low latency means the response feels quicker."
      ),
      para(
        "week-6-5g-latency-p2",
        "5G can offer lower latency in suitable conditions. That can help cloud games, live mobile apps and some connected-device control. It does not guarantee perfect response times everywhere."
      ),
      callout(
        "week-6-5g-latency-c",
        "Simple example",
        "Think about sending a message from your phone to a game server. Latency is the wait before the server's reply reaches you. Shorter waits feel more responsive."
      ),
      sc(
        "week-6-5g-latency-q1",
        "What does latency mean?",
        [
          "The delay before a response arrives",
          "The colour of a headset cable",
          "The number of 3D printer layers",
          "The title of a spreadsheet"
        ],
        "a",
        "Correct. Latency is delay. Lower latency usually feels more responsive.",
        "Not quite. Latency is about waiting time for a response, not colour, printing or document titles."
      ),
      sc(
        "week-6-5g-latency-q2",
        "A Pixel Forge Games player taps fire on a mobile match. Which situation shows lower latency?",
        [
          "The shot appears almost straight away",
          "The shot appears several seconds later every time",
          "The phone refuses to connect to any network",
          "The game deletes the player's account"
        ],
        "a",
        "Correct. A quick on-screen response is what lower latency feels like to a player.",
        "Not quite. Lower latency means less waiting between action and response."
      )
    ],
    5
  ),
  activity(
    "week-6-5g-uses",
    "Where 5G can be used",
    "Outline practical 5G uses in gaming, apps, devices and other industries.",
    "Teaching",
    [
      heading("week-6-5g-uses-h", "Where 5G can be used"),
      para(
        "week-6-5g-uses-p1",
        "Possible uses include mobile gaming with smoother downloads and play, apps that need quick responses, and connected devices that share data while people move around."
      ),
      para(
        "week-6-5g-uses-p2",
        "Other industries can use 5G too. Examples include venues with thousands of phones online at once, remote support for technicians, and vehicles or sensors that need mobile connectivity."
      ),
      para(
        "week-6-5g-uses-p3",
        "At Pixel Forge Games, a demo team might stream a build preview to phones at a show, or test multiplayer play over a busy mobile network."
      ),
      sc(
        "week-6-5g-uses-q1",
        "Which is a practical use of 5G?",
        [
          "Supporting many phones and devices with high-speed mobile connectivity at a busy event",
          "Printing plastic figures without any network",
          "Writing on paper with no digital devices",
          "Turning off all mobile networks forever"
        ],
        "a",
        "Correct. Busy events and mobile applications are realistic places where 5G can help.",
        "Not quite. Look for a mobile-network use, not an offline paper or printing task."
      ),
      sc(
        "week-6-5g-uses-q2",
        "Why might a mobile game benefit from 5G in suitable conditions?",
        [
          "Faster downloads and more responsive play can improve the player experience",
          "5G deletes the need for game design",
          "5G always removes every in-game delay worldwide",
          "5G means the game must be played on paper"
        ],
        "a",
        "Correct. Speed and responsiveness can help mobile games when coverage and conditions are good.",
        "Not quite. 5G can improve mobile experiences, but it does not replace design or guarantee perfect play everywhere."
      )
    ],
    5
  ),
  activity(
    "week-6-5g-limits",
    "Why 5G performance still varies",
    "Explain that coverage, congestion, devices and services affect 5G results.",
    "Teaching",
    [
      heading("week-6-5g-limits-h", "Why 5G performance still varies"),
      para(
        "week-6-5g-limits-p1",
        "5G performance still depends on coverage (whether a 5G signal is available), network congestion (how busy the network is), the device being used, and the service the person is trying to reach."
      ),
      para(
        "week-6-5g-limits-p2",
        "A phone can show a 5G icon and still feel slow if the mast is busy, the building blocks the signal, or the game server is overloaded. Marketing claims are not the same as every real-world result."
      ),
      sc(
        "week-6-5g-limits-q1",
        "Which statement is most accurate?",
        [
          "5G performance depends on coverage, congestion, devices and the service being used",
          "Any phone with a 5G label always gets the same top speed everywhere",
          "Buildings never affect mobile signals",
          "Game servers never cause delay"
        ],
        "a",
        "Correct. Real performance depends on several factors, not only the 5G name.",
        "Not quite. Coverage, congestion, devices and distant services all affect what users feel."
      ),
      sc(
        "week-6-5g-limits-q2",
        "A learner has 5G on their phone but a cloud demo still stutters indoors. What is a sensible explanation?",
        [
          "Indoor coverage, congestion or the remote service may still limit performance",
          "5G always overrides every other limit automatically",
          "The phone must be broken because 5G never varies",
          "Cloud demos never use networks"
        ],
        "a",
        "Correct. Even with 5G available, buildings, busy networks and remote services can still cause problems.",
        "Not quite. 5G helps, but it does not remove every other cause of delay."
      )
    ],
    4
  ),
  activity(
    "week-6-5g-apply",
    "Apply: when could 5G help?",
    "Identify a situation where 5G could be useful and explain why.",
    "Application",
    [
      heading("week-6-5g-apply-h", "Apply: when could 5G help?"),
      para(
        "week-6-5g-apply-p",
        "Think about mobile speed, many devices, or lower latency in suitable conditions. Pick a realistic situation and explain the benefit clearly."
      ),
      short(
        "week-6-5g-apply-q",
        "Describe one situation where 5G could be useful and explain why. Mention speed, many devices, or latency in your answer.",
        "A satisfactory answer names a clear situation (for example a busy games event, mobile multiplayer play, or many phones online) and explains the 5G benefit in plain English. Write at least 200 characters."
      )
    ],
    6
  ),

  // C. IPv6
  activity(
    "week-6-ipv6-intro",
    "What is IPv6?",
    "Explain Internet Protocol version 6 and what an IP address does.",
    "Teaching",
    [
      heading("week-6-ipv6-intro-h", "What is IPv6?"),
      para(
        "week-6-ipv6-intro-p1",
        "IPv6 means Internet Protocol version 6. An IP address is a numerical label that helps identify a device on a network so data can be sent to the right place, a bit like a postal address for a computer or phone."
      ),
      para(
        "week-6-ipv6-intro-p2",
        "Earlier networks often used IPv4 (Internet Protocol version 4). IPv4 still works widely, but it has a limited supply of addresses. IPv6 provides a much larger address space."
      ),
      callout(
        "week-6-ipv6-intro-c",
        "Key term: address space",
        "Address space means how many different IP addresses are available. A larger address space means more devices can have their own addresses."
      ),
      sc(
        "week-6-ipv6-intro-q1",
        "What does an IP address mainly do?",
        [
          "It helps identify a device on a network so data can be delivered to the right place",
          "It prints plastic models",
          "It chooses the colour theme of a website only",
          "It replaces the need for electricity"
        ],
        "a",
        "Correct. An IP address helps route data to the correct device on a network.",
        "Not quite. Think of an IP address as a network label for finding a device."
      ),
      sc(
        "week-6-ipv6-intro-q2",
        "What does IPv6 stand for?",
        [
          "Internet Protocol version 6",
          "Instant Printer version 6",
          "Indoor Painting varnish 6",
          "In-game Points value 6"
        ],
        "a",
        "Correct. IPv6 expands to Internet Protocol version 6.",
        "Not quite. Expand each letter: Internet Protocol version 6."
      )
    ],
    5
  ),
  activity(
    "week-6-ipv6-why",
    "Why the internet needs more addresses",
    "Explain why growing numbers of devices make IPv6 important.",
    "Teaching",
    [
      heading("week-6-ipv6-why-h", "Why the internet needs more addresses"),
      para(
        "week-6-ipv6-why-p1",
        "Phones, laptops, sensors, smart TVs and game consoles all need ways to join networks. As more devices come online, the internet needs more available IP addresses."
      ),
      para(
        "week-6-ipv6-why-p2",
        "IPv6 matters because it provides a much larger supply of addresses than IPv4. That helps organisations and services that connect huge numbers of devices."
      ),
      para(
        "week-6-ipv6-why-p3",
        "Example: an online gaming service may have millions of players' devices connecting over time. A company site may also have many staff devices, consoles and sensors. More addresses make that growth easier to manage."
      ),
      sc(
        "week-6-ipv6-why-q1",
        "Why does the internet need more available IP addresses?",
        [
          "Because the number of connected devices keeps growing",
          "Because printers refuse to use paper",
          "Because websites can only be blue",
          "Because games cannot use controllers"
        ],
        "a",
        "Correct. Growth in connected devices drives the need for more addresses.",
        "Not quite. Focus on the rising number of devices that need network identities."
      ),
      sc(
        "week-6-ipv6-why-q2",
        "How does IPv6 help compared with IPv4?",
        [
          "It provides a much larger address space",
          "It deletes every older network forever",
          "It means devices no longer need any identity",
          "It only works for paper mail"
        ],
        "a",
        "Correct. The main practical advantage for learners to remember is the much larger address space.",
        "Not quite. IPv6 expands available addresses; it does not remove the need for device identity."
      )
    ],
    5
  ),
  activity(
    "week-6-ipv6-clarify",
    "IPv6 is not just a faster internet",
    "Make clear that IPv6's main advantage is address supply and IP design, not raw speed alone.",
    "Teaching",
    [
      heading("week-6-ipv6-clarify-h", "IPv6 is not just a faster internet"),
      para(
        "week-6-ipv6-clarify-p1",
        "It is easy to assume IPv6 simply means \"faster internet\". That is not the main point. Speed still depends on connections, devices and services."
      ),
      para(
        "week-6-ipv6-clarify-p2",
        "IPv6's main advantage is the much larger supply of IP addresses, plus improvements to the way IP networking is designed. Organisations adopt it so growth in devices does not run out of addresses."
      ),
      sc(
        "week-6-ipv6-clarify-q1",
        "Which statement is correct?",
        [
          "IPv6 mainly provides a much larger address space; it is not simply a faster version of the internet",
          "IPv6 always doubles every download speed worldwide with no other changes",
          "IPv6 only changes the colour of status lights",
          "IPv6 removes the need for any networks"
        ],
        "a",
        "Correct. Focus on address supply and networking design, not a magic speed boost.",
        "Not quite. Do not treat IPv6 as only a speed upgrade."
      ),
      sc(
        "week-6-ipv6-clarify-q2",
        "A classmate says, \"We need IPv6 so every page loads twice as fast.\" What should you reply?",
        [
          "Speed depends on many factors; the key IPv6 benefit is more IP addresses for more devices",
          "Agree, because IPv6 always forces double speed",
          "Agree, because IPv6 turns off every other protocol",
          "Disagree, because IP addresses are never used online"
        ],
        "a",
        "Correct. Challenge the speed-only claim and point back to address space.",
        "Not quite. Help your classmate focus on available addresses rather than guaranteed speed."
      )
    ],
    4
  ),
  activity(
    "week-6-ipv6-apply",
    "Apply: why might an organisation need IPv6?",
    "Explain why a growing organisation may need IPv6.",
    "Application",
    [
      heading("week-6-ipv6-apply-h", "Apply: why might an organisation need IPv6?"),
      para(
        "week-6-ipv6-apply-p",
        "Think about growth: more staff devices, more sensors, more player connections. Explain the need for more addresses in plain English."
      ),
      short(
        "week-6-ipv6-apply-q",
        "Explain why a growing organisation may need IPv6. Mention IP addresses and connected devices in your answer.",
        "A satisfactory answer says the organisation has more devices joining networks and needs a larger supply of IP addresses than older IPv4 addressing easily provides. Write at least 200 characters."
      )
    ],
    6
  ),

  // D. Blockchain
  activity(
    "week-6-blockchain-intro",
    "What is a blockchain?",
    "Describe blockchain as linked records shared across participants.",
    "Teaching",
    [
      heading("week-6-blockchain-intro-h", "What is a blockchain?"),
      para(
        "week-6-blockchain-intro-p1",
        "A blockchain is a way of recording information in linked blocks. Each new block connects to earlier blocks, forming a chain of records."
      ),
      para(
        "week-6-blockchain-intro-p2",
        "Copies of a blockchain can be maintained across multiple computers or participants. That shared copy idea helps people check the same history rather than trusting only one private notebook."
      ),
      callout(
        "week-6-blockchain-intro-c",
        "Gaming example",
        "Pixel Forge Games could record the ownership history of a digital item, such as a rare skin. Players and the studio could look back at who owned it over time."
      ),
      sc(
        "week-6-blockchain-intro-q1",
        "Which statement best describes a blockchain?",
        [
          "Information recorded in linked blocks that can be shared across multiple participants",
          "A single paper invoice locked in one drawer only",
          "A 5G phone mast",
          "A type of HDMI cable"
        ],
        "a",
        "Correct. Linked blocks plus shared copies are the core Level 2 idea.",
        "Not quite. Focus on linked records that can be shared across participants."
      ),
      sc(
        "week-6-blockchain-intro-q2",
        "Why might a game studio look at a blockchain record for a digital item?",
        [
          "To check the ownership history of that item over time",
          "To print the item as a physical chair automatically",
          "To replace the need for any game art",
          "To turn the item into a WAN cable"
        ],
        "a",
        "Correct. Ownership history is a clear example of what a shared record can show.",
        "Not quite. Think about verifying history, not printing furniture or changing cables."
      )
    ],
    5
  ),
  activity(
    "week-6-blockchain-protect",
    "How blockchain records are protected",
    "Explain cryptographic protection and why changing past records can be difficult.",
    "Teaching",
    [
      heading("week-6-blockchain-protect-h", "How blockchain records are protected"),
      para(
        "week-6-blockchain-protect-p1",
        "Cryptographic techniques help protect records from unauthorised alteration. Cryptography here means mathematical methods that make tampering detectable."
      ),
      para(
        "week-6-blockchain-protect-p2",
        "Because blocks are linked, changing previously recorded information can be difficult. How difficult it is still depends on the blockchain's design and governance (the rules about who can approve changes)."
      ),
      para(
        "week-6-blockchain-protect-p3",
        "Different blockchains can use different methods to agree on new blocks. Do not assume every blockchain works the same way or uses the same amount of energy."
      ),
      sc(
        "week-6-blockchain-protect-q1",
        "How do cryptographic techniques help a blockchain?",
        [
          "They help protect records from unauthorised alteration and make tampering easier to detect",
          "They guarantee every blockchain uses the same energy-heavy method",
          "They delete the need for any rules or governance",
          "They turn every record into a paper letter"
        ],
        "a",
        "Correct. Cryptography supports integrity. Designs and energy use still vary.",
        "Not quite. Protection against unauthorised changes is the key point; methods are not all identical."
      ),
      sc(
        "week-6-blockchain-protect-q2",
        "Why can changing an old blockchain entry be difficult?",
        [
          "Because blocks are linked and the design may make unauthorised rewrites hard to accept",
          "Because blockchains never store any information",
          "Because every blockchain is printed on paper once",
          "Because IP addresses cannot exist on the same planet"
        ],
        "a",
        "Correct. Linked blocks and rules make quiet rewrites harder, depending on design and governance.",
        "Not quite. Difficulty comes from linking and shared rules, not from having no data."
      )
    ],
    5
  ),
  activity(
    "week-6-blockchain-uses",
    "Blockchain uses and limitations",
    "Outline possible uses and balanced limitations without over-claiming.",
    "Teaching",
    [
      heading("week-6-blockchain-uses-h", "Blockchain uses and limitations"),
      para(
        "week-6-blockchain-uses-p1",
        "Possible uses include tracking transactions, verifying the history of digital items, and recording supply-chain information (for example where a component came from)."
      ),
      para(
        "week-6-blockchain-uses-p2",
        "Limitations can include energy use for some blockchain systems, transaction costs, performance, and the difficulty of correcting mistakes once records are accepted. Blockchain is one possible approach. It is not automatically the best solution for every game."
      ),
      sc(
        "week-6-blockchain-uses-q1",
        "Which pair shows a possible use and a possible limitation?",
        [
          "Use: verify digital-item history; limitation: correcting mistakes can be difficult",
          "Use: replace all electricity; limitation: blockchain never stores records",
          "Use: print steel cars overnight; limitation: blockchains cannot use cryptography",
          "Use: remove every network; limitation: games cannot have items"
        ],
        "a",
        "Correct. History checking is a use; hard corrections are a realistic limitation.",
        "Not quite. Pick a genuine record-keeping use paired with a genuine drawback."
      ),
      sc(
        "week-6-blockchain-uses-q2",
        "Pixel Forge is deciding whether to put every cosmetic item on a blockchain. Which judgement is best?",
        [
          "Blockchain is one option; the team should weigh benefits and limits rather than assume it is always best",
          "Every game feature must use blockchain or it will fail",
          "Blockchain never has any costs or limits",
          "Blockchain always uses identical energy-heavy methods"
        ],
        "a",
        "Correct. Treat blockchain as a choice to evaluate, not a default for every feature.",
        "Not quite. Avoid all-or-nothing claims. Designs and trade-offs vary."
      )
    ],
    5
  ),
  activity(
    "week-6-blockchain-apply",
    "Apply: benefit and limitation of blockchain ownership records",
    "Identify one benefit and one limitation of using blockchain for digital item ownership.",
    "Application",
    [
      heading("week-6-blockchain-apply-h", "Apply: benefit and limitation"),
      para(
        "week-6-blockchain-apply-p",
        "Use the Pixel Forge digital-item idea. Give one clear benefit and one clear limitation."
      ),
      short(
        "week-6-blockchain-apply-q",
        "Identify one possible benefit and one limitation of using blockchain to record digital item ownership. Explain each briefly.",
        "A satisfactory answer gives one benefit (for example shared ownership history that is harder to alter without detection) and one limitation (for example cost, performance, energy use for some systems, or difficulty correcting mistakes). Write at least 200 characters."
      )
    ],
    6
  ),

  // E. Serverless computing
  activity(
    "week-6-serverless-intro",
    "What is serverless computing?",
    "Define serverless computing and stress that servers still exist.",
    "Teaching",
    [
      heading("week-6-serverless-intro-h", "What is serverless computing?"),
      para(
        "week-6-serverless-intro-p1",
        "Serverless computing means developers can run code or functions without managing individual servers themselves. The cloud provider manages much of the underlying server infrastructure."
      ),
      para(
        "week-6-serverless-intro-p2",
        "Servers still exist. The word serverless does not mean an application has no servers. It means the team spends less time setting up and patching those servers day to day."
      ),
      callout(
        "week-6-serverless-intro-c",
        "Note",
        "Serverless computing does not mean \"no computers\". It means \"you do not manage the servers yourself\"."
      ),
      sc(
        "week-6-serverless-intro-q1",
        "Which statement about serverless computing is correct?",
        [
          "Servers still exist, but the cloud provider manages much of the infrastructure while developers run code as functions",
          "Serverless means the application truly uses zero computers anywhere",
          "Serverless means every office must host its own physical rack",
          "Serverless is another name for a paper form"
        ],
        "a",
        "Correct. Servers remain; responsibility for much of the infrastructure shifts to the provider.",
        "Not quite. Do not take the word serverless literally as \"no servers at all\"."
      ),
      sc(
        "week-6-serverless-intro-q2",
        "What can developers do in a serverless model?",
        [
          "Run code or functions without managing individual servers themselves",
          "Avoid writing any application logic forever",
          "Force every player to install a server under their desk",
          "Delete the cloud provider's role completely"
        ],
        "a",
        "Correct. Developers focus more on the code and less on day-to-day server care.",
        "Not quite. Serverless changes who manages servers, not whether code is needed."
      )
    ],
    5
  ),
  activity(
    "week-6-serverless-how",
    "How serverless responds to demand",
    "Explain scaling, benefits and limitations at Level 2.",
    "Teaching",
    [
      heading("week-6-serverless-how-h", "How serverless responds to demand"),
      para(
        "week-6-serverless-how-p1",
        "Serverless computing can help applications respond to changing demand. When more events arrive, the provider can run more function instances. When demand drops, less capacity is needed."
      ),
      para(
        "week-6-serverless-how-p2",
        "Possible benefits include reduced infrastructure management and usage-based charging (paying for what runs). Limitations can include execution limits, costs that are hard to predict, and dependence on the cloud provider."
      ),
      sc(
        "week-6-serverless-how-q1",
        "How can serverless computing help when demand changes?",
        [
          "The provider can run more or fewer function instances as events arrive",
          "The application must stay at one fixed size forever",
          "Demand changes are ignored by every cloud service",
          "Players must reboot the whole internet manually"
        ],
        "a",
        "Correct. Responding to changing demand is a core serverless benefit to outline.",
        "Not quite. Think about automatic capacity for short pieces of code as demand rises and falls."
      ),
      sc(
        "week-6-serverless-how-q2",
        "Which pair correctly matches a benefit and a limitation?",
        [
          "Benefit: less day-to-day server management; limitation: dependence on the cloud provider",
          "Benefit: zero computers exist; limitation: code never runs",
          "Benefit: unlimited free execution forever; limitation: providers never matter",
          "Benefit: no application logic needed; limitation: networks disappear"
        ],
        "a",
        "Correct. Less management is a benefit; provider dependence is a real limitation.",
        "Not quite. Keep benefits and limits realistic."
      )
    ],
    5
  ),
  activity(
    "week-6-serverless-pf",
    "Pixel Forge: a serverless reward function",
    "Use a game event example to show serverless code in practice.",
    "Teaching",
    [
      heading("week-6-serverless-pf-h", "Pixel Forge: a serverless reward function"),
      para(
        "week-6-serverless-pf-p1",
        "Example: when a player completes a challenge, Pixel Forge Games could trigger a serverless function to process a reward. The function runs, updates the reward, and stops. The studio does not babysit a dedicated server for that small job all day."
      ),
      para(
        "week-6-serverless-pf-p2",
        "If thousands of players finish at once, the provider can run many copies of that function. Quiet hours need far less capacity."
      ),
      sc(
        "week-6-serverless-pf-q1",
        "In the Pixel Forge example, what does the serverless function do?",
        [
          "It runs code to process a player reward when an event happens",
          "It builds a physical prize machine in the office",
          "It replaces the art team",
          "It turns off all player accounts permanently"
        ],
        "a",
        "Correct. A short function responds to an event without the team managing a whole server for that task.",
        "Not quite. Focus on event-driven code for a reward, not physical machines or staff replacement."
      ),
      sc(
        "week-6-serverless-pf-q2",
        "Why might this approach fit a game studio?",
        [
          "Reward events can spike; serverless can scale those short jobs without constant server care",
          "Games never create events",
          "Cloud providers refuse to run any code",
          "Rewards must be calculated on paper only"
        ],
        "a",
        "Correct. Spiky, short tasks are a classic fit for serverless functions.",
        "Not quite. Think about bursts of player events and reduced server management."
      )
    ],
    4
  ),
  activity(
    "week-6-serverless-apply",
    "Apply: when might serverless help a game developer?",
    "Explain when serverless computing might help a game developer.",
    "Application",
    [
      heading("week-6-serverless-apply-h", "Apply: when might serverless help?"),
      para(
        "week-6-serverless-apply-p",
        "Mention event-driven code, changing demand, or reduced server management. Keep the answer realistic."
      ),
      short(
        "week-6-serverless-apply-q",
        "Explain when serverless computing might help a game developer. Give a simple example of an event or task.",
        "A satisfactory answer mentions running short pieces of code for events (such as rewards or notifications), responding to changing demand, and not managing individual servers day to day. Write at least 200 characters."
      )
    ],
    6
  ),

  // F. SD-WAN
  activity(
    "week-6-sdwan-intro",
    "What is SD-WAN?",
    "Define WAN and Software-Defined Wide Area Network in plain English.",
    "Teaching",
    [
      heading("week-6-sdwan-intro-h", "What is SD-WAN?"),
      para(
        "week-6-sdwan-intro-p1",
        "A wide area network (WAN) connects locations that are far apart, such as offices in different towns. SD-WAN means Software-Defined Wide Area Network."
      ),
      para(
        "week-6-sdwan-intro-p2",
        "SD-WAN uses software-based control to manage connections between different sites. An organisation might use broadband, fibre, or other available connections to link offices or locations."
      ),
      callout(
        "week-6-sdwan-intro-c",
        "Key idea",
        "SD-WAN is about managing site-to-site networking with software. It does not automatically make every connection faster, and it does not remove the need for network security."
      ),
      sc(
        "week-6-sdwan-intro-q1",
        "What does WAN stand for?",
        [
          "Wide area network",
          "Weak app notebook",
          "Wireless art number",
          "Weekly activity note"
        ],
        "a",
        "Correct. WAN expands to wide area network.",
        "Not quite. Wide area network is the expansion you need."
      ),
      sc(
        "week-6-sdwan-intro-q2",
        "What does SD-WAN mean?",
        [
          "Software-Defined Wide Area Network",
          "Super Digital Wallpaper And Notebook",
          "Single Desktop Without Any Network",
          "Secure Drawing With Acrylic Nibs"
        ],
        "a",
        "Correct. SD-WAN expands to Software-Defined Wide Area Network.",
        "Not quite. Expand each part: Software-Defined Wide Area Network."
      )
    ],
    5
  ),
  activity(
    "week-6-sdwan-how",
    "How organisations use SD-WAN",
    "Explain traffic management, monitoring and route selection at Level 2.",
    "Teaching",
    [
      heading("week-6-sdwan-how-h", "How organisations use SD-WAN"),
      para(
        "week-6-sdwan-how-p1",
        "SD-WAN can help manage traffic, monitor connections, and select suitable routes between sites. Central software can apply policies instead of configuring every location by hand in the old way."
      ),
      para(
        "week-6-sdwan-how-p2",
        "Possible benefits include centralised management and improved flexibility when choosing how sites connect. Limitations include setup costs, configuration complexity, dependence on available connections, and ongoing security requirements."
      ),
      sc(
        "week-6-sdwan-how-q1",
        "How can SD-WAN help an organisation?",
        [
          "By using software control to manage and monitor connections between sites and select suitable routes",
          "By deleting the need for any network security",
          "By guaranteeing every download is instant worldwide",
          "By replacing every staff member with a cable"
        ],
        "a",
        "Correct. Software-based control of site links is the core outline.",
        "Not quite. SD-WAN helps manage connections; it does not remove security needs or create magic speed."
      ),
      sc(
        "week-6-sdwan-how-q2",
        "Which limitation should learners remember?",
        [
          "Setup cost, configuration complexity, dependence on available links, and security requirements still matter",
          "SD-WAN has no costs or configuration work",
          "SD-WAN never needs monitoring",
          "SD-WAN only works on paper maps"
        ],
        "a",
        "Correct. Benefits come with real-world limits and security duties.",
        "Not quite. Keep a balanced view of cost, complexity and security."
      )
    ],
    5
  ),
  activity(
    "week-6-sdwan-pf",
    "Pixel Forge: linking several locations",
    "Apply SD-WAN to a main office, studio and second business site.",
    "Teaching",
    [
      heading("week-6-sdwan-pf-h", "Pixel Forge: linking several locations"),
      para(
        "week-6-sdwan-pf-p1",
        "Suppose Pixel Forge Games has a main office, a development studio and another business location. Staff need to share files, join calls and reach internal systems securely and reliably."
      ),
      para(
        "week-6-sdwan-pf-p2",
        "SD-WAN could help the company manage the links between those sites, watch connection health, and choose suitable routes using the broadband or fibre available at each place. Security controls are still required."
      ),
      sc(
        "week-6-sdwan-pf-q1",
        "Why might Pixel Forge consider SD-WAN?",
        [
          "To manage network connections between multiple company locations more flexibly",
          "To avoid connecting the sites at all",
          "To replace game design with network cables",
          "To guarantee that security is never needed again"
        ],
        "a",
        "Correct. Multi-site connectivity is the scenario SD-WAN is designed to help with.",
        "Not quite. Focus on linking locations, not removing networks or security."
      ),
      sc(
        "week-6-sdwan-pf-q2",
        "Which statement is most accurate for this scenario?",
        [
          "SD-WAN can help manage site links, but the company must still plan security and depend on available connections",
          "SD-WAN automatically makes every connection the fastest possible with no planning",
          "SD-WAN removes the studio from the network forever",
          "SD-WAN only works if the company has a single laptop"
        ],
        "a",
        "Correct. Flexibility helps, but security and real link quality still matter.",
        "Not quite. Avoid over-claiming speed or removing security duties."
      )
    ],
    4
  ),
  activity(
    "week-6-sdwan-apply",
    "Apply: why use SD-WAN across locations?",
    "Explain why a company with several locations might use SD-WAN.",
    "Application",
    [
      heading("week-6-sdwan-apply-h", "Apply: why use SD-WAN across locations?"),
      para(
        "week-6-sdwan-apply-p",
        "Mention multiple sites, software-based management of connections, and a realistic benefit such as flexibility or central control."
      ),
      short(
        "week-6-sdwan-apply-q",
        "Explain why a company with several locations might use SD-WAN.",
        "A satisfactory answer mentions linking multiple sites, using software to manage or monitor connections, and a benefit such as centralised management or flexibility. It may also note that security is still needed. Write at least 200 characters."
      )
    ],
    6
  ),

  // G. Match, compare, review
  activity(
    "week-6-match-uses",
    "Match each technology to a suitable use",
    "Match 5G, IPv6, blockchain, serverless computing and SD-WAN to use cases.",
    "Classification",
    [
      heading("week-6-match-uses-h", "Match each technology to a suitable use"),
      para(
        "week-6-match-uses-p",
        "Read each need carefully. Choose the technology that fits best for AC1.1 outlining practice."
      ),
      classify(
        "week-6-match-uses-q",
        "Match each situation to the most suitable technology.",
        [
          { id: "fiveg", label: "5G" },
          { id: "ipv6", label: "IPv6" },
          { id: "chain", label: "Blockchain" },
          { id: "serverless", label: "Serverless computing" },
          { id: "sdwan", label: "SD-WAN" }
        ],
        [
          {
            id: "m1",
            text: "A player needs a responsive mobile gaming experience on a busy network",
            correctCategoryId: "fiveg"
          },
          {
            id: "m2",
            text: "A company has a growing number of connected devices that need IP addresses",
            correctCategoryId: "ipv6"
          },
          {
            id: "m3",
            text: "A developer wants to record the ownership history of a digital item",
            correctCategoryId: "chain"
          },
          {
            id: "m4",
            text: "A game needs to run small pieces of code for events without managing the underlying servers",
            correctCategoryId: "serverless"
          },
          {
            id: "m5",
            text: "A company needs to manage network connections between multiple offices",
            correctCategoryId: "sdwan"
          }
        ],
        {
          correct:
            "Well matched. Mobile responsiveness points to 5G, address growth to IPv6, ownership history to blockchain, event code to serverless computing, and multi-site links to SD-WAN.",
          incorrect:
            "Not quite yet. Match the main need in each sentence: mobile network, IP addresses, shared history, event functions, or site-to-site networking."
        }
      )
    ],
    6
  ),
  activity(
    "week-6-compare",
    "Compare the five technologies",
    "Choose the most relevant technology for specific Pixel Forge situations.",
    "Knowledge check",
    [
      heading("week-6-compare-h", "Compare the five technologies"),
      para(
        "week-6-compare-p",
        "More than one technology can appear in a real project. These questions are written so one answer is the best fit for the main need."
      ),
      sc(
        "week-6-compare-q1",
        "Players at a show complain that mobile matches feel delayed when thousands of phones are online. Which technology is the best first focus?",
        [
          "5G mobile connectivity in suitable conditions",
          "IPv6 address space alone with no mobile network",
          "Blockchain ownership records for every menu font",
          "SD-WAN links between two quiet offices only"
        ],
        "a",
        "Correct. Busy mobile play points first to 5G performance and capacity.",
        "Not quite. The main pain is mobile responsiveness in a crowded place."
      ),
      sc(
        "week-6-compare-q2",
        "Pixel Forge adds thousands of new sensors and staff devices across sites. Which technology most directly addresses the need for many network identities?",
        [
          "IPv6",
          "Blockchain digital-item history",
          "A single serverless reward function",
          "A 5G marketing slogan with no addressing plan"
        ],
        "a",
        "Correct. Growing device counts drive the need for a larger IP address space.",
        "Not quite. Look for the technology about IP addresses."
      ),
      sc(
        "week-6-compare-q3",
        "The studio wants a shared history of who owned a rare digital cape. Which technology fits best?",
        [
          "Blockchain",
          "SD-WAN",
          "5G alone",
          "IPv6 alone"
        ],
        "a",
        "Correct. Ownership history is a classic blockchain-style record use.",
        "Not quite. Shared history of a digital item points to blockchain."
      ),
      sc(
        "week-6-compare-q4",
        "A seasonal event triggers millions of short reward calculations. Which technology fits best?",
        [
          "Serverless computing",
          "IPv6 address planning only",
          "SD-WAN office routing only",
          "Blockchain energy debates only"
        ],
        "a",
        "Correct. Short event-driven code with changing demand suits serverless computing.",
        "Not quite. Focus on running small pieces of code for spikes in events."
      ),
      sc(
        "week-6-compare-q5",
        "The main office, studio and partner site need managed, monitored links. Which technology fits best?",
        [
          "SD-WAN",
          "Blockchain cape history",
          "IPv6 alone without any site links",
          "A serverless function that never uses a network"
        ],
        "a",
        "Correct. Multi-site connection management is the SD-WAN job.",
        "Not quite. Several locations needing managed links point to SD-WAN."
      )
    ],
    7
  ),
  activity(
    "week-6-compare-explain",
    "Explain your comparison choices",
    "Justify how the five technologies differ using short written reasoning.",
    "Application",
    [
      heading("week-6-compare-explain-h", "Explain your comparison choices"),
      para(
        "week-6-compare-explain-p",
        "Show that you can tell the technologies apart. You do not need deep engineering detail."
      ),
      short(
        "week-6-compare-explain-q",
        "In your own words, explain how 5G, IPv6, blockchain, serverless computing and SD-WAN differ. Give one short phrase for what each one mainly helps with.",
        "A satisfactory answer gives a distinct role for each technology, for example: 5G = mobile connectivity; IPv6 = more IP addresses; blockchain = shared linked records; serverless = event code without managing servers; SD-WAN = software-managed links between sites. Write at least 200 characters."
      )
    ],
    7
  ),
  activity(
    "week-6-knowledge-check",
    "Knowledge check: definitions and differences",
    "Check definitions, acronyms and common misunderstandings.",
    "Knowledge check",
    [
      heading("week-6-kc-h", "Knowledge check: definitions and differences"),
      sc(
        "week-6-kc-q1",
        "Which expansion is correct?",
        [
          "SD-WAN means Software-Defined Wide Area Network",
          "IPv6 means Instant Printer version 6",
          "5G means five games only",
          "WAN means weekly art notebook"
        ],
        "a",
        "Correct. Keep the SD-WAN expansion accurate.",
        "Not quite. Check the networking expansions again."
      ),
      sc(
        "week-6-kc-q2",
        "Which statement about serverless computing is true?",
        [
          "Servers still exist; the provider manages much of the infrastructure",
          "No computers are used anywhere in the world",
          "Developers must rack every server themselves",
          "Serverless means the same as blockchain"
        ],
        "a",
        "Correct. The name is misleading if taken literally.",
        "Not quite. Servers still exist under the provider's care."
      ),
      sc(
        "week-6-kc-q3",
        "Which statement about IPv6 is true?",
        [
          "Its main advantage is a much larger address space, not simply being a faster internet",
          "It always doubles speed with no other factors",
          "It removes the need for IP addresses",
          "It only works offline on paper"
        ],
        "a",
        "Correct. Address space is the headline benefit for Level 2 outlining.",
        "Not quite. Avoid the \"IPv6 equals speed\" shortcut."
      ),
      sc(
        "week-6-kc-q4",
        "Which statement about blockchain is balanced?",
        [
          "It can help record shared histories, but designs vary and limits such as cost or hard corrections still matter",
          "Every blockchain uses identical methods and is always the best choice for every game feature",
          "Blockchain never stores information",
          "Blockchain replaces 5G, IPv6, serverless computing and SD-WAN"
        ],
        "a",
        "Correct. Outline uses without claiming one perfect design for everything.",
        "Not quite. Keep a balanced AC1.1-style outline."
      ),
      sc(
        "week-6-kc-q5",
        "Which factor can still limit 5G performance?",
        [
          "Coverage, congestion, the device and the service being used",
          "The colour of the phone case only",
          "Whether the user likes the brand logo",
          "Whether the SIM tray is blue or green"
        ],
        "a",
        "Correct. Real-world conditions matter beyond the 5G label.",
        "Not quite. Think about network and service conditions."
      )
    ],
    6
  ),
  activity(
    "week-6-knowledge-check-b",
    "Knowledge check: practical judgement",
    "Apply the five technologies to short workplace-style cases.",
    "Knowledge check",
    [
      heading("week-6-kcb-h", "Knowledge check: practical judgement"),
      sc(
        "week-6-kcb-q1",
        "A studio wants less day-to-day server care for short reward jobs that spike during events. What should they consider first?",
        [
          "Serverless computing",
          "IPv6 address labels alone",
          "SD-WAN office routing alone",
          "Blockchain cape history alone"
        ],
        "a",
        "Correct. Spiky short jobs map to serverless functions.",
        "Not quite. Look for event-driven cloud code."
      ),
      sc(
        "week-6-kcb-q2",
        "Why might SD-WAN still need security planning?",
        [
          "Linking sites does not remove the need to protect traffic and systems",
          "SD-WAN deletes every security risk automatically",
          "Security only matters for paper letters",
          "Multi-site networks never carry useful data"
        ],
        "a",
        "Correct. Connectivity tools still require security controls.",
        "Not quite. Do not treat SD-WAN as a security replacement."
      ),
      sc(
        "week-6-kcb-q3",
        "A growing esports venue adds hundreds of devices. Which technology most directly helps with address supply?",
        [
          "IPv6",
          "Blockchain only",
          "Serverless reward code only",
          "A poster about 5G with no addressing plan"
        ],
        "a",
        "Correct. More devices need more IP addresses.",
        "Not quite. Address growth points to IPv6."
      ),
      sc(
        "week-6-kcb-q4",
        "Which judgement about blockchain for a cosmetic item is best?",
        [
          "It may help with ownership history, but the team should weigh limits before using it for everything",
          "It must be used for every menu tooltip",
          "It has no costs or design differences",
          "It always consumes identical energy on every network"
        ],
        "a",
        "Correct. Balanced judgement beats automatic adoption.",
        "Not quite. Treat blockchain as an option with trade-offs."
      )
    ],
    5
  ),
  activity(
    "week-6-reflection",
    "Extension: technology profile homework",
    "Optional homework: build a short AC1.1-style profile of one Week 6 technology.",
    "Extension",
    [
      heading("week-6-ref-h", "Extension: technology profile homework"),
      para(
        "week-6-ref-p",
        "Optional homework or research: choose 5G, IPv6, blockchain, serverless computing or SD-WAN and write a short profile you could reuse when outlining technologies for AC1.1 practice. This is formative, not Gateway assignment evidence."
      ),
      reflection(
        "week-6-ref-q",
        "Choose one technology from this week (5G, IPv6, blockchain, serverless computing or SD-WAN). Explain what it is, give one practical example, one benefit, one limitation, and say how it differs from one other technology in this week.",
        500,
        "Sentence starters: The technology I chose is... It means... One practical example is... One benefit is... One limitation is... It differs from ... because... Write at least 500 characters. Paste is disabled."
      )
    ],
    13
  ),
  activity(
    "week-6-exit",
    "Exit ticket",
    "Quick check that you can outline the five technologies and tell them apart.",
    "Exit ticket",
    [
      heading("week-6-exit-h", "Exit ticket"),
      sc(
        "week-6-exit-q1",
        "Which short summary is correct?",
        [
          "5G is mobile connectivity; IPv6 expands IP addresses; blockchain records linked shared history; serverless runs event code without you managing servers; SD-WAN manages links between sites",
          "All five technologies are only about 3D printing plastic",
          "IPv6 means faster VR headsets and SD-WAN means a blockchain wallet",
          "Serverless computing means no computers exist anywhere"
        ],
        "a",
        "Correct. That short summary keeps the five ideas distinct for AC1.1.",
        "Not quite. Keep each technology's main job separate in your outline."
      ),
      para(
        "week-6-exit-p",
        "Before you finish, tell your tutor how confident you feel outlining 5G, IPv6, blockchain, serverless computing and SD-WAN."
      )
    ],
    2
  )
];

const activityIds = week6Activities.map((item) => item.id);

const activitiesPath = path.join(ROOT, "activities.json");
const existing = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const withoutWeek6 = existing.filter((item) => !String(item.id || "").startsWith("week-6-"));
fs.writeFileSync(activitiesPath, `${JSON.stringify([...withoutWeek6, ...week6Activities], null, 2)}\n`);

const sessionsPath = path.join(ROOT, "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8")).filter((item) => item.id !== "week-6-session");
sessions.push(
  envelope(
    "lp.content.session",
    "week-6-session",
    "0.1.0",
    {
      title: "Week 6 session",
      kind: "session",
      summary:
        "One 1.5-hour session: 5G, IPv6, blockchain, serverless computing, SD-WAN, uses, limitations and Pixel Forge Games scenarios (AC1.1).",
      sortOrder: 1,
      defaultOpen: true,
      status: "available"
    },
    { week: "week-6", activities: activityIds }
  )
);
fs.writeFileSync(sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`);

// Planned until a teacher makes it available via the published catalogue; bundled status is the fallback.
const weeksPath = path.join(ROOT, "weeks.json");
const weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8")).filter((item) => item.id !== "week-6");
weeks.push(
  envelope(
    "lp.content.week",
    "week-6",
    "0.1.0",
    {
      teachingWeek: 6,
      title: "5G, IPv6, Blockchain, Serverless Computing and SD-WAN",
      status: "planned",
      professionalPractice: "LO1 / AC 1.1 - outline 5G, IPv6, blockchain, serverless computing and SD-WAN",
      route: "week-6/"
    },
    {
      curriculum: "l2e-exploring-emerging-digital-technologies-curriculum",
      learningOutcomes: ["lo1"],
      assignment: "formative-practice",
      sessions: ["week-6-session"]
    }
  )
);
fs.writeFileSync(weeksPath, `${JSON.stringify(weeks, null, 2)}\n`);

const curriculumPath = path.join(ROOT, "curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));
if (!curriculum.relationships.weeks.includes("week-6")) curriculum.relationships.weeks.push("week-6");
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
for (const act of week6Activities) {
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
