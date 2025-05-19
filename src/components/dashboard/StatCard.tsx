
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <div
                className={cn(
                  "flex items-center text-xs mt-2",
                  trend.positive ? "text-success" : "text-danger"
                )}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
                <span className="ml-1 text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
