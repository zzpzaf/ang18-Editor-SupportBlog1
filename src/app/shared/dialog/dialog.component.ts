// A 2-buttons (or 1-button) Material Dialog 

import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export type msgToken = 'info' | 'conf' | 'succ' | 'error' | 'warn';
export interface IDialogData {
  token: msgToken;
  header: string;
  content: string;
  posAnsMsg: string;
  negAnsMsg: string;
}


const ComponentName = 'DialogComponent';
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [ 
    CommonModule,
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  host: {
    '[attr.data-token]': 'data.token'
  }
})
export class DialogComponent {

  private autoCloseTimer: any;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: { token: msgToken, header: string, content: string, posAnsMsg: string, negAnsMsg: string }
    @Inject(MAT_DIALOG_DATA) public data: IDialogData 
  ) {
      console.log( '>===>> ' + ComponentName + ' - ' + 'Token: ' + data.token);
      // Dynamically add the token-based class to the dialog container
      const dialogContainer = document.querySelector('.mdc-dialog__surface');
      if (dialogContainer) {
        dialogContainer.classList.add(`${data.token}-dialog`);
      }
  }


  ngOnInit(): void {
    // Start auto-close timer if the token is 'info'
    if (this.data.token === 'info' || this.data.token === 'succ') {
      this.autoCloseTimer = setTimeout(() => {
        this.dialogRef.close(); // Close the dialog after 4 seconds
      }, 4000); // Duration in milliseconds
    }
  }


  onNoClick(): void {
    this.clearAutoCloseTimer(); // Prevent auto-close if the user responds
    this.dialogRef.close(false); // Pass false as the result
  }

  onYesClick(): void {
    this.clearAutoCloseTimer(); // Prevent auto-close if the user responds
    this.dialogRef.close(true); // Pass true as the result
  }


  ngOnDestroy(): void {
    // Clear the timer if the component is destroyed before it fires
    this.clearAutoCloseTimer();
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }



  // Dynamic button class method
  getButtonClass(token: msgToken, type: 'positive' | 'negative'): string {
    return `${type}-${token}`;
  }


  // Return the appropriate class for the icon
  getIconClass(token: msgToken): string {
    return `${token}-icon`;
  }

    // Return the appropriate icon name based on the token
    getIconName(token: msgToken): string {
      switch (token) {
        case 'info':
          return 'info';
        case 'conf':
          return 'help_outline';
        case 'succ':
          return 'check_circle';
        case 'error':
          return 'error';
        case 'warn':
          return 'warning';
        default:
          return 'info';
      }
    }

}
