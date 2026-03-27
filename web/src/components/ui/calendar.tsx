import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
}

function Calendar({ mode = "single", selected, onSelect, className, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-xs text-muted-foreground font-medium py-1">
            {wd}
          </div>
        ))}
        {days.map((d, i) => {
          const isSelected = selected ? isSameDay(d, selected) : false;
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isDisabled = disabled ? disabled(d) : false;

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && onSelect) {
                  onSelect(isSelected ? null : d);
                }
              }}
              className={cn(
                "h-8 w-8 rounded-md text-sm flex items-center justify-center transition-colors",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isCurrentMonth && "hover:bg-accent",
                isToday(d) && "bg-accent font-semibold",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                isDisabled && "pointer-events-none opacity-50"
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
