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
              "w-full justify-start text-left font-normal h-[3rem] text-[0.75rem] rounded-[0.75rem] border-2 bg-white shadow-inner gap-2",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 text-primary opacity-50" />
            {date?.from ? (
              date.to ? (
                <span className="font-bold text-slate-800 text-[0.625rem] md:text-[0.75rem]">
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </span>
              ) : (
                <span className="font-bold text-slate-800 text-[0.625rem] md:text-[0.75rem]">
                  {format(date.from, "LLL dd, y")}
                </span>
              )
            ) : (
              <span className="font-black uppercase tracking-widest text-[0.625rem]">Filter Archive by Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-[1.25rem] shadow-2xl border border-slate-100 overflow-hidden" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className="bg-white p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
