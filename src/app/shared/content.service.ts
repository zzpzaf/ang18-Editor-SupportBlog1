import { inject, Injectable, signal, PLATFORM_ID  } from '@angular/core';
import { DataService } from './data.service';
import { ArticleDTO, IArticleDTO, ICategory } from '../objects/dataObjects';
import { Pages } from '../objects/blogObjects';
import { Location, PlatformLocation, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { environment } from '../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MarkdownService } from 'ngx-markdown';

const ComponentName = 'ContentService';

@Injectable({
  providedIn: 'root',
})
export class ContentService {


  componentName = this.constructor.name.replace('_', '');

  postsPrefix: string = environment.postsPrefix;
  private dataService = inject(DataService);
  private markdownService = inject(MarkdownService);

  private location = inject(Location);
  private router = inject(Router);
  private platformLocation= inject(PlatformLocation);

  private readonly platform = inject(PLATFORM_ID);


  public $noPostsPageNr = signal<number>(0);
  public $pageContent = signal<string>('');
  public $newPost = signal<number>(0);
  public $isMarkdown = signal<boolean>(false);


  public $categories = signal<ICategory[]>([]);
  public $category = signal<ICategory>({ categoryId: 0, categoryTitle: '' });
  public $article = signal<ArticleDTO>(new ArticleDTO());

  public $categoryArticles = signal<IArticleDTO[]>([]);

  private previousUrl: string | null = null;
  private isPopStateNavigation = false;  // Add this flag


  constructor() {
    if (isPlatformBrowser(this.platform) && this.$categories.length === 0) this.signalCategories();  //Without browser checking, this caused a build error
    this.listenToBrowserNavigation();
  }


  private listenToBrowserNavigation(): void {

    // Listen to initial URL
    // const currentUrl: string = this.location.path();
    // this.handleURLChanges(currentUrl);

    // Listen to Router events for all navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // const currentUrl = this.location.path();
      // console.log(`>=====>> ${ComponentName} Router Events: Navigation to: ${currentUrl}`);
      if (!this.isPopStateNavigation) {
        const currentUrl = this.location.path();
        this.handleURLChanges(currentUrl);
      }
      this.isPopStateNavigation = false;  // Reset the flag
    });
  
    // Listen to popstate events (back/forward browser buttons)
    this.platformLocation.onPopState(() => {

      this.$newPost.set(0);

      this.isPopStateNavigation = true;  // Set the flag
      const newUrl = this.location.path();
      // console.log('>=====>> ' + ComponentName + 'Browser back/forward detected, new URL:', newUrl);
      // console.log(`>=====>> ${ComponentName} Popstate: Navigation detected: New URL: ${newUrl} Previous URL: ${this.previousUrl}`);
      this.handleURLChanges(newUrl);
      this.previousUrl = newUrl;
    });

  }

  private handleURLChanges(url: string): void {

    this.$newPost.set(0);

    // const initialPath: string = this.location.path().trim().slice(1);
    const urlPath: string = url.trim().slice(1);
    // console.log('>=====>> ' + ComponentName + ' Location Received Path: ' + initialPath);
    const pgNr = Pages.find((p) => p.PageSlug === urlPath)?.PageId;
    // console.log('>=== uuu >> ' + ComponentName + ' Page Nr found: ' + pgNr);

    // Handle home page (/ --> Home)
    if (urlPath.length === 0) {
      this.signalPageContent(1);
      return;
    }
    // Handle valid page numbers
    if ((pgNr && pgNr > 0 && pgNr < 99)) {
      this.signalPageContent(pgNr);
      return;
    }
    // Handle blog posts
    if (urlPath.startsWith(this.postsPrefix)) {
      // const slug = initialPath.startsWith(prefix) ? initialPath.replace(prefix, '') : initialPath;
      const slug = urlPath.slice(this.postsPrefix.length);
      this.signalPageContent(0);
      this.signalArticle(slug);
      return;
    }
    // Handle 404 Not Found
    this.signalPageContent(99, urlPath);
    console.log('>===>> ' + ComponentName + ' ERROR 404 - Requested URL: ' + this.location.path() + ' NOT FOUND!');    

  }




  public signalCategories(): void {
    this.dataService.getCategories().subscribe((categories: ICategory[]) => {
      this.$categories.set(categories);
      // if (this.$category().categoryId === 0) this.signalCategory(1);
    });
  }


  public signalCategory(categoryId: number): void {
    this.dataService
      .getCategory(categoryId)
      .subscribe((category: ICategory) => {
        if (category) {
          this.$category.set(category);
          // console.log('>=== ccc >> ' + ComponentName + ' - ' + 'signalCategory()' + ' *  Category: * ' +  this.$category().categoryId + ' **-** ' );
          this.signalCategoryArticles(this.$category().categoryId);
        } else {
          this.$category.set({
            categoryId: 0,
            categoryTitle: 'Category Not Found!',
          });
        }
      });
  }

  public signalCategoryArticles(categoryId: number): void {
    this.dataService
      .getCategoryArticles(categoryId)
      .subscribe((categoryarticles: IArticleDTO[]) => {
        this.$categoryArticles.set(categoryarticles);
        // console.log('>=== --- >> ' + ComponentName + ' - ' + 'signalCategoryArticles()' + ' * Before ifs * ' +  this.$article().articleId + ' **-** ' + this.$article().articleSlug);
        if (this.$article().categoryId != categoryId) {
            this.signalArticle(this.$categoryArticles()[0].articleId);
        } else  {
         const slug =this.postsPrefix + this.$article().articleSlug; 
          this.routerNavigateTo(slug, false);
        }
        // console.log('>=== --- >> ' + ComponentName + ' - ' + 'signalCategoryArticles()' + '* After ifs * ' +  this.$article().articleId + ' **-** ' + this.$article().articleSlug);
      });
  }

  public signalArticle(requestedArticle: number | string): void {
    // console.log('>=== aaa >> ' + ComponentName + ' - ' + 'signalArticle()' + ' - we are going to fetch the article with id: ' +  requestedId);
    this.dataService
      .getArticleDTO(requestedArticle)
      .subscribe((article: IArticleDTO) => {
        // console.log('>===>> ' + ComponentName + ' - Fetched Article UUID: ' + article.articleClientUUID);
        if (article && article.articleId > 0) {
          this.$article.set(article);
          (this.isMarkdown(article.articleContent) === true) ?  this.$isMarkdown.set(true) :  this.$isMarkdown.set(false);
          if (typeof requestedArticle === 'number') {
            // !!!! Update address bar with article's slug !!!!
            const slug = this.postsPrefix + article.articleSlug; 
            this.routerNavigateTo(slug, false);
          }
          this.signalCategory(this.$article().categoryId);
          // console.log('>=== aaa >> ' + ComponentName + ' - ' + 'signalArticle() 2' + ' article fetched: ' + this.$article().articleId  + ' * article category ID * ' +  this.$article().categoryId + ' * Categoy category ID * ' + this.$category().categoryId);
        } else {
          this.signalPageContent(99,  this.postsPrefix + requestedArticle as string);
          console.log('>===>> ' + ComponentName + ' ERROR 404 - Requested Post: ' + this.location.path() + ' NOT FOUND!'); 
          // console.log('>=== aaa >> ' + ComponentName + ' - ' + 'signalArticle()' + ' - ' +  JSON.stringify(this.$article()));
        }
      });
  }

  public signalPageContent(pageId: number, optionalSlug?: string): void {
    if (pageId === 0) {
      this.$noPostsPageNr.set(0);
      return;
    }
    const page = Pages.find((p) => p.PageId === pageId);

    if (page) {
      // console.log(
      //   '>===>> ' +
      //     ComponentName +
      //     ' - ' +
      //     'Page Id: ' +
      //     page.PageId +
      //     ' Slug: ' +
      //     page.PageSlug
      // );
      this.dataService
        .getPage(page.PageTitle)
        .subscribe((htmlContent: string) => {
          if (htmlContent) {
            this.$pageContent.set(htmlContent);
            this.$noPostsPageNr.set(pageId);
            // this.location.replaceState(page.PageSlug);
            // this.location.go(page.PageSlug);     // <--  This uses 'pushState' to add a new entry to the history stack
            // Use Router navigation instead of location.go
            const slug = typeof(optionalSlug) !== 'undefined' ? optionalSlug :  page.PageSlug;
            // console.log('>===>> ' + ComponentName + ' - ' + ' signalPageContent()  - Page Id: ' + this.$noPostsPageNr() + 'Slug: ' + slug );
            let shouldReplace: boolean = false;
            if ( pageId == 1) shouldReplace = true;
            this.routerNavigateTo(slug, shouldReplace);
          } else {
            this.$pageContent.set('HTML Content Page Not Found!');
          }
        });
    } else {
      this.$pageContent.set('Unknown Page/PageId!');
    }
  }


  public routerNavigateTo(slug: string, replace: boolean) {
    this.router.navigate([slug], { replaceUrl: replace });
  }




  public isMarkdown(text: string): boolean {

  // Regex to detect if the content is predominantly valid HTML
  const fullHtmlPattern = /<([a-z]+)(\s[^>]*|)>([\s\S]*?)<\/\1>/g;

  // Regex to detect HTML tags dominance in the content
  const htmlDominancePattern = /(<([a-z]+)(\s[^>]*|)>[\s\S]*?<\/\2>)/g;

  // Markdown-exclusive patterns
  const markdownPatterns = [
    /^(#{1,6}) .+/m, // Headings (e.g., ## Heading)
    /\*\*(?!<\/?\w+).*?\*\*/m, // Bold (**bold**) allowing inline HTML
    /\*(?!<\/?\w+).*?\*/m, // Italic (*italic*) allowing inline HTML
    /^> .+/m, // Blockquotes
    /^[-*+] .+/m, // Unordered list
    /^[0-9]+\.\s.+/m, // Ordered list
    /\[.+\]\(.+\)/, // Links [text](url)
    /`[^`]+`/, // Inline code (`code`)
    /```[\s\S]*?```/, // Code block (```code```)
    /\|.+\|/, // Tables
    /^---$|^\*\*\*$|^___$/, // Horizontal rules
    /!\[.*\]\(.*\)/, // Images ![alt](url)
  ];

  // Step 1: Check for predominant HTML
  const isFullHtml = fullHtmlPattern.test(text.trim());
  const htmlMatchCount = (text.match(htmlDominancePattern) || []).length;

  if (isFullHtml && htmlMatchCount > markdownPatterns.length) {
    // console.log('>===>>  ' + ComponentName + '  This is valid HTML, not Markdown.');
    return false;
  }

  // Step 2: Check for Markdown-exclusive features
  const containsMarkdown = markdownPatterns.some((pattern) => pattern.test(text));

  if (containsMarkdown) {
    // console.log('>===>>  ' + ComponentName + '  This is Markdown content.');
    return true;
  }

  // Step 3: Default to HTML if ambiguous
  // console.log('>===>>  ' + ComponentName + '  Defaulting to HTML as it is ambiguous.');
  return false;



  }




  async convertMarkdownToHtml(markdownText: string): Promise<string> {
    // Ensure the result is always resolved as a string
    // console.log('>===>> ' + ComponentName + ' Markdown content: ' + markdownText);
    return await this.markdownService.parse(markdownText);
  }

}


