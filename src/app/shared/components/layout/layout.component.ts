import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LayoutService, User, NavbarItem, SidebarItem } from '../../services/layout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  // @ts-ignore - Angular 19 static analysis limitation
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styles: []
})
export class LayoutComponent implements OnInit {
  @Input() user?: User;
  @Input() navbarItems: NavbarItem[] = [];
  @Input() sidebarItems: SidebarItem[] = [];

  sidebarOpen = true;

  constructor(private layoutService: LayoutService) {}

  ngOnInit() {
    // Use service data as fallback if inputs are not provided
    if (!this.user) {
      this.user = this.layoutService.user;
    }
    if (!this.navbarItems.length) {
      this.navbarItems = this.layoutService.navbarItems;
    }
    if (!this.sidebarItems.length) {
      this.sidebarItems = this.layoutService.sidebarItems;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
