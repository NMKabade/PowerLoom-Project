import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { environment } from '../../../../environments/environment';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-manage-jobers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  // Image upload state
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  joberForm = this.fb.group({
    username: ['', Validators.required],
    password: [''],
    email: ['', [Validators.required, Validators.email]],
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
    this.userService.getJobers(this.currentPage).subscribe({
      next: (data: any) => {
        const list = data.results || [];
        this.totalCount = data.count || 0;
        this.jobers = list.map((j: any) => ({
          ...j,
          profile_picture: this.getFullImageUrl(j.profile_picture)
        }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchJobers();
  }

  getFullImageUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = environment.BaseUrl.endsWith('/') ? environment.BaseUrl.slice(0, -1) : environment.BaseUrl;
    return `${baseUrl}${path}`;
  }

  openAddModal() {
    this.isEditing = false;
    this.currentJoberId = null;
    this.joberForm.reset({ role: 'JOBER' });
    this.errorMsg = '';
    this.selectedImage = null;
    this.imagePreview = null;
    this.isModalOpen = true;
  }

  openEditModal(jober: any) {
    this.isEditing = true;
    this.currentJoberId = jober.id;
    this.joberForm.reset();
    this.errorMsg = '';

    this.joberForm.patchValue({
      username: jober.username,
      email: jober.email,
      first_name: jober.first_name,
      last_name: jober.last_name,
      profile: { phone: jober.phone || '', address: jober.address || '' },
      role: 'JOBER'
    });
    this.selectedImage = null;
    this.imagePreview = jober.profile_picture;
    this.isModalOpen = true;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Please select a valid image file.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'Image size exceeds 5 MB limit.';
      return;
    }

    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.joberForm.invalid) return;
    this.isSubmitting = true;
    this.errorMsg = '';

    const formVal = this.joberForm.value;
    const fd = new FormData();

    fd.append('username', formVal.username || '');
    fd.append('first_name', formVal.first_name || '');
    fd.append('last_name', formVal.last_name || '');
    fd.append('email', formVal.email || '');
    fd.append('role', 'JOBER');
    
    // Nested profile fields (serializer source='profile.x' handles this if sent as flat fields or correctly formatted)
    // Actually our serializer uses source='profile.phone', so we should send flat fields
    fd.append('phone', (formVal.profile as any)?.phone || '');
    fd.append('address', (formVal.profile as any)?.address || '');

    if (formVal.password) {
      fd.append('password', formVal.password);
    }

    if (this.selectedImage) {
      fd.append('profile_picture', this.selectedImage, this.selectedImage.name);
    }

    const request$ = this.isEditing && this.currentJoberId
      ? this.userService.updateJober(this.currentJoberId as any, fd)
      : this.userService.createJober(fd);

    request$.subscribe({
      next: () => { 
        this.fetchJobers(); 
        this.closeModal(); 
        this.isSubmitting = false; 
        this.selectedImage = null;
        this.imagePreview = null;
      },
      error: (err) => { 
        this.isSubmitting = false; 
        this.errorMsg = err.error?.username?.[0] || err.error?.detail || 'An error occurred'; 
      }
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

  toggleJoberStatus(jober: any) {
    const newStatus = !jober.is_active;
    const fd = new FormData();
    fd.append('is_active', newStatus.toString());

    this.userService.updateJober(jober.id, fd).subscribe({
      next: (updatedJober: any) => {
        jober.is_active = updatedJober.is_active;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        // Optionally show an error message
      }
    });
  }
}
