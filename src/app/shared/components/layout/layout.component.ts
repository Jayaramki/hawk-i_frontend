import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  // @ts-ignore - Angular 19 static analysis limitation
  imports: [CommonModule, RouterLink, RouterLinkActive, NavbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styles: []
})
export class LayoutComponent {
  @Input() user?: {name: string, email: string, avatar?: string};
  @Input() navbarItems: Array<{label: string, route: string}> = [];
  @Input() sidebarItems: Array<any> = [];

  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
