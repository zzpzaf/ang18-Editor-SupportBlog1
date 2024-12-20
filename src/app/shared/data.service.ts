import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, retry, throwError } from 'rxjs';
import { IArticle, IArticleDTO, ICategory } from '../objects/dataObjects';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';

const ComponentName = 'DataService';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  
  componentName = this.constructor.name.replace('_', '');
  // baseURL: string = '/assets/';
  // baseURL: string = 'http://localhost:8080/blogapi/';
  baseURL: string = environment.apiUrl;
  pageBaseURL: string = '/assets/';



  getCategories(): Observable<ICategory[]> {
    // console.log('baseURL: ' + this.baseURL);
    return this.http
      .get<ICategory[]>(this.baseURL + `categories`)    // (this.baseURL + `categories.json`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCategory(categoryId: number): Observable<ICategory> {
    return this.http
      .get<ICategory>(this.baseURL + `categories` + '/categoryId/' + categoryId)       
      .pipe(retry(1), catchError(this.handleError));
  }
  

  getArticles(): Observable<IArticleDTO[]> {
    return this.http
      .get<IArticleDTO[]>(this.baseURL + `articles`)       // (this.baseURL + `articles.json`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCategoryArticles(categoryId: number): Observable<IArticleDTO[]> {
    return this.http
    .get<IArticleDTO[]>(this.baseURL + `articles` + '/categoryId/' + categoryId)       
    .pipe(retry(1), catchError(this.handleError));
  }

  addArticle(newArticle: IArticleDTO): Observable<IArticleDTO> {
    return this.http
      .post<IArticleDTO>(this.baseURL + `articles`, newArticle)
      .pipe(retry(1), catchError(this.handleError));
  }

  updateArticle(newArticle: IArticleDTO): Observable<IArticleDTO> {
    return this.http
      .patch<IArticleDTO>(this.baseURL + `articles`, newArticle)
      .pipe(retry(1), catchError(this.handleError));
  }



  

  getArticleDTO(article: number| string): Observable<IArticleDTO> {
    switch ( typeof(article) ) {
      case "number":
        return this.getArticleDTOById(article as number);
        //break;
      case "string":
        return this.getArticleDTOBySlug(article as string);
        //break;
      default:
        const msg = "Invalid argument type: article must be a number or string";
        console.log('>===>> ' + ComponentName + ' - ' + msg);
        throw new Error(msg);
        // return of(null);
    }
  }
  getArticleDTOById(articleId: number): Observable<IArticleDTO> {
    return this.http
      .get<IArticleDTO>(this.baseURL + `articles` + '/articleId/' + articleId)       
      .pipe(retry(1), catchError(this.handleError));
  }
  getArticleDTOBySlug(articleSlug: string): Observable<IArticleDTO> {
    return this.http
      .get<IArticleDTO>(this.baseURL + `articles` + '/articleSlug/' + articleSlug)       
      .pipe(retry(1), catchError(this.handleError));
  }







  getPage(htmlPageName: string): Observable<string> {
    return this.http
      .get( this.pageBaseURL + htmlPageName + '.html', { responseType: 'text' })
      .pipe(retry(1), catchError(this.handleError));
  }





  // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // window.alert(errorMessage);
    // Un-tested, here:
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        token: 'error',
        header: 'Error Accessing Backend!',
        content: errorMessage,
        posAnsMsg: 'OK',
        negAnsMsg: ''
      },
      disableClose: true
    });
    return throwError(() => {
      return errorMessage;
    });
  }
}
