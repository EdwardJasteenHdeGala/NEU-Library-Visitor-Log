"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-between text-left h-[3rem] text-[0.625rem] font-black uppercase tracking-tight rounded-[0.75rem] border-2 bg-muted/30 border-border px-3 transition-all active:scale-[0.98] min-w-0 overflow-hidden hover:bg-background focus:bg-background",
              !date && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-[0.5rem]">
              <CalendarIcon className="h-4 w-4 text-primary opacity-50" />
              {date?.from ? (
                date.to ? (
                  <span className="truncate max-w-[12rem]">
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </span>
                ) : (
                  <span className="truncate">
                    {format(date.from, "LLL dd, y")}
                  </span>
                )
              ) : (
                <span className="truncate">Filter Archive by Date Range</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 rounded-[1.25rem] shadow-3xl border-none overflow-hidden bg-card ring-1 ring-border" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className="w-full"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
