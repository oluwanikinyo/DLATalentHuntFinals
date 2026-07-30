import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { VotingFormComponent } from './voting-form/voting-form.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ResultsComponent } from './results/results.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, VotingFormComponent, ConfirmationComponent, ResultsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'DLATeensTalentHunt';
  showConfirmation = false;

  onVoteSubmitted() {
    this.showConfirmation = true;
  }
}
