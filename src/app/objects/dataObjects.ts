
export interface ICategory {
    categoryId: number;
    categoryTitle: string;
    categoryStatusId?: number;
    categoryUUID?: string;   
  }
  
  export interface IArticle {
    articleId: number;
    categoryId: number;
    userId: number;
    articleTitle: string;
    articleSubTitle: string;
    articleSlug: string;
    articleDescription: string;
    articleContent: string;
    articleStatusId?: number;
    articleUUID?: string;
    articleCreationTimestamp: Date;
    articleLastUpdTimestamp: Date;
  }
  


  export interface IArticleDTO extends IArticle{
    userSlugName: string;
    userName: string;
    userSurname: string;
  }
  

  export class ArticleDTO implements IArticleDTO {

    articleId = -1;
    categoryId = -1;
    userId = -1;
    articleTitle = '';
    articleSubTitle = '';
    articleContent = '';
    articleSlug = '';
    articleDescription = '';
    articleCreationTimestamp = new Date("2000-1-1T00:00:0.001");
    articleLastUpdTimestamp = new Date("2000-1-1T100:00:0.001");
    userSlugName = '';
    userName = '';
    userSurname = ''

    // Empty constructor
    constructor(init?: Partial<ArticleDTO>) {
      Object.assign(this, init);
    }
  }
  