import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Redux/store.js";
import { Toaster, toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

// Service worker takes over automatically (autoUpdate + clientsClaim),
// so phones can never sit on a stale shell. Offline-ready toast doubles
// as proof the worker actually registered on the device.
registerSW({
  immediate: true,
  onOfflineReady() {
    toast.success("PlayTube saved for offline", {
      description: "Shell, fonts and media now load without signal.",
      duration: 4000,
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
