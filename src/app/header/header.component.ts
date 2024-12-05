import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContentService } from '../shared/content.service';

const ComponentName = 'HeaderComponent';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  private contentService = inject(ContentService);
  headerTitle = 'A simple blog site implementation based on Angular, Spring Boot and MariaDB';

  public homeClicked() {
    this.contentService.signalPageContent(1);
  }

}

