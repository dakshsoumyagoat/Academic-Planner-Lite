import Dexie, { type Table } from "dexie";

export interface LocalTask {
  id: number;
  title: string;
  subject: string;
  chapter?: string | null;
  dueDate: string;
  priority: string;
  completed: boolean;
  notes?: string | null;
  createdAt: string;
  synced: boolean;
}

export interface LocalTest {
  id: number;
  name: string;
  date: string;
  time: string;
  type: string;
  notes?: string | null;
  createdAt: string;
  synced: boolean;
}

export interface LocalHoliday {
  id: number;
  name: string;
  date: string;
  createdAt: string;
}

export interface LocalSettings {
  id: number;
  theme: string;
  accentColor: string;
  jeeMainDate: string;
  jeeAdvancedDate: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id?: number;
  method: string;
  url: string;
  body: string;
  timestamp: number;
  retryCount: number;
}

export interface ReadCacheItem {
  url: string;
  data: string;
  timestamp: number;
}

export class JeePlannerDB extends Dexie {
  tasks!: Table<LocalTask>;
  tests!: Table<LocalTest>;
  holidays!: Table<LocalHoliday>;
  settings!: Table<LocalSettings>;
  syncQueue!: Table<SyncQueueItem>;
  readCache!: Table<ReadCacheItem>;

  constructor() {
    super("JeePlanner");
    this.version(1).stores({
      tasks: "id, dueDate, subject, completed, priority",
      tests: "id, date, type",
      holidays: "id, date",
      settings: "id",
      syncQueue: "++id, timestamp",
      readCache: "url",
    });
  }
}

export const db = new JeePlannerDB();
