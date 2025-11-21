import DashboardProvider from "./provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <DashboardProvider>
        <div className="p-10">
          {children}
        </div>
      </DashboardProvider>
    </div>
  );
}
