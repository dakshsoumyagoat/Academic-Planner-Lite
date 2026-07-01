import { useState } from "react";
import { useListTasks, getListTasksQueryKey, useListTests, getListTestsQueryKey } from "@workspace/api-client-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subjectDot: Record<string, string> = {
  Physics: "bg-blue-400",
  Chemistry: "bg-emerald-400",
  Maths: "bg-orange-400",
  Custom: "bg-purple-400",
};

const testTypeDot: Record<string, string> = {
  jee: "bg-indigo-400",
  coaching: "bg-blue-300",
  school: "bg-emerald-300",
  mock: "bg-amber-400",
};

const testTypeColor: Record<string, string> = {
  jee: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  coaching: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  school: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  mock: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: tasks } = useListTasks({} as any, { query: { queryKey: getListTasksQueryKey({} as any) } });
  const { data: tests } = useListTests({} as any, { query: { queryKey: getListTestsQueryKey({} as any) } });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasksByDate: Record<string, any[]> = {};
  (tasks ?? []).forEach((t) => {
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  });

  const testsByDate: Record<string, any[]> = {};
  (tests ?? []).forEach((t) => {
    if (!testsByDate[t.date]) testsByDate[t.date] = [];
    testsByDate[t.date].push(t);
  });

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];
  const selectedTests = selectedDate ? (testsByDate[selectedDate] ?? []) : [];

  const startDay = getDay(monthStart);
  const emptyBefore = Array(startDay).fill(null);

  return (
    <div className="flex gap-6 max-w-5xl">
      {/* Calendar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px">
            {emptyBefore.map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate[dateStr] ?? [];
              const dayTests = testsByDate[dateStr] ?? [];
              const hasItems = dayTasks.length > 0 || dayTests.length > 0;
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`relative flex flex-col items-center pt-2 pb-1 rounded-md transition-all min-h-[56px] ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isTodayDate
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? "text-primary-foreground" : isTodayDate ? "text-primary font-bold" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {hasItems && (
                    <div className="flex items-center gap-0.5 mt-1 flex-wrap justify-center max-w-[40px]">
                      {dayTasks.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground/70" : (subjectDot[t.subject] || "bg-purple-400")}`}
                        />
                      ))}
                      {dayTests.slice(0, 2).map((t, idx) => (
                        <span
                          key={`test-${idx}`}
                          className={`w-1.5 h-1.5 rounded-sm ${isSelected ? "bg-primary-foreground/70" : (testTypeDot[t.type] || "bg-indigo-400")}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Tasks:</span>
            {Object.entries(subjectDot).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${c}`} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Day Panel */}
      {selectedDate && (
        <div className="w-72 flex-shrink-0">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {format(parseISO(selectedDate), "d MMMM yyyy")}
          </h2>

          {selectedTasks.length === 0 && selectedTests.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">Nothing scheduled</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedTests.length > 0 && (
                <Card className="bg-card border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tests</p>
                  <div className="space-y-2">
                    {selectedTests.map((test) => (
                      <div key={test.id} className="flex items-center gap-2">
                        <ClipboardList className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{test.name}</p>
                          <p className="text-xs text-muted-foreground">{test.time}</p>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded border font-medium capitalize ${testTypeColor[test.type] || testTypeColor.mock}`}>
                          {test.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {selectedTasks.length > 0 && (
                <Card className="bg-card border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tasks</p>
                  <div className="space-y-2">
                    {selectedTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-2">
                        {task.completed
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          : <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"} truncate`}>
                            {task.title}
                          </p>
                          {task.chapter && <p className="text-xs text-muted-foreground">{task.chapter}</p>}
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-medium ${
                          task.subject === "Physics" ? "text-blue-400" :
                          task.subject === "Chemistry" ? "text-emerald-400" :
                          task.subject === "Maths" ? "text-orange-400" : "text-purple-400"
                        }`}>
                          {task.subject.slice(0, 3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
