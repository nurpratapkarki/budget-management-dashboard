import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart, PieChart, ListTodo, Smile, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Home',
    icon: Home,
    path: '/'
  },
  {
    title: 'Expenses',
    icon: BarChart,
    path: '/expenses'
  },
  {
    title: 'Budgets',
    icon: PieChart,
    path: '/budgets'
  },
  {
    title: 'Tasks',
    icon: ListTodo,
    path: '/tasks'
  },
  {
    title: 'Mood',
    icon: Smile,
    path: '/mood'
  },
  {
    title: 'Profile',
    icon: UserCircle,
    path: '/profile'
  }
];

export function MobileTabBar() {
  const location = useLocation();
  const [showAll, setShowAll] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      setShowAll(window.innerWidth > 400);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Limit items for smaller screens
  const displayItems = showAll ? navItems : navItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {displayItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center text-muted-foreground transition-colors px-1",
              isActive(item.path) && "text-primary"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              isActive(item.path) ? "text-primary" : "text-muted-foreground" 
            )} />
            <span className="text-xs font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 