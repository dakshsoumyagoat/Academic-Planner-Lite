import { useState } from "react";
import {
  useListTasks,
  getListTasksQueryKey,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTask,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, CheckCircle2, Circle, BookOpen, FlaskConical, Calculator, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

type Priority = "low" | "medium" | "high";
type Subject = "Physics" | "Chemistry" | "Maths" | "Custom";

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

interface TaskFormData {
  title: string;
  subject: string;
  chapter: string;
  dueDate: string;
  priority: Priority;
  notes: string;
}

const emptyForm: TaskFormData = {
  title: "",
  subject: "Physics",
  chapter: "",
  dueDate: new Date().toISOString().split("T")[0],
  priority: "medium",
  notes: "",
};

export function TaskFormDialog({
  open,
  onClose,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onClose: () => void;
  initial: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  title: string;
}) {
  const [form, setForm] = useState<TaskFormData>(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
              className="bg-background border-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Maths">Maths</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Chapter (optional)</Label>
            <Input
              value={form.chapter}
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              placeholder="e.g. Kinematics"
              className="bg-background border-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
              className="bg-background border-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any notes..."
              rows={2}
              className="bg-background border-input resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Tasks() {
  const qc = useQueryClient();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [completedFilter, setCompletedFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);

  const params: Record<string, string> = {};
  if (subjectFilter !== "all") params.subject = subjectFilter;
  if (completedFilter !== "all") (params as any).completed = completedFilter === "completed";

  const { data: tasks, isLoading } = useListTasks(params as any, { query: { queryKey: getListTasksQueryKey(params as any) } });

  const createTask = useCreateTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) } });
  const updateTask = useUpdateTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) } });
  const deleteTask = useDeleteTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) } });
  const toggleTask = useToggleTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }) } });

  function handleCreate(data: TaskFormData) {
    createTask.mutate({
      data: {
        title: data.title,
        subject: data.subject,
        chapter: data.chapter || undefined,
        dueDate: data.dueDate,
        priority: data.priority,
        notes: data.notes || undefined,
      }
    });
    setCreateOpen(false);
  }

  function handleEdit(data: TaskFormData) {
    if (!editTask) return;
    updateTask.mutate({
      id: editTask.id,
      data: {
        title: data.title,
        subject: data.subject,
        chapter: data.chapter || null,
        dueDate: data.dueDate,
        priority: data.priority,
        notes: data.notes || null,
      }
    });
    setEditTask(null);
  }

  const filteredTasks = (tasks ?? []).filter((t) => {
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tasks</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-36 bg-card border-border h-8 text-xs">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Chemistry">Chemistry</SelectItem>
            <SelectItem value="Maths">Maths</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32 bg-card border-border h-8 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={completedFilter} onValueChange={setCompletedFilter}>
          <SelectTrigger className="w-32 bg-card border-border h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filteredTasks.length} tasks</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">No tasks found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create a new task to get started</p>
        </Card>
      ) : (
        <Card className="bg-card border-border divide-y divide-border/50">
          {filteredTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 px-4 py-3 group hover:bg-muted/30 transition-colors">
              <button
                onClick={() => toggleTask.mutate({ id: task.id })}
                className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
              >
                {task.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.chapter && <span className="text-xs text-muted-foreground">{task.chapter}</span>}
                  <span className="text-xs text-muted-foreground">{format(parseISO(task.dueDate), "d MMM yyyy")}</span>
                </div>
                {task.notes && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{task.notes}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium ${subjectColor[task.subject] || subjectColor.Custom}`}>
                  {task.subject}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-medium ${priorityColor[task.priority]}`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => setEditTask(task)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteTask.mutate({ id: task.id })}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <TaskFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={emptyForm}
        onSubmit={handleCreate}
        title="New Task"
      />

      {editTask && (
        <TaskFormDialog
          open={true}
          onClose={() => setEditTask(null)}
          initial={{
            title: editTask.title,
            subject: editTask.subject,
            chapter: editTask.chapter ?? "",
            dueDate: editTask.dueDate,
            priority: editTask.priority as Priority,
            notes: editTask.notes ?? "",
          }}
          onSubmit={handleEdit}
          title="Edit Task"
        />
      )}
    </div>
  );
}
