import { verifyJWT } from '@/lib/auth';

export async function getTenantId(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  return payload.tenant_id;
}
