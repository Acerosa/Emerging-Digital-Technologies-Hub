import { createRoot } from "react-dom/client";
import "@learning-platform/core/theme.css";
import "../css/hub.css";
import bundledPackage from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import "./theme-bootstrap";
import "./globals";
import { App } from "./App";
import { configureBundledPackage } from "./curriculum/runtime-weeks";
import type { ContentPackage } from "./curriculum/from-package";
import { readPageContext } from "./page-context";

configureBundledPackage(bundledPackage as ContentPackage);

const root = document.getElementById("root");
if (!root) throw new Error("LP_ROOT_MISSING");

createRoot(root).render(<App context={readPageContext()} />);
