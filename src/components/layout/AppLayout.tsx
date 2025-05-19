
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/sonner";

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
