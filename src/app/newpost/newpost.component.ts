import { Component, SecurityContext } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

import { QuillModule } from 'ngx-quill';
import { DataService } from '../shared/data.service';
import { ArticleDTO, IArticle } from '../objects/dataObjects';
import { quilEditorlModules } from '../objects/quillObjects';

const ComponentName = 'NewpostComponent';

@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    QuillModule,
  ],
  templateUrl: './newpost.component.html',
  styleUrl: './newpost.component.scss',
})
export class NewpostComponent {
  editorContent: string = '';
  editorModules = quilEditorlModules;

  constructor(
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private dataService: DataService
  ) {}

  // The editorInit uses the clipboard matcher functionality to
  // remove background colors when pasting content into the
  // ngx-quill editor.

  // Handle pasted content
  editorInit(quill: any) {
    quill.clipboard.addMatcher(
      Node.ELEMENT_NODE,
      function (node: any, delta: any) {
        delta.forEach((op: any) => {
          if (op.attributes) {
            // Remove background color
            delete op.attributes.background;
            // Remove text color 
            delete op.attributes.color;
          }
          // Handle text content - replace &nbsp; with regular space
          if (op.insert && typeof op.insert === 'string') {
            op.insert = op.insert.replace(/&nbsp;/g, ' ');
          }
        });
        return delta;
      }
    );
  }

  saveContent() {
    const newArticle: ArticleDTO = new ArticleDTO();
    newArticle.userId = 1;
    newArticle.categoryId = 1;
    newArticle.articleTitle = 'New Article';
    newArticle.articleSubTitle = 'New Article Sub-Title ';
    newArticle.articleDescription = 'New Article Description';
    newArticle.articleSlug = 'new-article';
    newArticle.articleContent = this.getQuillEditorContent();
  }

  private getQuillEditorContent(): string {
    return this.editorContent.trim().length === 0
      ? ''
      : this.cleanupContent(this.editorContent);
  }

  private saveArticle(newArticle: ArticleDTO) {
    this.dataService.addArticle(newArticle).subscribe({
      next: (resp) => {
        console.log(
          '>===>> ' +
            ComponentName +
            ' - ' +
            'Adding new article - Response Value : ' +
            JSON.stringify(resp)
        );
        this.showSnackBar('New Article added: ' + resp);
      },
      error: (err: any) => {
        console.log(
          '>===>> ' +
            ComponentName +
            ' - ' +
            'Adding new article - Response Value : ' +
            JSON.stringify(err)
        );
        this.showSnackBar(['Error! ' + err]);
      },
    });
  }

  private cleanupContent(content: string): string {
    return content
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private showSnackBar(resp: any) {
    this.snackBar.open(resp, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
