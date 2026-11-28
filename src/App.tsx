import { useEffect, useState } from "react";
import { SparkApp } from "./components/spark/SparkApp";
import { SparkLandingPage } from "./components/spark/SparkLandingPage";
import { INITIAL_SPARK_NOTES } from "./components/spark/sparkData";
import { warmCjkFontSubsets } from "./utils/fontWarmup";

const WORKSPACE_TEXT = INITIAL_SPARK_NOTES.map((note) =>
  [
    note.aiTitle,
    note.content,
    note.tags.join(" "),
    note.cluster,
    note.clozeTerms.join(" "),
    note.question,
    note.plainExplanation,
  ].join(" "),
).join(" ");

const EXIT_MS = 220;

function App() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    warmCjkFontSubsets(WORKSPACE_TEXT);
  }, []);

  function enter() {
    if (leaving) return;
    setLeaving(true);
    warmCjkFontSubsets(WORKSPACE_TEXT);
    window.setTimeout(() => setShowWorkspace(true), EXIT_MS);
  }

  function backToLanding() {
    setShowWorkspace(false);
    setLeaving(false);
  }

  if (showWorkspace) {
    return <SparkApp onReturnLanding={backToLanding} />;
  }

  return <SparkLandingPage onEnter={enter} exiting={leaving} />;
}

export default App;
