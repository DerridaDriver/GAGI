const SESSION_STORAGE_KEY = "gagi_session_id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getOrCreateSessionId() {
  const storedSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (storedSessionId && UUID_PATTERN.test(storedSessionId)) {
    return storedSessionId;
  }

  const newSessionId = window.crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
  return newSessionId;
}
