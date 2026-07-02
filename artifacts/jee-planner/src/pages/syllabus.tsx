import { useState } from "react";
import {
  useListSyllabus,
  getListSyllabusQueryKey,
  useUpdateSyllabusChapter,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, FlaskConical, Calculator, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Status = "not_started" | "in_progress" | "revised" | "done";

const STATUS_CYCLE: Status[] = ["not_started", "in_progress", "revised", "done"];

const STATUS_LABEL: Record<Status, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  revised: "Revised",
  done: "Done",
};

const STATUS_COLOR: Record<Status, string> = {
  not_started: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  revised: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  done: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

const STATUS_DOT: Record<Status, string> = {
  not_started: "bg-muted-foreground/40",
  in_progress: "bg-amber-400",
  revised: "bg-blue-400",
  done: "bg-emerald-400",
};

const SUBJECT_META = {
  Physics: { icon: <BookOpen className="h-4 w-4" />, color: "text-blue-400", bg: "bg-blue-400/10" },
  Chemistry: { icon: <FlaskConical className="h-4 w-4" />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  Maths: { icon: <Calculator className="h-4 w-4" />, color: "text-orange-400", bg: "bg-orange-400/10" },
};

const SUBJECTS = ["Physics", "Chemistry", "Maths"] as const;

function nextStatus(current: Status): Status {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

function SubjectProgress({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{done}/{total}</span>
    </div>
  );
}

export default function Syllabus() {
  const qc = useQueryClient();
  const [activeSubject, setActiveSubject] = useState<typeof SUBJECTS[number]>("Physics");
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set(["Physics-01", "Physics-02"]));

  const { data: chapters = [], isLoading } = useListSyllabus({
    query: { queryKey: getListSyllabusQueryKey() },
  });

  const updateChapter = useUpdateSyllabusChapter({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListSyllabusQueryKey() }),
    },
  });

  function toggleTrack(key: string) {
    setExpandedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleCycleStatus(id: number, current: Status) {
    const status = nextStatus(current);
    updateChapter.mutate({ id, data: { status } });
  }

  function onSubjectChange(s: typeof SUBJECTS[number]) {
    setActiveSubject(s);
    setExpandedTracks(new Set([`${s}-01`, `${s}-02`]));
  }

  const subjectChapters = chapters.filter((c) => c.subject === activeSubject);
  const tracks = ["01", "02"];

  const subjectStats = SUBJECTS.reduce<Record<string, { done: number; total: number }>>((acc, s) => {
    const sc = chapters.filter((c) => c.subject === s);
    acc[s] = { done: sc.filter((c) => c.status === "done").length, total: sc.length };
    return acc;
  }, {});

  const overall = chapters.length > 0
    ? Math.round((chapters.filter((c) => c.status === "done").length / chapters.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Syllabus Tracker</p>
        <h1 className="text-2xl font-bold text-foreground">Resonance Syllabus</h1>
        <p className="text-sm text-muted-foreground mt-1">Click any chapter to cycle its status</p>
      </div>

      {/* Overall progress */}
      {chapters.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{overall}% overall</span>
        </div>
      )}

      {/* Subject Tabs */}
      <div className="flex gap-2">
        {SUBJECTS.map((s) => {
          const meta = SUBJECT_META[s];
          const isActive = activeSubject === s;
          const stats = subjectStats[s] ?? { done: 0, total: 0 };
          return (
            <button
              key={s}
              onClick={() => onSubjectChange(s)}
              className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border transition-all ${
                isActive
                  ? `border-primary bg-primary/10 ${meta.color}`
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {meta.icon}
                <span className="text-sm font-semibold">{s}</span>
              </div>
              <SubjectProgress
                done={stats.done}
                total={stats.total}
                color={isActive ? "bg-primary" : "bg-muted-foreground/40"}
              />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {STATUS_CYCLE.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
            <span className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</span>
          </div>
        ))}
      </div>

      {/* Chapters */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => {
            const trackChapters = subjectChapters.filter((c) => c.track === track);
            if (trackChapters.length === 0) return null;
            const key = `${activeSubject}-${track}`;
            const expanded = expandedTracks.has(key);
            const trackDone = trackChapters.filter((c) => c.status === "done").length;
            const trackRevised = trackChapters.filter((c) => c.status === "revised").length;
            const trackTotal = trackChapters.length;

            return (
              <Card key={track} className="bg-card border-border overflow-hidden">
                {/* Track header */}
                <button
                  onClick={() => toggleTrack(key)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-semibold text-foreground">
                      Track {track} — {activeSubject}
                    </span>
                    <span className="text-xs text-muted-foreground">({trackTotal} chapters)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {trackChapters.map((c) => (
                        <div key={c.id} className={`w-2 h-2 rounded-full ${STATUS_DOT[c.status as Status]}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {trackDone + trackRevised}/{trackTotal} done
                    </span>
                  </div>
                </button>

                {/* Chapter list */}
                {expanded && (
                  <div className="divide-y divide-border/40 border-t border-border/40">
                    {trackChapters.map((chapter) => {
                      const status = chapter.status as Status;
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => handleCycleStatus(chapter.id, status)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
                            <span className={`text-sm ${status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {chapter.chapter}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ml-3 ${STATUS_COLOR[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
