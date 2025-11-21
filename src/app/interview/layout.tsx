
export default function InterviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gray-200 h-screen">
          {children}
    </div>
  );
}