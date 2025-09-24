import Dexie, { Table } from 'dexie';

export interface OcppLog {
  id?: number;
  timestamp: Date;
  type: string;
  receivedAt: Date;
}

export class OcppLogsDB extends Dexie {
  ocppLogs!: Table<OcppLog>;

  constructor() {
    super('ocppLogsDB');
    this.version(1).stores({
      ocppLogs: '++id, type',
    });
  }
}

export const ocppLogsDB = new OcppLogsDB();
