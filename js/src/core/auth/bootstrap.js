import { requireAuth }    from "@/core/auth/token.guard.js";
import { sessionManager } from "@/core/auth/session.manager.js";

export async function bootstrapProtectedPage(initFunction) {
  const isAuthenticated = await requireAuth();
  if (!isAuthenticated) return;

  // Iniciar gestión de sesión — null hasta que tengas endpoint de refresh
  sessionManager.init(null);

  initFunction();
}