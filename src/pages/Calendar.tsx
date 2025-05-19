
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const Calendar: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="mx-auto"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
