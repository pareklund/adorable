export function extractProjectIdFromUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = window.location.href;
  const lovableProjectMatch = url.match(/lovable\.dev\/projects\/([a-zA-Z0-9-_]+)/);
  
  if (lovableProjectMatch) {
    return lovableProjectMatch[1];
  }

  return null;
}

export function getProjectId(): string {
  const projectId = extractProjectIdFromUrl();
  if (!projectId) {
    return "42";
//    throw new Error('Unable to extract project ID from URL');
  }
  return projectId;
}