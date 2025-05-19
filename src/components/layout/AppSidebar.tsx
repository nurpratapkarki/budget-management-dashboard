import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  PieChart, 
  BarChart, 
  Calendar, 
  Home, 
  Settings, 
  ListTodo,
  LogOut,
  UserCircle,
  Smile
} from "lucide-react";
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: Home,
    },
    {
      title: "Expenses",
      path: "/expenses",
      icon: BarChart,
    },
    {
      title: "Budgets",
      path: "/budgets",
      icon: PieChart,
    },
    {
      title: "Tasks",
      path: "/tasks",
      icon: ListTodo,
    },
    {
      title: "Calendar",
      path: "/calendar",
      icon: Calendar,
    },
    {
      title: "Mood",
      path: "/mood",
      icon: Smile,
    }
  ];
  
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1">
            <PieChart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="font-semibold text-lg">BudgetTracker</div>
          <SidebarTrigger className="ml-auto md:hidden" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className={cn(
                        "flex items-center gap-3",
                        isActivePath(item.path) && "text-primary font-medium"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {isActivePath(item.path) && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 space-y-2">
        <SidebarMenuButton asChild>
          <Link to="/profile" className={cn(
            "flex items-center gap-3",
            isActivePath("/profile") && "text-primary font-medium"
          )}>
            <UserCircle className="h-5 w-5" />
            <span>Profile</span>
            {isActivePath("/profile") && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>
            )}
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton onClick={handleLogout} className="w-full flex items-center gap-3 text-red-500 hover:text-red-600">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
