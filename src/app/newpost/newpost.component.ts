import { Component, effect, inject, OnInit, SecurityContext, signal } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DomSanitizer } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';
import { DataService } from '../shared/data.service';
import { ArticleDTO, ICategory } from '../objects/dataObjects';
import { quilEditorlModules } from '../objects/quillObjects';
import { Location } from '@angular/common';
import { ContentService } from '../shared/content.service';
import { catchError, map, Observable, of } from 'rxjs';
import { DialogComponent } from '../shared/dialog/dialog.component';
// import { Router } from '@angular/router';

const ComponentName = 'NewpostComponent';
const slugErrorSuggestionMessage: string = 'Slugs should be lowercase with single hyphens between words.Containing no special characters or stop words';
@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    ReactiveFormsModule,
    QuillModule,
  ],
  templateUrl: './newpost.component.html',
  styleUrl: './newpost.component.scss',
})
export class NewpostComponent implements OnInit{
  
  
  editorContent: string = '';
  editorModules = quilEditorlModules;
  matCardHeaderTitle = 'Editing a post ...'
  saveButtonCaption = 'Save';
  cancelButtonCaption = 'Cancel';

  public article: ArticleDTO = new ArticleDTO();

  postForm!: FormGroup;
  categoryOptions: ICategory[] = [];

  // private router = inject(Router);
  private sanitizer = inject( DomSanitizer);
  private contentService = inject(ContentService);
  private snackBar = inject( MatSnackBar);
  private dataService = inject( DataService);
  private location = inject(Location);
  private fb= inject(FormBuilder);
  isNew: boolean = true;
  
  private dialog = inject(MatDialog);
  private isMarkdown: boolean = false;
  readonly panelOpenState = signal(false);

  
  constructor(

  ) {
    effect(() => {
      // The ngOnInit runs before the constructor.
      // Moreover, we do Not need to constantly monitor the changes of signals,
      // we need just once to capture the article and fill0in the form fields.
      // So, the job can be done *solo* in the ngOnInit method.
    });
  }


  ngOnInit() {
    this.isMarkdown = this.contentService.$isMarkdown();
    this.article = this.contentService.$article();
    if (this.isMarkdown) this.openDialog();
    this.categoryOptions = this.contentService.$categories();
    if (this.contentService.$newPost() == 2) this.isNew = false;
    this.editorContent = this.isNew ? '' : this.article.articleContent;
    // console.log( '>===>> ' + ComponentName + ' - OnInit - ' + 'New Post? ' + this.contentService.$newPost());
    // console.log( '>===>> ' + ComponentName + ' - OnInit -' + 'Is a New Post? ' + this.isNew);
    this.initForm();
  }


  openDialog(): void {
    console.log( '>===>> ' + ComponentName + ' - ' + 'Trying to open the Dialog...' );
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        header: 'Markdown Content sensed!',
        content: 'The content of this post is Markdown encoded. Do you want to proceed converting it to HTML?',
        posAnsMsg: 'Yes',
        negAnsMsg: 'No'
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        console.log('User chose YES');
        this.article.articleContent =  await this.contentService.convertMarkdownToHtml( this.article.articleContent);
        this.postForm.patchValue({ content: this.article.articleContent });
        // console.log('>===>> ' + ComponentName + ' Markdown content converted to HTML: ' +  this.article.articleContent);
      } else {
        // console.log('>===>> ' + ComponentName + ' User chose NO');
      }
    });
  }



  // Initialize the form
  private initForm() {
    this.postForm = this.fb.group({
      title: [this.isNew ? '' : this.article.articleTitle, [Validators.required, Validators.minLength(5)]],
      subtitle: [this.isNew ? '' : this.article.articleSubTitle, Validators.required],
      description: [this.isNew ? '' : this.article.articleDescription, Validators.required],
      slug: [this.isNew ? '' : this.article.articleSlug, {
        validators: [Validators.required, this.slugValidator()],
        asyncValidators: [this.checkSlugExists()],
        updateOn: 'blur'
      }
      ],
      category: [this.isNew ? '' : this.article.categoryId, Validators.required],
      content: [this.isNew ? '' : this.editorContent, Validators.required]
    });

  }


  // Getter methods for form controls
  get title() { return this.postForm.get('title'); }
  get subtitle() { return this.postForm.get('subtitle'); }
  get description() { return this.postForm.get('description'); }
  get slug() { return this.postForm.get('slug'); }
  get category() { return this.postForm.get('category'); }
  get content() { return this.postForm.get('content'); }



  cancel() {
    this.location.back();
  }

  onSubmit() {
    if (this.postForm.valid) {
      const formValues = this.postForm.value;
      this.article.articleTitle = formValues.title;
      this.article.articleSubTitle = formValues.subtitle;
      this.article.articleDescription = formValues.description;
      this.article.articleSlug = formValues.slug;
      this.article.categoryId = formValues.category; 
      this.article.articleContent = this.cleanupContent(formValues.content);
      if (this.isNew) {
        this.addArticle(this.article);
      } else  {
        this.updateArticle(this.article);
      } 
    } else {
      this.markFormGroupTouched(this.postForm);
    }
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  private addArticle(newArticle: ArticleDTO) {
    this.dataService.addArticle(newArticle).subscribe({
      next: (addedArticle) => {
        // console.log( '>===>> ' + ComponentName + ' - ' + 'Adding new article - Response Value : ' + JSON.stringify(addedArticle) );
        this.showSnackBar('New Article added with UUID: ' + addedArticle.articleUUID);
      },
      error: (err: any) => {
        console.log( '>===>> ' + ComponentName + ' - ' + 'Adding new article - Response Value : ' + JSON.stringify(err));
        this.showSnackBar(['Error! ' + err]);
      },
    });
  }

  private updateArticle(article: ArticleDTO) {
    this.dataService.updateArticle(article).subscribe({
      next: (updatedArticle) => {
        // console.log('>===>> ' + ComponentName + ' - ' + 'Updating existing article ' + article.articleClientUUID + ' - Response Value : ' + JSON.stringify(updatedArticle));
        this.showSnackBar('Updated Article UUID: ' + updatedArticle.articleUUID);
        this.contentService.$newPost.set(0);
        this.location.back;
      },
      error: (err: any) => {
        console.log('>===>> ' + ComponentName + ' - ' + 'Updating existing  article - Error Response Value : ' +JSON.stringify(err));
        this.showSnackBar(['Error! ' + err]);
      },
    });
  }





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

  onTitleBlur() {
    const titleValue = this.title?.value;
    if (titleValue && !this.title?.errors) {
      const newSlug = this.createSlug(titleValue);
      this.postForm.patchValue({ slug: newSlug }, { emitEvent: false });
    }
  }

  onSlugBlur() {
    const slugControl = this.slug;
    //Is valid ?
    if (slugControl?.value && !slugControl.errors) {
      // Force async validation on blur
      slugControl.updateValueAndValidity();
    }
  }




  private createSlug(title: string): string {

    // List of common stop words to remove
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
      'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
      'that', 'the', 'to', 'was', 'were', 'will', 'with'
    ]);

    return title
      .toLowerCase() // Convert to lowercase
      // Remove special characters and replace with space
      .replace(/[^a-z0-9\s]/g, ' ')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      .trim()
      // Split into words, remove stop words, and join back
      .split(' ')
      .filter(word => word.length > 0 && !stopWords.has(word))
      .join(' ')
      // Replace remaining space with single hyphen
      .replace(/\s/g, '-');
  }

  private slugValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }
  
      const inputValue = control.value;
      // const testSlug = this.title?.value ? this.title.value : this.createSlug(inputValue);
      // const testSlug = this.title?.value;
      const validSlug = this.createSlug(inputValue);
  
      // Check if the input matches our slug format
      if (inputValue !== validSlug) {
        return {
          invalidSlug: {
            value: inputValue,
            expected: validSlug,
            message: slugErrorSuggestionMessage
          }
        };
      }
  
      return null;
    };
  }

  private checkSlugExists(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.errors) {
        return of(null);
      }
        return this.dataService.getArticleDTOBySlug(control.value).pipe(
        map(article => article && article.articleSlug === control.value && (article.articleUUID !== this.article.articleUUID)  ? { slugExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  getSlugErrorMessage(): string {
    if (this.slug?.errors?.['required']) {
      return 'Slug is required';
    }
    if (this.slug?.errors?.['invalidSlug']) {
      return `Invalid slug format. ${slugErrorSuggestionMessage} Suggestion: ${this.slug.errors['invalidSlug'].expected}`;
    }
    if (this.slug?.errors?.['slugExists']) {
      return 'This slug already exists. Please choose a different one.';
    }
    return '';
  }
  
  isSlugValid(): boolean {
    return this.slug?.valid || false;
  }

  getSlugHint(): string {
    if (this.slug?.value) {
      const hint: string = slugErrorSuggestionMessage;
      return `${hint}. Suggestion: ${this.createSlug(this.slug.value)}`;
    }
    return '';
  }

}
