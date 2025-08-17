import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <img src="assets/logo.png" alt="INA-HawkEye Logo" class="w-42 h-32 mx-auto mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Signing Out</h2>
          <p class="text-gray-600 dark:text-gray-400">Please wait while we sign you out...</p>
        </div>
        
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SignoutComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulate logout process
    setTimeout(() => {
      this.performLogout();
    }, 1500);
  }

  private performLogout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear any other stored data
    // Add any additional logout logic here
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
