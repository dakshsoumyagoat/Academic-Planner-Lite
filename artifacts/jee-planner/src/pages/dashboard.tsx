import { useGetDashboard, getGetDashboardQueryKey, useToggleTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Circle, Clock, BookOpen, FlaskConical, Calculator, Beaker } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const subjectIcon: Record<string, React.ReactNode> = {
  Physics: <BookOpen className="h-3.5 w-3.5" />,
  Chemistry: <FlaskConical className="h-3.5 w-3.5" />,
  Maths: <Calculator className="h-3.5 w-3.5" />,
  Custom: <Beaker className="h-3.5 w-3.5" />,
};

const subjectColor: Record<string, string> = {
  Physics: "text-blue-400 bg-blue-400/10",
  Chemistry: "text-emerald-400 bg-emerald-400/10",
  Maths: "text-orange-400 bg-orange-400/10",
  Custom: "text-purple-400 bg-purple-400/10",
};

const priorityColor: Record<string, string> = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const testTypeColor: Record<string, string> = {
  jee: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  coaching: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  school: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  mock: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};


function TaskRow({ task, onToggle }: { task: any; onToggle: (id: number) => void }) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-border/50 last:border-0 group`}>
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.completed ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </p>
        {task.chapter && (
          <p className="text-xs text-muted-foreground mt-0.5">{task.chapter}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-sm font-medium ${subjectColor[task.subject] || subjectColor.Custom}`}>
          {subjectIcon[task.subject] || subjectIcon.Custom}
          {task.subject}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-medium ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  const qc = useQueryClient();
  const toggleTask = useToggleTask({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const today = data?.todayDate ? format(parseISO(data.todayDate), "EEEE, d MMMM yyyy") : "";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Today</p>
        <h1 className="text-2xl font-bold text-foreground">{today}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="bg-card border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Today's Tasks</h2>
            <span className="text-xs text-muted-foreground">{data?.todayTasks?.length ?? 0} tasks</span>
          </div>
          {data?.todayTasks?.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">No tasks scheduled for today</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Time to plan ahead</p>
            </div>
          ) : (
            <div>
              {data?.todayTasks?.map((task: any) => (
                <TaskRow key={task.id} task={task} onToggle={(id) => toggleTask.mutate({ id })} />
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Tests */}
        <Card className="bg-card border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Upcoming Tests</h2>
            <span className="text-xs text-muted-foreground">Next {data?.upcomingTests?.length ?? 0}</span>
          </div>
          {data?.upcomingTests?.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">No upcoming tests</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add tests to track your schedule</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.upcomingTests?.map((test: any) => (
                <div key={test.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{test.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(parseISO(test.date), "d MMM")} · {test.time}
                    </p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-medium capitalize ${testTypeColor[test.type] || testTypeColor.mock}`}>
                    {test.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* This Week's Tasks */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">This Week</h2>
          <span className="text-xs text-muted-foreground">{data?.weekTasks?.length ?? 0} tasks</span>
        </div>
        {data?.weekTasks?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No tasks due this week</p>
        ) : (
          <div>
            {data?.weekTasks?.map((task: any) => (
              <TaskRow key={task.id} task={task} onToggle={(id) => toggleTask.mutate({ id })} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
