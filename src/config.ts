export const APP_CONFIG = Object.freeze({
  hubId: "l2e-exploring-emerging-digital-technologies",
  hubVersion: "0.1.0",
  courseKey: "gateway-level-2-digital-it-skills",
  siteName: "Exploring New and Emerging Digital Technologies",
  shortName: "L2E Computing Hub",
  qualification: "Gateway Level 2 Digital and IT Skills",
  unitCode: "M/618/3683",
  coreVersion: "0.2.5",
  learnerApiContractVersion: "0.1.0",
  submissionContractVersion: "0.1.0",
  schemaVersion: "0.1.0",
  contentPackageVersion: "0.1.0",
  currentPhase: "Weeks 1 to 3: LO1 / AC 1.1 formative teaching",
  navigation: Object.freeze([
    Object.freeze({ id: "home", label: "Home", path: "" }),
    Object.freeze({ id: "week-1", label: "Week 1", path: "week-1/" }),
    Object.freeze({ id: "week-2", label: "Week 2: IoT, RFID, NFC and wearables", path: "week-2/" }),
    Object.freeze({ id: "week-3", label: "Week 3: Cloud technology - SaaS, IaaS, PaaS, DaaS", path: "week-3/" }),
    Object.freeze({ id: "course-guide", label: "Course Guide", path: "course-guide/" }),
    Object.freeze({ id: "resources", label: "Resources", path: "resources/" }),
    Object.freeze({ id: "help", label: "Help", path: "help/" })
  ]),
  courseSectionIds: Object.freeze([
    "home",
    "week-1",
    "week-2",
    "week-3",
    "course-guide"
  ]),
  features: Object.freeze({
    authentication: true,
    onboarding: true,
    progress: true
  }),
  ui: Object.freeze({
    contextType: "assignment",
    showLearningOutcomes: true,
    showAssignmentContext: true,
    showExamContext: false,
    showProjectContext: false,
    showIndependentStudy: true,
    showProgress: false
  }),
  theme: Object.freeze({
    primary: "#1e4d6b",
    accent: "#2a7a62"
  }),
  curriculumPackage: "content/l2e-exploring-emerging-digital-technologies"
});

export type AppConfig = typeof APP_CONFIG;
export type NavigationItem = (typeof APP_CONFIG.navigation)[number];
