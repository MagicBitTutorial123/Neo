export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <main className="flex-1 flex flex-col bg-white">{children}</main>
    </div>
  );
}
