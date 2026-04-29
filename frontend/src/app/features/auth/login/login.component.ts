import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {ReactiveFormsModule, FormBuilder, AbstractControl, Validators} from "@angular/forms";
import {Router, ActivatedRoute} from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.group({
    username: ['', Validators.required, Validators.minLength(3)],
    password: ['', Validators.required, Validators.minLength(6)],
  });

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      const { username, password } = this.form.value;
      await this.authService.login(username!, password!);

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
      this.router.navigateByUrl(returnUrl);
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      this.loading.set(false);
    }
  }
}


