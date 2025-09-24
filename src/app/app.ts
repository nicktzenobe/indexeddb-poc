import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ocppLogsDB} from '../database/ocppLogsDB';
import {liveQuery} from 'dexie';
import {AsyncPipe} from '@angular/common';
import {BehaviorSubject, filter, switchMap} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  filter$ = new BehaviorSubject<string>('');
  ocppLogs$ = this.filter$.pipe(
    switchMap(filter =>
      liveQuery(() => {
        const results = filter
            ? ocppLogsDB.ocppLogs.where('type').startsWithIgnoreCase(filter)
            : ocppLogsDB.ocppLogs;

        return results
          .limit(50)
          .reverse()
          .toArray();
        }
      )
    )
  );

  private producerInterval?: number;

  async addNewOcppHearbeatLog() {
    await this.addNewOcppLog('heartbeat');
  }

  async addNewOcppStartUpLog() {
    await this.addNewOcppLog('Start up');
  }

  async addNewOcppShutdownLog() {
    await this.addNewOcppLog('Shutdown');
  }

  async addNewOcppLog(type: string) {
    await ocppLogsDB.ocppLogs.add({
      timestamp: new Date(),
      type,
      receivedAt: new Date(),
    })
  }

  startProducingLogs(interval: number = 100) {
    if(this.producerInterval) {
      this.stopProducingLogs();
    }
    this.producerInterval = window.setInterval(async () => {
      const randomIndex = Math.floor(Math.random() * 3);
      switch(randomIndex) {
        case 0: {
          await this.addNewOcppHearbeatLog();
          break;
        }
        case 1: {
          await this.addNewOcppStartUpLog();
          break;
        }
        case 2: {
          await this.addNewOcppShutdownLog();
          break;
        }
        default: break;
      }
    }, interval);
  }

  stopProducingLogs() {
    window.clearInterval(this.producerInterval);
  }

  setFilter(filter: string) {
    this.filter$.next(filter);
  }

}
