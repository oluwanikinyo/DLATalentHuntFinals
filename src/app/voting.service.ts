import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Vote {
  matricNumber: string;
  votedFor: number;
  candidateName: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class VotingService {
  readonly participants = [
    { id: 0, name: "Akan", avatar: "A", votes: 0 },
    { id: 1, name: "Bukola", avatar: "B", votes: 0 },
    { id: 2, name: "Chinaza", avatar: "C", votes: 0 },
    { id: 3, name: "Divine", avatar: "D", votes: 0 },
    { id: 4, name: "Elton", avatar: "E", votes: 0 },
    { id: 5, name: "Feborah", avatar: "F", votes: 0 },
    { id: 6, name: "George", avatar: "G", votes: 0 },
  ];

  readonly maxRegisteredUsers = 4080;
  readonly matricPrefix = "DLA/TE/26/";

  private votesSubject = new BehaviorSubject<Vote[]>([]);
  private storageKey = 'dlatelabs_votes';

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.votesSubject.next(parsed);
      } catch {
        this.votesSubject.next([]);
      }
    }
  }

  private persist(votes: Vote[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(votes));
  }

  submitVote(matricFull: string, participantIndex: number, candidateName: string) {
    return new Promise<void>((resolve, reject) => {
      const current = this.votesSubject.value;
      const exists = current.some((v) => v.matricNumber === matricFull);
      if (exists) {
        reject({ code: 'already-exists', message: 'You have already voted.' });
        return;
      }
      const vote: Vote = {
        matricNumber: matricFull,
        votedFor: participantIndex,
        candidateName,
        timestamp: new Date(),
      };
      const updated = [...current, vote];
      this.votesSubject.next(updated);
      this.persist(updated);
      resolve();
    });
  }

  getVotes(): Promise<Vote[]> {
    return Promise.resolve(this.votesSubject.value);
  }

  listenForVotes(callback: (votes: Vote[]) => void) {
    this.votesSubject.subscribe((votes) => callback(votes));
    return () => {};
  }
}
