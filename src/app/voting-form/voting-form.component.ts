import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VotingService } from '../voting.service';

@Component({
  selector: 'app-voting-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voting-form.component.html',
  styleUrls: ['./voting-form.component.css']
})
export class VotingFormComponent {
  votingService = inject(VotingService);
  @Output() voteSubmitted = new EventEmitter<void>();

  matricNumber = '';
  selectedParticipant: number | null = null;
  errorMessage = '';
  showConfirmation = false;

  onMatricInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    this.matricNumber = value.slice(0, 4);
    this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';

    if (!/^\d{4}$/.test(this.matricNumber)) {
      this.errorMessage = 'Please enter a valid 4-digit matric number.';
      return;
    }

    const num = parseInt(this.matricNumber, 10);
    if (num <= 0 || num > this.votingService.maxRegisteredUsers) {
      this.errorMessage = `Only the first ${this.votingService.maxRegisteredUsers.toLocaleString()} registered users may vote.`;
      return;
    }

    if (this.selectedParticipant === null) {
      this.errorMessage = 'Please select a candidate to vote for.';
      return;
    }

    const matricFull = `${this.votingService.matricPrefix}${this.matricNumber}`;
    const candidateName = this.votingService.participants[this.selectedParticipant].name;

    this.votingService.submitVote(matricFull, this.selectedParticipant, candidateName).then(() => {
      this.showConfirmation = true;
      this.voteSubmitted.emit();
    }).catch((error: any) => {
      console.error('Vote submission error:', error);
      if (error.code === 'already-exists') {
        this.errorMessage = 'You have already voted.';
      } else {
        this.errorMessage = `Failed to submit vote: ${error.code || error.message}`;
      }
    });
  }
}
