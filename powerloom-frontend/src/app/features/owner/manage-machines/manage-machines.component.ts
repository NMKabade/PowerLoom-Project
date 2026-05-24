import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ProductionService } from '../../../core/services/production.service';
import { environment } from '../../../../environments/environment';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-manage-machines',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, PaginationComponent],
  templateUrl: './manage-machines.component.html'
})
export class ManageMachinesComponent implements OnInit {
  private productionService = inject(ProductionService);
  private fb = inject(FormBuilder);

  machines: any[] = [];
  currencies: any[] = [];
  isLoading = false;
  isSaving = false;
  deletingId: string | null = null;
  errorMsg = '';
  successMsg = '';
  showForm = false;
  isEditing = false;
  editingMachineId: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  // Image upload state
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // View detail modal
  selectedMachine: any = null;

  machineForm = this.fb.group({
    machine_id: ['', [Validators.required, Validators.maxLength(50)]],
    currency: ['', Validators.required],
    rate_per_meter: ['', [Validators.required, Validators.min(0.01)]],
    jober_rate: ['', [Validators.required, Validators.min(0.01)]],
    peak: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    is_active: [true]
  });

  ngOnInit() {
    this.loadMachines();
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.productionService.getCurrencies().subscribe({
      next: (data: any) => this.currencies = data.results,
      error: () => this.errorMsg = 'Failed to load currencies.'
    });
  }

  loadMachines() {
    this.isLoading = true;
    this.productionService.getMachines(this.currentPage).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        this.totalCount = data.count || 0;
        this.machines = list.map((m: any) => ({
          ...m,
          image: this.getFullImageUrl(m.image)
        }));
        this.isLoading = false;
      },
      error: () => { this.errorMsg = 'Failed to load machines.'; this.isLoading = false; }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadMachines();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.isEditing = false;
    this.editingMachineId = null;
    this.machineForm.reset({ is_active: true });
    this.selectedImage = null;
    this.imagePreview = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Validate type & size (max 5 MB)
    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Please select a valid image file (JPG, PNG, WEBP, etc.)';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'Image size must be less than 5 MB.';
      return;
    }

    this.selectedImage = file;
    this.errorMsg = '';

    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  saveMachine() {
    if (this.machineForm.invalid) return;
    this.isSaving = true;
    this.errorMsg = '';

    const formVal = this.machineForm.value;
    const fd = new FormData();
    fd.append('machine_id', formVal.machine_id ?? '');
    fd.append('currency', formVal.currency ?? '');
    fd.append('rate_per_meter', formVal.rate_per_meter ?? '');
    fd.append('jober_rate', formVal.jober_rate ?? '');
    fd.append('peak', formVal.peak?.toString() ?? '0');
    fd.append('description', formVal.description ?? '');
    fd.append('is_active', formVal.is_active ? 'true' : 'false');
    if (this.selectedImage) {
      fd.append('image', this.selectedImage, this.selectedImage.name);
    }

    const request = this.isEditing && this.editingMachineId
      ? this.productionService.updateMachine(this.editingMachineId, fd)
      : this.productionService.createMachine(fd);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.successMsg = `Machine ${this.isEditing ? 'updated' : 'added'} successfully.`;
        this.showForm = false;
        this.isEditing = false;
        this.editingMachineId = null;
        this.machineForm.reset({ is_active: true });
        this.selectedImage = null;
        this.imagePreview = null;
        this.loadMachines();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err.error?.machine_id?.[0] || err.error?.detail || `Failed to ${this.isEditing ? 'update' : 'save'} machine.`;
      }
    });
  }

  toggleActive(machine: any) {
    const fd = new FormData();
    fd.append('is_active', (!machine.is_active).toString());
    this.productionService.updateMachine(machine.id, fd).subscribe({
      next: () => this.loadMachines(),
      error: () => this.errorMsg = 'Failed to update machine status.'
    });
  }

  deleteMachine(id: string) {
    if (!confirm('Delete this machine? This cannot be undone.')) return;
    this.deletingId = id;
    this.productionService.deleteMachine(id).subscribe({
      next: () => { this.deletingId = null; this.loadMachines(); },
      error: () => { this.deletingId = null; this.errorMsg = 'Failed to delete machine.'; }
    });
  }

  viewMachine(machine: any) {
    this.selectedMachine = machine;
  }

  editMachine(machine: any) {
    this.isEditing = true;
    this.editingMachineId = machine.id;
    this.showForm = true;
    this.machineForm.patchValue({
      machine_id: machine.machine_id,
      currency: machine.currency,
      rate_per_meter: machine.rate_per_meter,
      jober_rate: machine.jober_rate,
      peak: machine.peak,
      description: machine.description,
      is_active: machine.is_active
    });
    this.imagePreview = machine.image;
    this.selectedImage = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  closeView() {
    this.selectedMachine = null;
  }

  getFullImageUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    // Prepend base URL if it's a relative path
    const baseUrl = environment.BaseUrl.endsWith('/') ? environment.BaseUrl.slice(0, -1) : environment.BaseUrl;
    return `${baseUrl}${path}`;
  }
}
