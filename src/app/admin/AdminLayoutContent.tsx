import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import type { User } from 'firebase/auth';

export default function AdminLayoutContent({ children, user }: { children: React.ReactNode, user: User | null }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar className="hidden border-r bg-muted/40 md:flex" />
      <div className="flex flex-col">
        <AdminHeader user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
          {children}
        </main>
      </div>
    </div>
  );
}
