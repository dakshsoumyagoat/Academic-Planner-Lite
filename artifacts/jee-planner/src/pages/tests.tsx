import { useState } from "react";
import {
  useListTests,
  getListTestsQueryKey,
  useCreateTest,
  useUpdateTest,
  useDeleteTest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

type TestType = "coaching" | "school" | "mock" | "jee";

const testTypeColor: Record<string, string> = {
  jee: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  coaching: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  school: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  mock: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

interface TestFormData {
  name: string;
  date: string;
  time: string;
  type: TestType;
  notes: string;
}

const emptyForm: TestFormData = {
  name: "",
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  type: "mock",
  notes: "",
};

function TestFormDialog({
  open,
  onClose,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onClose: () => void;
  initial: TestFormData;
  onSubmit: (data: TestFormData) => void;
  title: string;
}) {
  const [form, setForm] = useState<TestFormData>(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
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
            <Label>Test Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. BASE PU DPP Test 12"
              required
              className="bg-background border-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
                className="bg-background border-input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TestType })}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jee">JEE</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="mock">Mock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Syllabus, venue, etc."
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

export default function Tests() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTest, setEditTest] = useState<any | null>(null);

  const { data: tests, isLoading } = useListTests({}, { query: { queryKey: getListTestsQueryKey({}) } });

  const createTest = useCreateTest({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTestsQueryKey() }) } });
  const updateTest = useUpdateTest({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTestsQueryKey() }) } });
  const deleteTest = useDeleteTest({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTestsQueryKey() }) } });

  function handleCreate(data: TestFormData) {
    createTest.mutate({ data: { name: data.name, date: data.date, time: data.time, type: data.type, notes: data.notes || undefined } });
    setCreateOpen(false);
  }

  function handleEdit(data: TestFormData) {
    if (!editTest) return;
    updateTest.mutate({ id: editTest.id, data: { name: data.name, date: data.date, time: data.time, type: data.type, notes: data.notes || null } });
    setEditTest(null);
  }

  const filtered = (tests ?? []).filter((t) => typeFilter === "all" || t.type === typeFilter);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = filtered.filter((t) => t.date >= today);
  const past = filtered.filter((t) => t.date < today);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tests</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Test
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 bg-card border-border h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="jee">JEE</SelectItem>
            <SelectItem value="coaching">Coaching</SelectItem>
            <SelectItem value="school">School</SelectItem>
            <SelectItem value="mock">Mock</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} tests</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">No tests scheduled</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Add your first test to start tracking</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Upcoming</p>
              <Card className="bg-card border-border divide-y divide-border/50">
                {upcoming.map((test) => (
                  <TestRow key={test.id} test={test} onEdit={setEditTest} onDelete={(id) => deleteTest.mutate({ id })} />
                ))}
              </Card>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Past</p>
              <Card className="bg-card border-border divide-y divide-border/50 opacity-70">
                {past.map((test) => (
                  <TestRow key={test.id} test={test} onEdit={setEditTest} onDelete={(id) => deleteTest.mutate({ id })} />
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      <TestFormDialog open={createOpen} onClose={() => setCreateOpen(false)} initial={emptyForm} onSubmit={handleCreate} title="New Test" />
      {editTest && (
        <TestFormDialog
          open={true}
          onClose={() => setEditTest(null)}
          initial={{ name: editTest.name, date: editTest.date, time: editTest.time, type: editTest.type as TestType, notes: editTest.notes ?? "" }}
          onSubmit={handleEdit}
          title="Edit Test"
        />
      )}
    </div>
  );
}

function TestRow({ test, onEdit, onDelete }: { test: any; onEdit: (t: any) => void; onDelete: (id: number) => void }) {
  const testTypeColor: Record<string, string> = {
    jee: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    coaching: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    school: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    mock: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3 group hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{test.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(parseISO(test.date), "d MMM yyyy")} · {test.time}
        </p>
        {test.notes && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{test.notes}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-medium capitalize ${testTypeColor[test.type] || testTypeColor.mock}`}>
          {test.type}
        </span>
        <button onClick={() => onEdit(test)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(test.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
