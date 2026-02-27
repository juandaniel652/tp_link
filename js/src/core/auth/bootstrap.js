import { checkAuth } from "@/core/auth/token.guard.js";

export function bootstrapProtectedPage(initFunction) {
  document.addEventListener("DOMContentLoaded", async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    initFunction();
  });
}