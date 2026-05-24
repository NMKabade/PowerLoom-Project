import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);
  showDropdown = signal(false);
  isMobileMenuOpen = signal(false);

  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showDropdown.set(false);
    }
  }

  getInitials(username: string): string {
    if (!username) return 'U';
    const parts = username.split(/[._\s-]/);
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.showDropdown.set(false);
  }

  getDashboardUrl(): string {
    const role = this.authService.getRole();
    if (role === 'ADMIN') return '/owner/dashboard';
    if (role === 'JOBER') return '/jober/dashboard';
    return '/login';
  }
}
