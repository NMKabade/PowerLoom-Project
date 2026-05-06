import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductionService } from '../../../core/services/production.service';

@Component({
  selector: 'app-manage-machines',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-machines.component.html'
})
export class ManageMachinesComponent implements OnInit {
  private productionService = inject(ProductionService);
  private fb = inject(FormBuilder);

  machines: any[] = [];
  isLoading = false;
  isSaving = false;
  deletingId: string | null = null;
  errorMsg = '';
  successMsg = '';
  showForm = false;

  machineForm = this.fb.group({
    machine_id: ['', [Validators.required, Validators.maxLength(50)]],
    rate_per_meter: ['', [Validators.required, Validators.min(0.01)]],
    description: [''],
    is_active: [true]
  });

  ngOnInit() {
    this.loadMachines();
  }

  loadMachines() {
    this.isLoading = true;
    this.productionService.getMachines().subscribe({
      next: (data) => { this.machines = data; this.isLoading = false; },
      error: () => { this.errorMsg = 'Failed to load machines.'; this.isLoading = false; }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.machineForm.reset({ is_active: true });
    this.errorMsg = '';
    this.successMsg = '';
  }

  saveMachine() {
    if (this.machineForm.invalid) return;
    this.isSaving = true;
    this.errorMsg = '';
    this.productionService.createMachine(this.machineForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMsg = 'Machine added successfully.';
        this.showForm = false;
        this.machineForm.reset({ is_active: true });
        this.loadMachines();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err.error?.machine_id?.[0] || err.error?.detail || 'Failed to save machine.';
      }
    });
  }

  toggleActive(machine: any) {
    this.productionService.updateMachine(machine.id, { is_active: !machine.is_active }).subscribe({
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
}
