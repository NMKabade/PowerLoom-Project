import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService } from '../../../core/services/production.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private productionService = inject(ProductionService);
  stats: any = null;

  ngOnInit() {
    this.productionService.getOwnerDashboard()
      .subscribe(res => this.stats = res);
  }
}
