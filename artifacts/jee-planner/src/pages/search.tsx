import { useState } from "react";
import { useListTasks, getListTasksQueryKey, useListTests, getListTestsQueryKey } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { Search as SearchIcon, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const subjectColor: Record<string, string> = {
  Physics: "text-blue-400 bg-blue-400/10",
  Chemistry: "text-emerald-400 bg-emerald-400/10",
  Maths: "text-orange-400 bg-orange-400/10",
  Custom: "text-purple-400 bg-purple-400/10",
};

const testTypeColor: Record<string, string> = {
  jee: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  coaching: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  school: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  mock: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function Search() {
  const [query, setQuery] = useState("");

  const { data: tasks } = useListTasks(
    { search: query || undefined } as any,
    { query: { queryKey: getListTasksQueryKey({ search: query } as any), enabled: query.length > 0 } }
  );

  const { data: tests } = useListTests(
    { search: query || undefined } as any,
    { query: { queryKey: getListTestsQueryKey({ search: query } as any), enabled: query.length > 0 } }
  );

  const hasResults = (tasks && tasks.length > 0) || (tests && tests.length > 0);

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">Search</h1>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks and tests..."
          className="pl-9 bg-card border-border text-base h-11"
          autoFocus
        />
      </div>

      {query.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <SearchIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Start typing to search tasks and tests</p>
        </div>
      )}

      {query.length > 0 && !hasResults && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No results for "{query}"</p>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tasks ({tasks.length})</p>
          <Card className="bg-card border-border divide-y divide-border/50">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5">
                  {task.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.chapter && <span className="text-xs text-muted-foreground">{task.chapter}</span>}
                    <span className="text-xs text-muted-foreground">{format(parseISO(task.dueDate), "d MMM yyyy")}</span>
                  </div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium ${subjectColor[task.subject] || subjectColor.Custom}`}>
                  {task.subject}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tests && tests.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tests ({tests.length})</p>
          <Card className="bg-card border-border divide-y divide-border/50">
            {tests.map((test) => (
              <div key={test.id} className="flex items-center gap-3 px-4 py-3">
                <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{test.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(parseISO(test.date), "d MMM yyyy")} · {test.time}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-medium capitalize ${testTypeColor[test.type] || testTypeColor.mock}`}>
                  {test.type}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
