import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Budgets from "@/pages/Budgets";
import Tasks from "@/pages/Tasks";
import Calendar from "@/pages/Calendar";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import MoodPage from "@/pages/Mood";
import ProfilePage from "@/pages/Profile";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Auth protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // You can add a loading spinner here if you want
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/mood" element={<MoodPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </NextThemesProvider>
  </QueryClientProvider>
);

export default App;
