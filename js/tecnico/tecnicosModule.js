import UIHandler from "./UIHandler.js";

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UIHandler("#formGeneral", "#generalContainer");
  ui.renderTabla();
});
