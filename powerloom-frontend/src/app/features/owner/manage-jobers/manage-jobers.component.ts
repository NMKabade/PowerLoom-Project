import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-manage-jobers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-jobers.component.html',
  styleUrls: ['./manage-jobers.component.scss']
})
export class ManageJobersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  jobers: any[] = [];
  isLoading = false;
  isSubmitting = false;

  isModalOpen = false;
  isEditing = false;
  currentJoberId: string | null = null;
  errorMsg = '';

  joberForm = this.fb.group({
    username: ['', Validators.required],
    password: [''],
    email: ['', [Validators.email]],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    profile: this.fb.group({
      phone: [''],
      address: ['']
    }),
    role: ['JOBER']
  });

  ngOnInit() {
    this.fetchJobers();
  }

  fetchJobers() {
    this.isLoading = true;
    this.userService.getJobers().subscribe({
      next: (data) => { this.jobers = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.currentJoberId = null;
    this.joberForm.reset({ role: 'JOBER' });
    this.joberForm.get('password')?.setValidators([Validators.required]);
    this.joberForm.get('password')?.updateValueAndValidity();
    this.errorMsg = '';
    this.isModalOpen = true;
  }

  openEditModal(jober: any) {
    this.isEditing = true;
    this.currentJoberId = jober.id;
    this.joberForm.reset();
    this.joberForm.get('password')?.clearValidators();
    this.joberForm.get('password')?.updateValueAndValidity();
    this.errorMsg = '';

    this.joberForm.patchValue({
      username: jober.username,
      email: jober.email,
      first_name: jober.first_name,
      last_name: jober.last_name,
      profile: { phone: jober.profile?.phone || '', address: jober.profile?.address || '' },
      role: 'JOBER'
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.joberForm.invalid) return;
    this.isSubmitting = true;
    const formData: any = { ...this.joberForm.value };

    if (this.isEditing && !formData.password) {
      delete formData.password;
    }

    const request$ = this.isEditing && this.currentJoberId
      ? this.userService.updateJober(this.currentJoberId as any, formData)
      : this.userService.createJober(formData);

    request$.subscribe({
      next: () => { this.fetchJobers(); this.closeModal(); this.isSubmitting = false; },
      error: (err) => { this.isSubmitting = false; this.errorMsg = err.error?.username?.[0] || 'An error occurred'; }
    });
  }

  deleteJober(id: string) {
    if (confirm('Are you certain you want to delete this Jober? Their entire production history will be removed!')) {
      this.isLoading = true;
      this.userService.deleteJober(id as any).subscribe({
        next: () => this.fetchJobers(),
        error: () => this.isLoading = false
      });
    }
  }
}
