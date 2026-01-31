import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  /** Page title (e.g. "Dashboard") */
  pageTitle = input<string>('Dashboard');
  /** Optional: show slot for privacy notice above content */
  showPrivacySlot = input<boolean>(true);
}
