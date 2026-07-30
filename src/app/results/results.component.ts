import { Component, inject, OnDestroy } from '@angular/core';
import { VotingService, Vote } from '../voting.service';

@Component({
  selector: 'app-results',
  standalone: true,
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnDestroy {
  private votingService = inject(VotingService);

  totalVotes = 0;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.unsubscribe = this.votingService.listenForVotes((votes: Vote[]) => {
      this.totalVotes = votes.length;
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
