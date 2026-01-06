export default function SidePanel({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <aside className="w-64 shrink-0 sticky top-0 h-screen border-r bg-white p-4">
        <nav className="space-y-3">
          <a href="/staff/grades" className="block">Grades</a>
          <a href="/staff/performance" className="block">Performance</a>
          <a href="/staff/applications" className="block">Applications</a>
          <a href="/staff/events" className="block">Student Life</a>
        </nav>
  
        <div className="mt-6">{children}</div>
      </aside>
    );
  }
  