// A 2-buttons (or 1-button) Material Dialog 

import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [ MatDialogModule, MatButtonModule ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { header: string; content: string, posAnsMsg: string, negAnsMsg: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false); // Pass false as the result
  }

  onYesClick(): void {
    this.dialogRef.close(true); // Pass true as the result
  }

}
