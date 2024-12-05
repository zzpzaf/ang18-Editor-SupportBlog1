import { Component, effect, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { IPage, Pages } from '../objects/blogObjects';
import { ICategory } from '../objects/dataObjects';
import { ContentService } from '../shared/content.service';


const ComponentName = 'NavrowComponent';

@Component({
  selector: 'app-navrow',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
  templateUrl: './navrow.component.html',
  styleUrl: './navrow.component.scss',
})
export class NavrowComponent {
  constructor() {
    if (this.contentService.$categories().length > 0) {
      this.navMenuItems2 = this.contentService.$categories();
      // console.log('>===>> ' + ComponentName + ' - Nav Menu Items - Categories Changed/Received:', this.navMenuItems2);
    }
    effect(() => {
      this.navMenuItems2 = this.contentService.$categories();
      this.setInitialSubMenuItemCats(this.currStart);
      // console.log('>===>> ' + ComponentName + ' - Nav Menu Items - Categories Changed/Received:', this.navMenuItems2);
      this.selectedCategory = this.contentService.$category();
      this.contentService.$noPostsPageNr() === 0 ? this.isNavMenuItems2Visible = true : this.isNavMenuItems2Visible = false ;
    });
  }


  private contentService = inject(ContentService);
  navbarName: string = 'Navigation';
  // navMenuItems1 = Pages;
  navMenuItems1: IPage[] = Pages.filter((page) => page.PageId < 99);
  navMenuItems2: ICategory[] = [];
  
  isNavMenuItems2Visible = false;

  subMenuItemCats: ICategory[] = [];
  catButtonsNr: number = 4;
  currStart: number = 0;
  rdis: boolean = true;
  fdis: boolean = false;
  selectedCategory!: ICategory;



  toggleNavMenuItems2(): void {
    this.isNavMenuItems2Visible = !this.isNavMenuItems2Visible;
  }


  pageClicked(page: IPage): void {
    // console.log('>===>> ' + ComponentName + ' - ' + 'Page Nr Clicked', page.PageTitle);
    this.contentService.signalPageContent(page.PageId);
  }

  postCategoryClicked(category: ICategory): void {
    if (
      this.selectedCategory.categoryId != category.categoryId ||
      this.contentService.$noPostsPageNr() > 0
      ) {
      // console.log('>===>> ' + ComponentName + ' - ' + 'Posts Category Clicked', category);
      this.contentService.signalPageContent(0);
      this.contentService.signalCategory(category.categoryId);
    }
  }


  setInitialSubMenuItemCats(st:number): void {
    // console.log('>===>> ' + ComponentName + ' - Start Nr: ' + st);
    if (this.navMenuItems2.length == 0) return;
    this.subMenuItemCats = [];
    let indx: number;

    for (let i = 0; i < (this.catButtonsNr); i++) {
      indx = st + i;
      this.subMenuItemCats.push(this.navMenuItems2[indx]); 
      if (indx === this.navMenuItems2.length -1) {  
        this.fdis = true;
        return; 
      }
    }
  }

  FButtonClicked(): void {
    if (this.currStart == this.navMenuItems2.length -1 ) return; 
    if (this.navMenuItems2.length == 0) return;
    this.currStart = this.currStart + 1;
    this.subMenuItemCats = [];
    let indx: number;

    for (let i = 0; i < (this.catButtonsNr); i++) {
      indx = this.currStart + i;
      this.subMenuItemCats.push(this.navMenuItems2[indx]); 
      if (indx === this.navMenuItems2.length -1) {  
        this.fdis = true;
        break; 
      }
    }
    if (this.subMenuItemCats[0].categoryId > this.navMenuItems2[0].categoryId ) {
      this.rdis = false;
    }
  }

  RButtonClicked(): void {
    if (this.currStart == 0 ) {
      this.rdis = false;
      return;  
    }
    this.currStart = this.currStart - 1;

    this.subMenuItemCats = [];
    let indx: number;
    for (let i = 0; i < (this.catButtonsNr); i++) {
      indx = this.currStart + i;
      this.subMenuItemCats.push(this.navMenuItems2[indx]); 
    }
    let orgIndx: number  = this.navMenuItems2.findIndex(el => el.categoryId == this.subMenuItemCats[this.catButtonsNr-1].categoryId);
    if (this.navMenuItems2.length-1 > orgIndx ) {
      this.fdis = false;
    }
    
    if (this.subMenuItemCats[0].categoryId == this.navMenuItems2[0].categoryId ) {
      this.rdis = true;
    }

  }


}
