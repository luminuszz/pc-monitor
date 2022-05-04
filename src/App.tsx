import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { WebcamPage } from "./features/Webcam/webcam.page";

import { loadModels, loadLabels } from "./lib/faceApi";

function App() {
  useEffect(() => {
    Promise.all([loadModels(), loadLabels()]).then(() => {
      console.log("loaded");
    });
  });

  return (
    <div>
      <WebcamPage />
    </div>
  );
}

const container = document.getElementById("root");

const root = createRoot(container);

root.render(<App />);
