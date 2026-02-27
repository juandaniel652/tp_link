import { bootstrapProtectedPage } from "@/core/auth/bootstrap.js";
import { initTurnos } from "@/modules/turnos/index.js";

bootstrapProtectedPage(initTurnos);