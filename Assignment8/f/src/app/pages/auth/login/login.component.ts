import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],   // ✅ ADD THIS
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    this.error = '';
    if (this.form.invalid) return;

    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: (res: any) => {
        // backend returns { token, role, username, userId }
        this.auth.saveToken(res.token || res.Token);
        this.auth.saveUserMeta({ role: res.role || res.Role, userId: res.userId || res.UserId });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error || 'Login failed';
      }
    });
  }
}
