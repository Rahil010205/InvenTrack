import { headers } from 'next/headers';

export async function fetchAPI(path) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const cookie = headersList.get('cookie');

  const res = await fetch(`${baseUrl}/api${path}`, {
    headers: {
      Cookie: cookie || '',
    },
    cache: 'no-store', // Ensure fresh data
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`API call failed: ${res.statusText}`);
  }

  return res.json();
}
