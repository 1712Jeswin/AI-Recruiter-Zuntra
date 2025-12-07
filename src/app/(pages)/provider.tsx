import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './_components/AppSidebar';


const DashboardProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full p-4">
        <SidebarTrigger className="fixed" />
        {/* <WelcomeContainer /> */}
        {children}</div>
    </SidebarProvider>
  );
};

export default DashboardProvider;
