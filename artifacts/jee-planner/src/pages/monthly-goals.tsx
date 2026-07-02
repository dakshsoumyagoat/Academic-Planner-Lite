import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
  useListMonthlyGoals,
  getListMonthlyGoalsQueryKey,
  useCreateMonthlyGoal,
  useUpdateMonthlyGoal,
  useDeleteMonthlyGoal,
  useToggleMonthlyGoal,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  X,
  Check,
  BookOpen,
  FlaskConical,
  Calculator,
  Beaker,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const SUBJECTS = ["Physics", "Chemistry", "Maths", "Custom"];
const PRIORITIES = ["low", "medium", "high"] as const;

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

type GoalFormState = {
  title: string;
  subject: string;
  priority: "low" | "medium" | "high";
  notes: string;
};

const emptyForm = (): GoalFormState => ({
  title: "",
  subject: "Custom",
  priority: "medium",
  notes: "",
});

export default function MonthlyGoals() {
  const [current, setCurrent] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GoalFormState>(emptyForm());
  const { toast } = useToast();
  const qc = useQueryClient();

  const month = current.getMonth() + 1;
  const year = current.getFullYear();
  const queryKey = getListMonthlyGoalsQueryKey({ month, year });

  const { data: goals = [], isLoading } = useListMonthlyGoals(
    { month, year },
    { query: { queryKey } }
  );

  const invalidate = () => qc.invalidateQueries({ queryKey });

  const createGoal = useCreateMonthlyGoal({ mutation: { onSuccess: () => { invalidate(); setShowForm(false); setForm(emptyForm()); } } });
  const updateGoal = useUpdateMonthlyGoal({ mutation: { onSuccess: () => { invalidate(); setEditingId(null); } } });
  const deleteGoal = useDeleteMonthlyGoal({ mutation: { onSuccess: invalidate } });
  const toggleGoal = useToggleMonthlyGoal({ mutation: { onSuccess: invalidate } });

  function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    createGoal.mutate({
      data: { title: form.title.trim(), subject: form.subject, priority: form.priority, notes: form.notes || undefined, month, year },
    });
  }

  function handleSubmitEdit(e: React.FormEvent, id: number) {
    e.preventDefault();
    if (!form.title.trim()) return;
    updateGoal.mutate({
      id,
      data: { title: form.title.trim(), subject: form.subject, priority: form.priority, notes: form.notes || undefined },
    });
  }

  function startEdit(goal: (typeof goals)[0]) {
    setEditingId(goal.id);
    setForm({ title: goal.title, subject: goal.subject, priority: goal.priority as "low" | "medium" | "high", notes: goal.notes ?? "" });
  }

  function handleDelete(id: number) {
    deleteGoal.mutate({ id }, {
      onSuccess: () => toast({ title: "Goal deleted" }),
    });
  }

  const completed = goals.filter((g) => g.completed).length;
  const total = goals.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Monthly Goals</p>
          <h1 className="text-2xl font-bold text-foreground">{format(current, "MMMM yyyy")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrent(subMonths(current, 1))}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent(new Date())}
            className="px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            This Month
          </button>
          <button
            onClick={() => setCurrent(addMonths(current, 1))}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{completed}/{total} done</span>
        </div>
      )}

      {/* Add Goal Form */}
      {showForm ? (
        <Card className="bg-card border-border p-5">
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-foreground">New Goal for {format(current, "MMMM")}</p>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Goal title…"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                <select
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                >
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <select
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as "low" | "medium" | "high" }))}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <textarea
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Notes (optional)…"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }} className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={!form.title.trim()} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                Add Goal
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors w-full justify-center"
        >
          <Plus className="h-4 w-4" />
          Add goal for {format(current, "MMMM")}
        </button>
      )}

      {/* Goals List */}
      <Card className="bg-card border-border overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No goals for {format(current, "MMMM yyyy")}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add goals you want to finish this month</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {goals.map((goal) =>
              editingId === goal.id ? (
                <form key={goal.id} onSubmit={(e) => handleSubmitEdit(e, goal.id)} className="p-4 space-y-3 bg-muted/30">
                  <input
                    autoFocus
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    >
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <select
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none"
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as "low" | "medium" | "high" }))}
                    >
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                  <textarea
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                    placeholder="Notes…"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingId(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
                    <button type="submit" className="p-1.5 rounded-md hover:bg-primary/10 text-primary"><Check className="h-4 w-4" /></button>
                  </div>
                </form>
              ) : (
                <div key={goal.id} className="flex items-start gap-3 p-4 group hover:bg-muted/20 transition-colors">
                  <button
                    onClick={() => toggleGoal.mutate({ id: goal.id })}
                    className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {goal.completed
                      ? <CheckCircle2 className="h-5 w-5 text-primary" />
                      : <Circle className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {goal.title}
                    </p>
                    {goal.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{goal.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-sm font-medium ${subjectColor[goal.subject] ?? subjectColor.Custom}`}>
                      {subjectIcon[goal.subject] ?? subjectIcon.Custom}
                      {goal.subject}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-medium ${priorityColor[goal.priority]}`}>
                      {goal.priority}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1 ml-1">
                      <button onClick={() => startEdit(goal)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
