import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ProductionService } from '../../../core/services/production.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const BASE = 'http://localhost:8000/api/production';

@Component({
  selector: 'app-submit-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './submit-production.component.html',
  styleUrls: ['./submit-production.component.scss']
})
export class SubmitProductionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ── Production list ────────────────────────────────────────────────────────
  productions: any[] = [];
  isListLoading = true;
  listError = '';

  // Pagination & Filtering
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  selectedStatus = 'ALL';

  // ── Modal state ────────────────────────────────────────────────────────────
  showModal = false;
  isSubmitting = false;
  formError = '';
  formSuccess = '';

  // ── View Modal state ───────────────────────────────────────────────────────
  isViewModalOpen = false;
  selectedProd: any = null;
  proofFileUrl: string | null = null;

  // ── Machines dropdown ──────────────────────────────────────────────────────
  machines: any[] = [];
  isMachinesLoading = true;
  selectedJoberRate = 0;
  selectedPeak = 0;

  // ── Form ───────────────────────────────────────────────────────────────────
  prodForm = this.fb.group({
    date: ['', Validators.required],
    machine_id: ['', Validators.required],
    quantity: ['', [Validators.required, Validators.min(1)]],
    rate: [{ value: '', disabled: true }, [Validators.required, Validators.min(0.01)]],
    proof_file: [null as any]
  });

  get quantityValue(): number {
    const val = this.prodForm.get('quantity')?.value;
    return val ? Number(val) : 0;
  }

  get rateValue(): number {
    const val = this.prodForm.get('rate')?.value;
    return val ? Number(val) : 0;
  }

  // ── File preview ───────────────────────────────────────────────────────────
  proofFiles: File[] = [];
  proofPreviews: { url: string; name: string; isImage: boolean }[] = [];

  ngOnInit() {
    this.loadProductions();
    this.loadMachines();

    // Auto-open modal if navigated from dashboard
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true') {
        this.openModal();
        // Clean the query param from URL without re-navigating
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  loadProductions() {
    this.isListLoading = true;
    this.productionService.getMyProductions(this.currentPage, this.selectedStatus).subscribe({
      next: (data: any) => { 
        this.productions = data.results; 
        this.totalCount = data.count || 0;
        this.isListLoading = false; 
      },
      error: () => { this.listError = 'Failed to load productions.'; this.isListLoading = false; }
    });
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadProductions();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProductions();
  }

  loadMachines() {
    this.productionService.getMachinesDropdown().subscribe({
      next: (data) => { this.machines = data; this.isMachinesLoading = false; },
      error: () => { this.isMachinesLoading = false; }
    });
  }

  openModal() {
    this.showModal = true;
    this.formError = '';
    this.formSuccess = '';
    this.prodForm.reset();
    this.proofFiles = [];
    this.proofPreviews = [];
  }

  closeModal() {
    this.showModal = false;
  }

  onMachineChange(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    const machine = this.machines.find(m => m.machine_id === selectedId);
    this.prodForm.get('rate')?.setValue(machine ? machine.rate_per_meter : '');
    this.selectedJoberRate = machine ? machine.jober_rate : 0;
    this.selectedPeak = machine ? machine.peak : 0;
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.formError = 'Only JPG and PNG files are allowed.';
        continue;
      }
      this.formError = '';

      this.proofFiles.push(file);
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.proofPreviews.push({ url: e.target.result, name: file.name, isImage: true });
        };
        reader.readAsDataURL(file);
      } else {
        this.proofPreviews.push({ url: '', name: file.name, isImage: false });
      }
    }
    if (this.proofFiles.length > 0) {
      this.prodForm.patchValue({ proof_file: this.proofFiles[0] });
    }
  }

  removeFile(index: number) {
    this.proofFiles.splice(index, 1);
    this.proofPreviews.splice(index, 1);
    this.prodForm.patchValue({ proof_file: this.proofFiles[0] || null });
  }

  onSubmit() {
    if (this.prodForm.invalid) return;
    this.isSubmitting = true;
    this.formError = '';

    const formData = new FormData();
    formData.append('date', this.prodForm.get('date')?.value || '');
    formData.append('machine_id', this.prodForm.get('machine_id')?.value || '');
    formData.append('quantity', this.prodForm.get('quantity')?.value || '');
    formData.append('rate', this.prodForm.get('rate')?.value || '');
    if (this.proofFiles.length > 0) {
      formData.append('proof_file', this.proofFiles[0]);
    }

    this.productionService.submitProduction(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formSuccess = 'Production log submitted successfully!';
        setTimeout(() => {
          this.closeModal();
          this.loadProductions();
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError = err.error?.detail || 'Failed to submit production log.';
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border border-red-200';
      default:         return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
  }

  // ── View Modal Logic ───────────────────────────────────────────────────────
  openViewModal(prod: any) {
    console.log('Opening View Modal for:', prod);
    this.selectedProd = prod;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
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
