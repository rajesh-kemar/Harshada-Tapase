import { Component, OnInit } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
// Implement OnInit lifecycle hook
export class RegisterComponent implements OnInit { 
  
  // Declare the form property without immediate initialization
  form!: FormGroup; 

  error = '';
  success = '';

  // Inject dependencies in the constructor
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    // The constructor is used for dependency injection; initialization logic goes in ngOnInit
  }

  // Use ngOnInit for initialization logic
  ngOnInit(): void {
    // Initialize the form here, after 'fb' is available
    this.form = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Dispatcher', Validators.required], // default
      // driver-specific (conditionally required)
      experience: [null],
      licenceNumber: ['']
    });

    // subscribe to role changes to toggle validators for driver fields
    this.form.get('role')?.valueChanges.subscribe(role => {
      const exp = this.form.get('experience');
      const lic = this.form.get('licenceNumber');

      if (role === 'Driver') {
        exp?.setValidators([Validators.required, Validators.min(0)]);
        lic?.setValidators([Validators.required, Validators.minLength(12), Validators.maxLength(12)]);
      } else {
        exp?.clearValidators();
        lic?.clearValidators();
      }
      exp?.updateValueAndValidity();
      lic?.updateValueAndValidity();
    });
  }

  submit() {
    // ... (rest of the submit method remains the same) ...
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      name: this.form.value.name,
      username: this.form.value.username,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role
    };

    if (this.form.value.role === 'Driver') {
      payload.experience = this.form.value.experience;
      payload.licenceNumber = this.form.value.licenceNumber;
    }

    this.auth.register(payload).subscribe({
      next: (res: any) => {
        this.success = 'Registered successfully';
        // optionally save token & redirect
        if (res?.token) {
          this.auth.saveToken(res.token);
        }
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: (err) => {
        this.error = err?.error || 'Registration failed';
      }
    });
  }
}
