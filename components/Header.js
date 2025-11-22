'use client';

export default function Header({ title }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          U
        </div>
        <span className="text-sm font-medium text-slate-700">User</span>
      </div>
    </header>
  );
}
