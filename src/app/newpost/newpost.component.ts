import { Component, effect, inject, OnInit, SecurityContext, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import { DomSanitizer } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';
import { DataService } from '../shared/data.service';
import { ArticleDTO, ICategory } from '../objects/dataObjects';
import { quilEditorlModules } from '../objects/quillObjects';
import { Location } from '@angular/common';
import { ContentService } from '../shared/content.service';
// import { Router } from '@angular/router';

const ComponentName = 'NewpostComponent';

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
    this.article = this.contentService.$article();
    this.categoryOptions = this.contentService.$categories();
    if (this.contentService.$newPost() == 2) this.isNew = false;
    this.editorContent = this.isNew ? '' : this.article.articleContent;
    // console.log( '>===>> ' + ComponentName + ' - OnInit - ' + 'New Post? ' + this.contentService.$newPost());
    // console.log( '>===>> ' + ComponentName + ' - OnInit -' + 'Is a New Post? ' + this.isNew);
    this.initForm();
  }





  // Initialize the form
  private initForm() {
    this.postForm = this.fb.group({
      title: [this.isNew ? '' : this.article.articleTitle, [Validators.required, Validators.minLength(5)]],
      subtitle: [this.isNew ? '' : this.article.articleSubTitle, Validators.required],
      description: [this.isNew ? '' : this.article.articleDescription, Validators.required],
      slug: [this.isNew ? '' : this.article.articleSlug, Validators.required],
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
}
