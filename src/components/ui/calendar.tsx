"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Calendar component architectural fix for react-day-picker v9.
 * Correctly handles Chevron icons without invalid prop spreading.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-2 relative items-center mb-8 px-2",
        caption_label: "text-[0.625rem] font-black uppercase tracking-[0.2em] text-foreground border-b-2 border-primary/20 pb-1",
        nav: "space-x-1 flex items-center absolute right-2 top-2 z-10",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full transition-all hover:bg-muted active:scale-95 border border-transparent hover:border-border/50"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        month_grid: "w-full border-collapse table-fixed",
        weekdays: "flex w-full mb-2",
        weekday: "text-muted-foreground rounded-md font-black text-[0.625rem] uppercase tracking-tighter text-center h-10 w-[14.285%]",
        week: "flex w-full mt-1",
        day: "h-10 w-[14.285%] text-center text-sm p-0 m-0 relative",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-bold text-[0.75rem] mx-auto flex items-center justify-center transition-all hover:scale-110 aria-selected:opacity-100 rounded-[0.5rem] relative z-20"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-secondary hover:bg-primary/90 hover:text-secondary focus:bg-primary focus:text-secondary shadow-[0_0_20px_hsl(var(--primary)/0.4)] scale-110 z-30 ring-2 ring-primary/20",
        today: "bg-muted text-secondary font-black ring-1 ring-primary/30 shadow-inner",
        outside:
          "outside text-muted-foreground/30 aria-selected:bg-muted aria-selected:text-muted-foreground/30 opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-muted aria-selected:text-primary",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
