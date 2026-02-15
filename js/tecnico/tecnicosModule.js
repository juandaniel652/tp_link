import UIHandler from "./UIHandler.js";

document.addEventListener("DOMContentLoaded", async () => {
  const ui = new UIHandler("#formGeneral", "#generalContainer");
  await ui.renderTabla();
});
