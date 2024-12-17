import { Component, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ArticleDTO, IArticleDTO } from '../objects/dataObjects';
import { ContentService } from '../shared/content.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MarkdownModule } from 'ngx-markdown';	
import { SeoService } from '../shared/seo.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, IDialogData } from '../shared/dialog/dialog.component';

const ComponentName = 'MainComponent';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatCardModule, 
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MarkdownModule,							                      
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {

  private contentService = inject(ContentService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);

  private dialog = inject(MatDialog);

  menuOptionEdit: string = 'Edit';
  menuOptionDelete: string = 'Delete';

  public article: ArticleDTO = new ArticleDTO();
  public pgNr: number = 0;
  public pageContent = '';
  public safeHtmlContent!: SafeHtml;


  constructor() {
    effect(() => {

      this.pgNr = this.contentService.$noPostsPageNr();
      if (this.pgNr === 0 ) {
        if (this.contentService.$article().articleId > 0) {
          this.article = this.contentService.$article();
          this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.article.articleContent);
        }
      } else if (this.pgNr > 0) {
        this.pageContent = this.contentService.$pageContent();
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.pageContent);
      }
      // Update the page with meta - tags and structured data
      this.seoService.updateTags(this.pgNr, this.article, this.pgNr == 0 ? this.article.articleContent : this.pageContent );        
    });
  }


  onMenuOptionEdit() {
    // Implement your edit logic here
    
    // console.log('>===>> ' + ComponentName + ' Edit clicked');
    // console.log('>===>> ' + ComponentName + ' ' + this.article.articleContent );
    // console.log('>===>> ' + ComponentName + ' ' + this.safeHtmlContent );
    this.contentService.$newPost.set(2);   // 2 means existing post 
  }

  onMenuOptionDelete() {
    // Implement your delete logic here
    console.log('>===>> ' + ComponentName + ' Delete clicked');
    const dlgData: IDialogData = {
      token: 'warn',
      header: 'Warning!',
      content: 'You are going to delete this post, permanently! Please confirm!',
      posAnsMsg: 'Delete',
      negAnsMsg: 'Cancel'
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      data: dlgData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        console.log('>===>> ' + ComponentName + ' The post deleted permanently.' );
      } else {
        console.log('>===>> ' + ComponentName + ' The deletion is Canceled!');
      }
    });


  }
  
}
