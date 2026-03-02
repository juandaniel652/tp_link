document.addEventListener("DOMContentLoaded", async () => {
  await bootstrapProtectedPage(() => {
    initTurnos();
    initClientes();
    initTecnicos();
  });
});