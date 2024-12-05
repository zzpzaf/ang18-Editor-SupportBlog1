import { Injectable, RendererFactory2, PLATFORM_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { PostStructuredData, PostTags } from '../objects/seoObjects';
import { ArticleDTO } from '../objects/dataObjects';
import { environment } from '../../environments/environment';
import { Pages } from '../objects/blogObjects';

const ComponentName = 'SeoService';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private metaService = inject(Meta);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  // private ngZone = inject(NgZone);
  private postsPrefix: string = environment.postsPrefix;


  constructor(
    // private rendererFactory: RendererFactory2,
    // private metaService: Meta,
    // private titleService: Title,
    // @Inject(PLATFORM_ID) platformId: any
  ) {
    // this.renderer = this.rendererFactory.createRenderer(null, null);
    // this.isBrowser = isPlatformBrowser(platformId);
  }



  updateTags(pgNr: number, article: ArticleDTO, content: string): void {
    // if (!this.isBrowser) {
      // console.warn('SEO updates skipped: not running in browser.');
      // return; // Ensure this runs only in the browser.
    // }
    this.clearMetaTags();
    this. clearRendererEntries();

    const postTags = new PostTags();
    pgNr === 0 ? this.getArticleMetaTags(article, content, postTags) : this.getPageMetaTags(pgNr, postTags);
    this.addMetaTags(postTags, content);
    this.addStructuredData(postTags, content);

  }

  private getArticleMetaTags(article: ArticleDTO, content: string, postTags: PostTags): void {
    // const postTags = new PostTags();
    postTags.postTitle = this.trimText(article.articleTitle, 60);
    postTags.postDescription = article.articleSubTitle.trim() || 'No Article Subtitle';
    postTags.postCanonicalUrl = `${this.getLocationOrgin()}/${this.postsPrefix}${article.articleSlug}`;
    postTags.ogTitle = this.trimText(article.articleTitle, 50);
    postTags.ogDescription = this.trimText(article.articleDescription || article.articleSubTitle, 200);
    postTags.postUser = article.userSlugName;
    postTags.postCreationTimestamp = article.articleCreationTimestamp;
   // return postTags;
  }

  private getPageMetaTags(pgNr: number, postTags: PostTags): void {
    // const postTags = new PostTags();
    const page = Pages.find((p) => p.PageId === pgNr);
    if (page) {
      postTags.postTitle = page.PageTitle;
      postTags.postDescription = page.PageDescription;
      postTags.postCanonicalUrl = `${this.getLocationOrgin()}/${page.PageSlug}`;
      postTags.ogTitle = this.trimText(page.PageTitle, 50);
      postTags.ogDescription = this.trimText(page.PageDescription, 200);
    }
    // return postTags;
  }

  private addMetaTags(postTags: PostTags, content: string): void {

    this.titleService.setTitle(postTags.postTitle);

    this.updateCanonicalLink(postTags.postCanonicalUrl);

    this.metaService.updateTag({ name: 'description', content: postTags.postDescription });
    this.metaService.updateTag({ name: 'robots', content: postTags.postRobotsValue });
    this.metaService.updateTag({ property: 'og:title', content: postTags.ogTitle });
    this.metaService.updateTag({ property: 'og:description', content: postTags.ogDescription });
    this.metaService.updateTag({ property: 'og:url', content: postTags.postCanonicalUrl });

    const firstImgUrl = this.getPostFirstImageAsMain(content);
    if (firstImgUrl) {
      this.metaService.updateTag({ property: 'og:image', content: firstImgUrl });
      this.metaService.updateTag({ name: 'twitter:image', content: firstImgUrl });
    }

    this.metaService.updateTag({ name: 'twitter:card', content: postTags.postTwiiterCardValue });
    this.metaService.updateTag({ name: 'twitter:title', content: postTags.ogTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: postTags.ogDescription });
  }

  private addStructuredData(postTags: PostTags, content: string): void {
    // if (!this.isBrowser) return;

    const firstImgUrl = this.getPostFirstImageAsMain(content);
    const logoUrl = `${this.getLocationOrgin()}}/assets/images/logo.webp`;

    
    const structuredData = new PostStructuredData().getStructuredDataWithDefaults({
      headline: postTags.postTitle,
      description: postTags.postDescription,
      imageUrl: firstImgUrl || '',
      authorName: postTags.postUser,
      datePublished: this.formatDate(postTags.postCreationTimestamp),
      orgLogoUrl: logoUrl
    });


    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.appendChild(script, this.renderer.createText(JSON.stringify(structuredData)));
    this.renderer.appendChild(this.renderer.selectRootElement('head', true), script);
    
  }

  private clearMetaTags(): void {
    const tagsToRemove = [
      "name='description'",
      "rel='canonical'",
      "name='robots'",
      "property='og:title'",
      "property='og:description'",
      "property='og:url'",
      "name='twitter:card'",
      "name='twitter:title'",
      "name='twitter:description'",
      "name='twitter:image'",
    ];
    tagsToRemove.forEach((selector) => this.metaService.removeTag(selector));
  }


  private clearRendererEntries(): void {
    //   if (!this.isBrowser) return;
    const head = this.renderer.selectRootElement('head', true);
    const canonicalLink = head.querySelector("link[rel='canonical']");
    if (canonicalLink) {
      this.renderer.removeChild(head, canonicalLink);
    }
    const scripts = head.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script: any) => this.renderer.removeChild(head, script));

  }

  private updateCanonicalLink(url: string): void {
    if (!this.isBrowser) {
      console.warn('>===>> ' + ComponentName + ' - ' +'updateCanonicalLink() method is getting skipped when it is not running in the browser.');
      return; // Ensure this runs only in the browser.
    }
  
    // Safely select or create the <link rel="canonical"> element
    let canonicalLink: HTMLElement | null;
    try {
      canonicalLink = this.renderer.selectRootElement('link[rel="canonical"]', true);
    } catch {
      // If selectRootElement fails, create the <link rel="canonical"> element
      canonicalLink = this.renderer.createElement('link');
      this.renderer.setAttribute(canonicalLink, 'rel', 'canonical');
      this.renderer.appendChild(this.renderer.selectRootElement('head', true), canonicalLink);
    }
  
    // Update the href attribute
    if (canonicalLink) {
      this.renderer.setAttribute(canonicalLink, 'href', url);
    }
  }


  private formatDate(date: any): string {
    const defDate = '2024-01-01T00:00:01.001+00:00';
    try {
      return new Date(date || defDate).toISOString();
    } catch {
      return new Date(defDate).toISOString();
    }
  }

  private getPostFirstImageAsMain(content: string): string {
    const imgRegex = /(?:<img[\s\S]*?src=["']([^"']+)["'])|(?:!\[[^\]]*\]\(([^)\s]+)[^\)]*\))/i;
    const match = imgRegex.exec(content.replace(/\s+/g, ' ').trim());
    const firstImageUrl = match?.[1] || match?.[2] || '';
    return firstImageUrl ? this.getFullURL(firstImageUrl) : '';
  }

  private getFullURL(url: string): string {
    return /^https?:\/\//i.test(url)
      ? url
      : `${this.getLocationOrgin()}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private trimText(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
  }

  private getLocationOrgin(): string {
    // return window.location.origin;
    if (!this.isBrowser) {
      return 'http://www.mydomain.com';
    } else {
      return window.location.origin;
    }
    //return 'http://www.mydomain.com';
  } 
}
