import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Redux/store.js";
import { Toaster, toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

// Prompt before swapping the service worker — never yank the rug.
registerSW({
  onNeedRefresh() {
    toast("A new cut of PlayTube is ready", {
      description: "Reload to get the latest program.",
      action: {
        label: "Reload",
        onClick: () => window.location.reload(),
      },
      duration: Infinity,
    });
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="bottom-right" />
      <App />
    </Provider>
  </React.StrictMode>
);
