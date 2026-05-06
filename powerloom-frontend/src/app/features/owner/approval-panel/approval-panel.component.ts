import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../../core/services/production.service';

@Component({
  selector: 'app-approval-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './approval-panel.component.html',
  styleUrls: ['./approval-panel.component.scss']
})
export class ApprovalPanelComponent implements OnInit {
  private productionService = inject(ProductionService);
  productions: any[] = [];
  isLoading = true;
  selectedProd: any = null;
  isModalOpen = false;

  ngOnInit() {
    this.fetchProductions();
  }

  fetchProductions() {
    this.productionService.getAllProductions().subscribe({
      next: (data) => { this.productions = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  updateStatus(id: string, status: string) {
    this.productionService.approveProduction(id, status).subscribe(() => {
      if (this.selectedProd && this.selectedProd.id === id) {
        this.closeModal();
      }
      this.fetchProductions();
    });
  }

  openModal(prod: any) {
    this.selectedProd = prod;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProd = null;
  }
}
