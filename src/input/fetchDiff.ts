export async function fetchDiff(url: string) {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch diff: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch diff: HTTP ${response.status} ${response.statusText}`);
  }

  return await response.text();
}
