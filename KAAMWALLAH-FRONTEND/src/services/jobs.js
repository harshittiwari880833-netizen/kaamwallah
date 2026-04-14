// Completely stubbing out networking layer for bulletproof MVP functionality
const DB_KEY = 'kaam_wallah_posted_jobs';

function getDb() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch { return []; }
}
function saveDb(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  // Fire window event to immediately sync between tabs/components
  window.dispatchEvent(new Event('jobs_updated'));
}

export async function createJob(data) {
  const db = getDb();
  const newJob = { ...data, id: Date.now(), status: 'Pending', createdAt: new Date().toISOString() };
  saveDb([newJob, ...db]);
  return newJob;
}

export async function getMyJobs() {
  return getDb();
}

export async function getJobById(id) {
  return getDb().find(j => j.id === id);
}

export async function updateJobStatus(id, status, assignedWorkerId = null) {
  const db = getDb();
  const idx = db.findIndex(j => j.id === id);
  if(idx !== -1) {
    db[idx].status = status;
    if (assignedWorkerId) db[idx].assignedWorkerId = assignedWorkerId;
    if (status === 'Completed') db[idx].feedbackPending = true;
    saveDb(db);
    return db[idx];
  }
  return null;
}

export async function submitReview(jobId, data) {
  return { success: true };
}
