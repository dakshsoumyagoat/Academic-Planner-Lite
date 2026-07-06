import { useState, useEffect } from "react";
import { useListTasks, getListTasksQueryKey, useListTests, getListTestsQueryKey, useCreateTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  parseISO,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, ClipboardList, Palmtree, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskFormDialog } from "@/pages/tasks";

const subjectDot: Record<string, string> = {
  Physics: "bg-blue-400",
  Chemistry: "bg-emerald-400",
  Maths: "bg-orange-400",
  Custom: "bg-purple-400",
};

const testTypeDot: Record<string, string> = {
  jee: "bg-indigo-400",
  coaching: "bg-blue-300",
  school: "bg-green-300",
  mock: "bg-amber-400",
};

const testTypeColor: Record<string, string> = {
  jee: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  coaching: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  school: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  mock: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

interface Holiday {
  id: number;
  name: string;
  date: string;
}

export default function Calendar() {
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const { data: tasks } = useListTasks({} as any, { query: { queryKey: getListTasksQueryKey({} as any) } });
  const { data: tests } = useListTests({} as any, { query: { queryKey: getListTestsQueryKey({} as any) } });
  const createTask = useCreateTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) } });

  useEffect(() => {
    fetch("/api/holidays", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setHolidays(Array.isArray(data) ? data : []))
      .catch(() => setHolidays([]));
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasksByDate: Record<string, any[]> = {};
  (tasks ?? []).forEach((t: any) => {
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate]?.push(t);
  });

  const testsByDate: Record<string, any[]> = {};
  (tests ?? []).forEach((t: any) => {
    if (!testsByDate[t.date]) testsByDate[t.date] = [];
    testsByDate[t.date]?.push(t);
  });

  const holidaysByDate: Record<string, Holiday[]> = {};
  holidays.forEach((h) => {
    if (!holidaysByDate[h.date]) holidaysByDate[h.date] = [];
    holidaysByDate[h.date].push(h);
  });

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];
  const selectedTests = selectedDate ? (testsByDate[selectedDate] ?? []) : [];
  const selectedHolidays = selectedDate ? (holidaysByDate[selectedDate] ?? []) : [];

  const startDay = getDay(monthStart);
  const emptyBefore = Array(startDay).fill(null);

  function handleAddTask(data: { title: string; subject: string; chapter: string; dueDate: string; priority: "low" | "medium" | "high"; notes: string }) {
    createTask.mutate({
      data: {
        title: data.title,
        subject: data.subject,
        chapter: data.chapter || undefined,
        dueDate: data.dueDate,
        priority: data.priority,
        notes: data.notes || undefined,
      },
    });
    setAddTaskOpen(false);
  }

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
              const dayHolidays = holidaysByDate[dateStr] ?? [];
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(day);
              const isHoliday = dayHolidays.length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`relative flex flex-col items-center pt-2 pb-1 rounded-md transition-all min-h-[56px] ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isHoliday
                      ? "bg-rose-500/8 text-foreground"
                      : isTodayDate
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    isSelected ? "text-primary-foreground" :
                    isTodayDate ? "text-primary font-bold" :
                    isHoliday ? "text-rose-400" : ""
                  }`}>
                    {format(day, "d")}
                  </span>
                  <div className="flex items-center gap-0.5 mt-1 flex-wrap justify-center max-w-[40px]">
                    {isHoliday && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground/70" : "bg-rose-400"}`} />
                    )}
                    {dayTests.slice(0, 2).map((t: any, idx: any) => (
                      <span
                        key={`test-${idx}`}
                        className={`w-1.5 h-1.5 rounded-sm ${isSelected ? "bg-primary-foreground/70" : (testTypeDot[t.type] || "bg-indigo-400")}`}
                      />
                    ))}
                    {dayTasks.slice(0, 2).map((t: any, idx: any) => (
                      <span
                        key={`task-${idx}`}
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground/70" : (subjectDot[t.subject] || "bg-purple-400")}`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-x-4 gap-y-1.5 mt-3 flex-wrap text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />Holiday</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-400" />JEE</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400" />Mock</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-300" />Coaching</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-300" />School</span>
          <span className="flex items-center gap-1 border-l border-border/50 pl-3"><span className="w-2 h-2 rounded-full bg-blue-400" />Physics</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Chemistry</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Maths</span>
        </div>
      </div>

      {/* Day Panel */}
      {selectedDate && (
        <div className="w-72 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {format(parseISO(selectedDate), "d MMMM yyyy")}
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => setAddTaskOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </Button>
          </div>

          {selectedTasks.length === 0 && selectedTests.length === 0 && selectedHolidays.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">Nothing scheduled</p>
              <button
                onClick={() => setAddTaskOpen(true)}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Add a task for this day
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Holidays */}
              {selectedHolidays.length > 0 && (
                <Card className="bg-rose-500/5 border-rose-500/20 p-3">
                  <p className="text-xs text-rose-400 uppercase tracking-wider font-medium mb-2">Holiday</p>
                  <div className="space-y-1.5">
                    {selectedHolidays.map((h) => (
                      <div key={h.id} className="flex items-center gap-2">
                        <Palmtree className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                        <p className="text-xs font-medium text-foreground">{h.name}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tests */}
              {selectedTests.length > 0 && (
                <Card className="bg-card border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tests</p>
                  <div className="space-y-2">
                    {selectedTests.map((test: any) => (
                      <div key={test.id} className="flex items-start gap-2">
                        <ClipboardList className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground leading-snug">{test.name}</p>
                          <p className="text-xs text-muted-foreground">{test.time}{test.notes ? ` · ${test.notes}` : ""}</p>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded border font-medium capitalize flex-shrink-0 ${testTypeColor[test.type] || testTypeColor.mock}`}>
                          {test.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tasks */}
              {selectedTasks.length > 0 && (
                <Card className="bg-card border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tasks</p>
                  <div className="space-y-2">
                    {selectedTasks.map((task: any) => (
                      <div key={task.id} className="flex items-start gap-2">
                        {task.completed
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          : <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"} leading-snug`}>
                            {task.title}
                          </p>
                          {task.chapter && <p className="text-xs text-muted-foreground">{task.chapter}</p>}
                        </div>
                        <span className={`text-xs font-medium flex-shrink-0 ${
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

      {/* Add Task Dialog — pre-filled with selected date */}
      {selectedDate && (
        <TaskFormDialog
          open={addTaskOpen}
          onClose={() => setAddTaskOpen(false)}
          initial={{
            title: "",
            subject: "Physics",
            chapter: "",
            dueDate: selectedDate,
            priority: "medium",
            notes: "",
          }}
          onSubmit={handleAddTask}
          title={`New Task — ${format(parseISO(selectedDate), "d MMM yyyy")}`}
        />
      )}
    </div>
  );
}
