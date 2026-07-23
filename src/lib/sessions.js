// src/lib/sessions.js
// Plain fetch to Supabase REST API — no npm package needed

function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function makeHeaders(key) {
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Prefer': 'return=representation',
  };
}

export async function createSession({ type, name }) {
  const { url, key } = getConfig();
  const res = await fetch(url + '/rest/v1/interview_sessions', {
    method: 'POST',
    headers: makeHeaders(key),
    body: JSON.stringify({
      type,
      name: name || 'Anonymous',
      status: 'in-progress',
      questions: [],
      answers: [],
      feedbacks: [],
      score: null,
      overall_feedback: null,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return Array.isArray(data) ? data[0].id : data.id;
}

export async function updateSession(id, payload) {
  const { url, key } = getConfig();
  const body = { updated_at: new Date().toISOString() };
  if (payload.questions !== undefined) body.questions = payload.questions;
  if (payload.answers !== undefined)   body.answers   = payload.answers;
  if (payload.feedbacks !== undefined) body.feedbacks = payload.feedbacks;
  if (payload.status !== undefined)    body.status    = payload.status;
  const res = await fetch(url + '/rest/v1/interview_sessions?id=eq.' + id, {
    method: 'PATCH',
    headers: makeHeaders(key),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function completeSession(id, { score, overallFeedback }) {
  const { url, key } = getConfig();
  const res = await fetch(url + '/rest/v1/interview_sessions?id=eq.' + id, {
    method: 'PATCH',
    headers: makeHeaders(key),
    body: JSON.stringify({
      status: 'completed',
      score,
      overall_feedback: overallFeedback,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getSessions() {
  const { url, key } = getConfig();
  const res = await fetch(
    url + '/rest/v1/interview_sessions?order=created_at.desc',
    { headers: makeHeaders(key) }
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getSession(id) {
  const { url, key } = getConfig();
  const res = await fetch(
    url + '/rest/v1/interview_sessions?id=eq.' + id + '&limit=1',
    { headers: makeHeaders(key) }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data[0] || null;
}
