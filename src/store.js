const sessions = new Map();

export function createSession(session) {
  sessions.set(session.id, session);
  return session;
}

export function getSession(id) {
  return sessions.get(id);
}

export function updateSession(id, updates) {
  const current = sessions.get(id);
  if (!current) return null;

  const next = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  sessions.set(id, next);
  return next;
}

export function listSessions() {
  return Array.from(sessions.values());
}
