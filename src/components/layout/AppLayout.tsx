import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileTabBar } from '@/components/layout/MobileTabBar';

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <Outlet />
        </main>
        <MobileTabBar />
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
