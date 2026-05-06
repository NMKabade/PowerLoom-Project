import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activate.component.html'
})
export class ActivateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  status: 'LOADING' | 'SUCCESS' | 'ERROR' = 'LOADING';
  message: string = 'Verifying your activation link...';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const uid = params['uid'];
      const token = params['token'];

      if (uid && token) {
        this.verifyToken(uid, token);
      } else {
        this.status = 'ERROR';
        this.message = 'Invalid activation link. Missing parameters.';
      }
    });
  }

  verifyToken(uid: string, token: string) {
    this.http.post('http://localhost:8000/api/activate/', { uid, token }).subscribe({
      next: (res: any) => {
        this.status = 'SUCCESS';
        this.message = res.message || 'Account activated successfully!';
      },
      error: (err: any) => {
        this.status = 'ERROR';
        this.message = err.error?.error || 'Failed to activate account. The link may have expired or is invalid.';
      }
    });
  }
}
