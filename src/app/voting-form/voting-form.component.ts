import { Component, OnInit, OnDestroy, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContestantService } from '../services/contestant.service';
import { Contestant, Talent } from '../models/contestant.model';

@Component({
  selector: 'app-voting-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voting-form.component.html',
  styleUrls: ['./voting-form.component.css']
})
export class VotingFormComponent implements OnInit, OnDestroy {
  private contestantService = inject(ContestantService);
  @Output() voteSubmitted = new EventEmitter<void>();

  readonly matricPrefix = 'DLA/TE/26/';
  readonly maxRegisteredUsers = 4080;

  readonly talents: { value: Talent | ''; label: string }[] = [
    { value: '', label: 'All Talents' },
    { value: 'dance', label: 'Dance' },
    { value: 'drama', label: 'Drama' },
    { value: 'spoken_word', label: 'Spoken Word' },
    { value: 'singing', label: 'Singing' },
    { value: 'dj', label: 'DJ' },
    { value: 'instrumentalist', label: 'Instrumentalist' },
  ];

  matricNumber = '';
  selectedContestant: Contestant | null = null;
  errorMessage = '';
  showConfirmation = false;
  submitting = false;

  contestants: Contestant[] = [];
  loadingContestants = signal(false);
  loadError = '';

  search = '';
  talentFilter: Talent | '' = '';
  page = 1;
  limit = 12;
  totalPages = 1;

  readonly skeletonItems = Array.from({ length: 6 });

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit() {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.loadContestants();
      });
    this.loadContestants();
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadContestants() {
    this.loadingContestants.set(true);
    this.loadError = '';
    this.contestantService
      .getContestants({
        page: this.page,
        limit: this.limit,
        search: this.search || undefined,
        talent: this.talentFilter || undefined,
      })
      .subscribe({
        next: (result) => {
          this.contestants = result.data;
          this.totalPages = result.totalPages;
          this.page = result.page;
          this.loadingContestants.set(false);
        },
        error: (err) => {
          this.loadError = 'Failed to load contestants. Please try again.';
          this.loadingContestants.set(false);
          console.error('Failed to load contestants:', err);
        },
      });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search = value;
    this.searchSubject.next(value);
  }

  onTalentFilterChange(value: string) {
    this.talentFilter = value as Talent | '';
    this.page = 1;
    this.loadContestants();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.loadContestants();
  }

  onMatricInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    this.matricNumber = value.slice(0, 4);
    this.errorMessage = '';
  }

  selectContestant(contestant: Contestant) {
    this.selectedContestant = contestant;
    this.errorMessage = '';
  }

  formatTalent(talent: string): string {
    return talent.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  onSubmit() {
    this.errorMessage = '';

    if (!/^\d{4}$/.test(this.matricNumber)) {
      this.errorMessage = 'Please enter a valid 4-digit matric number.';
      return;
    }

    const num = parseInt(this.matricNumber, 10);
    if (num <= 0 || num > this.maxRegisteredUsers) {
      this.errorMessage = `Only the first ${this.maxRegisteredUsers.toLocaleString()} registered users may vote.`;
      return;
    }

    if (!this.selectedContestant) {
      this.errorMessage = 'Please select a contestant to vote for.';
      return;
    }

    const matricFull = `${this.matricPrefix}${this.matricNumber}`;

    this.submitting = true;
    this.contestantService.castVote(matricFull, this.selectedContestant.id).subscribe({
      next: () => {
        this.submitting = false;
        this.showConfirmation = true;
        this.voteSubmitted.emit();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Vote submission error:', err);
        if (err?.status === 409) {
          this.errorMessage = 'You have already voted.';
        } else {
          this.errorMessage = err?.error?.message || 'Failed to submit vote. Please try again.';
        }
      },
    });
  }
}
