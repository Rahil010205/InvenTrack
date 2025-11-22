import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token);
  const userName = payload?.name || 'User';

  return (
    <div className="flex h-screen bg-background transition-colors">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={userName} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
