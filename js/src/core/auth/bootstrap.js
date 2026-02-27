// js/src/core/auth/bootstrap.js

import { checkAuth } from "@/core/auth/token.guard.js";

export async function bootstrapProtectedPage(initFunction) {
  const isAuth = await checkAuth();

  if (!isAuth) return;

  try {
    await initFunction();
  } catch (error) {
    console.error("Error inicializando módulo:", error);
  }
}