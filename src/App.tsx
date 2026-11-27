import { useState } from "react";
import { SparkApp } from "./components/spark/SparkApp";
import { SparkLandingPage } from "./components/spark/SparkLandingPage";

function App() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <SparkLandingPage onEnter={() => setEntered(true)} />;
  }

  return <SparkApp onReturnLanding={() => setEntered(false)} />;
}

export default App;
