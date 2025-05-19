import React from 'react';

interface PageHeaderProps {
  heading: string;
  text?: string;
}

export function PageHeader({ heading, text }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 pb-4 border-b">
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
} 