import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  profileForm: FormGroup;
  isLoading = signal(true);
  isSaving = signal(false);
  isEditing = signal(false);
  message = signal<{ type: 'success' | 'error', text: string } | null>(null);

  constructor() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      role: [{ value: '', disabled: true }],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.message.set({ type: 'error', text: 'Failed to load profile details.' });
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.message.set(null);

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (user) => {
        this.message.set({ type: 'success', text: 'Profile updated successfully!' });
        this.isSaving.set(false);
        this.isEditing.set(false);
      },
      error: (err) => {
        this.message.set({ type: 'error', text: 'Failed to update profile.' });
        this.isSaving.set(false);
      }
    });
  }

  toggleEdit() {
    this.isEditing.set(true);
    this.message.set(null);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.loadProfile();
  }
}
