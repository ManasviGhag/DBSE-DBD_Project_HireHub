// Backend integration.
// Talks to the HireHub Node/Express backend running at VITE_API_URL.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function parseJsonOrThrow(response, fallbackMessage) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    // no JSON body — fall through to generic error below
  }
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export async function login(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Login failed");
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Registration failed");
}

export async function uploadResume(file, token) {
  const form = new FormData();
  form.append("resume", file);
  const response = await fetch(`${API_BASE_URL}/candidate/resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return parseJsonOrThrow(response, "Resume upload failed");
}

export async function deleteResume(token) {
  const response = await fetch(`${API_BASE_URL}/candidate/resume`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not remove resume");
}

export async function updateResumeDetails(payload, token) {
  const response = await fetch(`${API_BASE_URL}/candidate/resume`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not save resume details");
}

export async function getProfile(token) {
  const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load profile");
}

export async function getMatches(token) {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load matches");
}

export async function getApplications(token) {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load applications");
}

export async function getJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  return parseJsonOrThrow(response, "Could not load jobs");
}

export async function createJob(payload, token) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not create job");
}

export async function applyToJob(jobId, token) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not submit application");
}

export async function withdrawApplication(applicationId, token) {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not withdraw application");
}

export async function getSavedJobs(token) {
  const response = await fetch(`${API_BASE_URL}/candidate/saved-jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load saved jobs");
}

export async function saveJob(jobId, token) {
  const response = await fetch(`${API_BASE_URL}/candidate/saved-jobs/${jobId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not save job");
}

export async function unsaveJob(jobId, token) {
  const response = await fetch(`${API_BASE_URL}/candidate/saved-jobs/${jobId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not remove saved job");
}

export async function updateProfile(payload, token) {
  const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not update profile");
}

export async function getInterviews(token) {
  const response = await fetch(`${API_BASE_URL}/interviews`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load interviews");
}

// Public URL for an uploaded resume, served by the backend at /uploads.
// filePath is the absolute path stored on the Resume document.
export function resumeFileUrl(filePath) {
  if (!filePath) return null;
  const fileName = filePath.split(/[\\/]/).pop();
  const serverBase = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${serverBase}/uploads/${encodeURIComponent(fileName)}`;
}

export async function updateJob(jobId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not update job");
}

export async function updateApplicationStatus(applicationId, status, token) {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return parseJsonOrThrow(response, "Could not update application status");
}

export async function getRecruiterApplicants(token) {
  const response = await fetch(`${API_BASE_URL}/recruiter/applicants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load applicants");
}

export async function scheduleInterview(payload, token) {
  const response = await fetch(`${API_BASE_URL}/interviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not schedule interview");
}

export async function updateInterview(interviewId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not update interview");
}

export async function submitInterviewFeedback(interviewId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not save feedback");
}

export async function getRecruiterStats(token) {
  const response = await fetch(`${API_BASE_URL}/recruiter/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load recruiter stats");
}

export async function createOffer(payload, token) {
  const response = await fetch(`${API_BASE_URL}/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(response, "Could not send offer letter");
}

export async function getOfferForApplication(applicationId, token) {
  const response = await fetch(`${API_BASE_URL}/offers/application/${applicationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load offer letter");
}

export async function getCandidateOffers(token) {
  const response = await fetch(`${API_BASE_URL}/offers/candidate`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not load offer letters");
}

export async function resendOffer(offerId, token) {
  const response = await fetch(`${API_BASE_URL}/offers/${offerId}/resend`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(response, "Could not resend offer letter");
}