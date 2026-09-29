import { notificarN8n } from "./n8nService.js";

export function sendUserWebhook(userData, actionType = "NEW_USER_CREATED") {
  const { password, ...safeUser } = userData || {};
  return notificarN8n("user-created", { event: actionType, timestamp: new Date().toISOString(), data: safeUser });
}
