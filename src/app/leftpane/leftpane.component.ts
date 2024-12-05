import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import { ContentService } from '../shared/content.service';
import { IArticle, ICategory } from '../objects/dataObjects';

const ComponentName = 'LeftpaneComponent';

@Component({
  selector: 'app-leftpane',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
  ],
  templateUrl: './leftpane.component.html',
  styleUrl: './leftpane.component.scss'
})
export class LeftpaneComponent {

  constructor() {
    effect(() => {
      this.category = this.contentService.$category();
      this.listItems = this.contentService.$categoryArticles();
      const i = this.listItems.findIndex((i) => i.articleSlug === this.contentService.$article().articleSlug);
      i <= -1 ? this.selectedItem = 0 : this.selectedItem = i;
    });
  }

  private contentService = inject(ContentService);
 
  category: ICategory = {categoryId: 0, categoryTitle: ''};
  selectedItem: number | null = null;
  listItems: IArticle[] = []; 

  itemClicked(item: IArticle, i: number): void {
    this.selectedItem = i;
    this.contentService.signalArticle(item.articleId);
  }

}
