import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../index.css";
import { RookiePreview } from "./RookiePreview";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RookiePreview />
  </StrictMode>,
);