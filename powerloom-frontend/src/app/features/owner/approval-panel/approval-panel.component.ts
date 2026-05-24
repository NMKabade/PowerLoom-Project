import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductionService } from '../../../core/services/production.service';
import { environment } from '../../../../environments/environment';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-approval-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, PaginationComponent],
  templateUrl: './approval-panel.component.html',
  styleUrls: ['./approval-panel.component.scss']
})
export class ApprovalPanelComponent implements OnInit {
  private productionService = inject(ProductionService);
  productions: any[] = [];
  isLoading = true;
  selectedProd: any = null;
  isModalOpen = false;
  proofFileUrl: string | null = null;

  // Remark Modal State
  isRemarkModalOpen = false;
  remarkText = '';
  pendingAction: { id: string, status: string } | null = null;
  isProcessing = false;

  // Filtering & Search
  statusFilter: string = 'ALL';
  searchQuery: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.fetchProductions();
    
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.fetchProductions();
    });
  }

  get filteredProductions() {
    // Now backend handles filtering, but we keep this getter for 
    // compatibility with the template which uses filteredProductions
    return this.productions;
  }

  onFilterChange(status: string) {
    this.statusFilter = status;
    this.currentPage = 1; // Reset to page 1 on filter change
    this.fetchProductions();
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to page 1 on search change
    this.searchSubject.next(this.searchQuery);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchProductions();
  }

  fetchProductions() {
    this.isLoading = true;
    this.productionService.getAllProductions(this.statusFilter, this.searchQuery, this.currentPage).subscribe({
      next: (data: any) => { 
        this.productions = data.results; 
        this.totalCount = data.count;
        this.isLoading = false; 
      },
      error: () => this.isLoading = false
    });
  }

  openRemarkModal(id: string, status: string) {
    this.pendingAction = { id, status };
    this.remarkText = '';
    this.isRemarkModalOpen = true;
  }

  closeRemarkModal() {
    this.isRemarkModalOpen = false;
    this.pendingAction = null;
    this.remarkText = '';
  }

  confirmAction() {
    if (!this.pendingAction || this.isProcessing) return;

    this.isProcessing = true;
    const { id, status } = this.pendingAction;

    this.productionService.approveProduction(id, status, this.remarkText).subscribe({
      next: () => {
        this.isProcessing = false;
        this.closeRemarkModal();
        if (this.selectedProd && this.selectedProd.id === id) {
          this.closeModal();
        }
        this.fetchProductions();
      },
      error: () => {
        this.isProcessing = false;
        // Optionally handle error
      }
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

  openProofModal(url: string) {
    if (url && !url.startsWith('http')) {
      this.proofFileUrl = `${environment.BaseUrl}${url}`;
    } else {
      this.proofFileUrl = url;
    }
  }

  closeProofModal() {
    this.proofFileUrl = null;
  }
}
