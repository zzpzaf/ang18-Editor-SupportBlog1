import { Component, effect, inject, OnInit, Type } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { AddCompDynDirective } from './add-comp-dyn.directive';
import { ContentService } from './shared/content.service';
import { Tile, TilesLarge, TilesMedium, TilesNewPost, TilesNoPosts, TilesSmall } from './objects/blogObjects';

const ComponentName = 'AppComponent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatGridListModule,
    AddCompDynDirective,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private componentName = this.constructor.name.replace('_', '');
  // public title = 'Angular18-Holy-Grail-repo1(Grid)';
  public tiles: Tile[] = [];

  private currentBreakpoint: string = '';

  private contentService = inject(ContentService);
  private noPostsPageNumber: number = 0;
  private isNewPost: number = 0;

  constructor() {
    effect(() => {
      this.noPostsPageNumber = this.contentService.$noPostsPageNr();
      this.isNewPost = this.contentService.$newPost();
      // console.log("'>===>> ' + ComponentName + ' - ' + NoPosts Page Nr ? " + this.noPostsPageNumber);
      if (this.isNewPost === 0) {
        if (this.noPostsPageNumber === 0) {
          this.getBreakepoints();
        } else {
          this.tiles = TilesNoPosts;
        }
      } else {
        this.tiles = TilesNewPost;
      }
      // console.log('>===>> ' + ComponentName + ' - ' + "Tiles: " + JSON.stringify(this.tiles));
    });
  }

  private getBreakepoints(): void {
    // if (this.contentService.$newPost() === true) return;
    this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => this.getTiles());
  }

  private getTiles(): void {
    
    if (this.isNewPost) return;
    if (this.noPostsPageNumber) return;

    if (this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
      this.tiles = TilesMedium;
    } else if (
      this.breakpointObserver.isMatched(Breakpoints.Small) ||
      this.breakpointObserver.isMatched(Breakpoints.XSmall)
    ) {
      this.currentBreakpoint = Breakpoints.Small;
      this.tiles = TilesSmall;
    } else {
      this.tiles = TilesLarge;
    }
  }
}
