import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService } from '../../../core/services/production.service';

@Component({
  selector: 'app-jober-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private productionService = inject(ProductionService);
  private router = inject(Router);

  stats: any = null;
  myProductions: any[] = [];

  ngOnInit() {
    this.productionService.getSalarySummary()
      .subscribe(res => this.stats = res);

    this.productionService.getMyProductions()
      .subscribe(res => this.myProductions = res.slice(0, 10));
  }

  goToSubmit() {
    this.router.navigate(['/jober/submit'], { queryParams: { openModal: 'true' } });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border border-red-200';
      default:         return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
  }
}
