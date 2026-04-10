"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void
  minDate?: Date
}

export function DateRangePicker({ onDateRangeChange, minDate = new Date() }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isSelectingRange, setIsSelectingRange] = useState(false)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateDisabled = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date(minDate)
    today.setHours(0, 0, 0, 0)
    clickedDate.setHours(0, 0, 0, 0)
    return clickedDate < today
  }

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return

    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    if (!startDate) {
      setStartDate(clickedDate)
      setIsSelectingRange(true)
    } else if (!endDate) {
      if (clickedDate < startDate) {
        setEndDate(startDate)
        setStartDate(clickedDate)
      } else {
        setEndDate(clickedDate)
      }
      onDateRangeChange(startDate, clickedDate)
      setIsSelectingRange(false)
    } else {
      setStartDate(clickedDate)
      setEndDate(null)
      setIsSelectingRange(true)
    }
  }

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return currentDate >= startDate && currentDate <= endDate
  }

  const isStartDate = (day: number) => {
    if (!startDate) return false
    return (
      day === startDate.getDate() &&
      currentMonth.getMonth() === startDate.getMonth() &&
      currentMonth.getFullYear() === startDate.getFullYear()
    )
  }

  const isEndDate = (day: number) => {
    if (!endDate) return false
    return (
      day === endDate.getDate() &&
      currentMonth.getMonth() === endDate.getMonth() &&
      currentMonth.getFullYear() === endDate.getFullYear()
    )
  }

  const days = []
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Travel Dates</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          {startDate && <p>Departure: {startDate.toDateString()}</p>}
          {endDate && <p>Return: {endDate.toDateString()}</p>}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-semibold">{monthName}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleDateClick(day)}
            disabled={!day || (day ? isDateDisabled(day) : false)}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              !day
                ? "opacity-0 cursor-default"
                : day && isDateDisabled(day)
                  ? "text-muted-foreground opacity-40 cursor-not-allowed"
                  : isStartDate(day) || isEndDate(day)
                    ? "bg-primary text-primary-foreground"
                    : isDateInRange(day)
                      ? "bg-primary/30 text-foreground"
                      : "hover:bg-secondary text-foreground cursor-pointer"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {startDate && endDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-green-600 font-semibold text-center p-2 bg-green-100/20 rounded-lg"
        >
          {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days selected
        </motion.div>
      )}
    </motion.div>
  )
}
