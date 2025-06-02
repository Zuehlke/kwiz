import { Component, Input, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-join-quiz-info',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './join-quiz-info.component.html',
  styleUrls: ['./join-quiz-info.component.scss']
})
export class JoinQuizInfoComponent implements OnInit {
  @Input() quizId: string | null = null;
  @Input() compact: boolean = false; // Flag to indicate if the component should be displayed in compact mode
  
  joinUrl: string = '';
  copySuccess: boolean = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.generateJoinUrl();
  }

  // Generate the join URL for the QR code
  generateJoinUrl(): void {
    if (this.quizId) {
      // Get the base URL from the current location
      const baseUrl = this.document.location.origin;

      // Create the join URL that points to the join-quizz page
      // Using the URL pattern join-quizz/:quizId as specified
      this.joinUrl = `${baseUrl}/join-quizz/${this.quizId}`;

      console.log('Generated join URL for QR code:', this.joinUrl);
    }
  }

  // Method to copy quiz ID to clipboard
  copyQuizId(): void {
    if (this.quizId) {
      navigator.clipboard.writeText(this.quizId)
        .then(() => {
          console.log('Quiz ID copied to clipboard:', this.quizId);
          this.copySuccess = true;
          // Reset the success message after 2 seconds
          setTimeout(() => {
            this.copySuccess = false;
          }, 2000);
        })
        .catch(err => {
          console.error('Could not copy quiz ID to clipboard:', err);
        });
    }
  }
}