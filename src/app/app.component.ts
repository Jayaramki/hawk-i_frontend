import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore Angular v19 language-server static analysis glitch with standalone imports
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationContainerComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <router-outlet></router-outlet>
      <app-notification-container></app-notification-container>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Hawk-i';

  constructor(private readonly themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme service
    this.themeService.getCurrentTheme();
  }
}
