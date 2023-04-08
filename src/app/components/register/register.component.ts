import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, NgModel, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, InputTextModule, NgIf, ButtonModule, RippleModule]
})
export class RegisterComponent implements OnInit {

  registerForm: UntypedFormGroup;
  private e1: string = '';
  private p1: string = '';
  emailMatchError: boolean;
  pwordMatchError: boolean;

  constructor(private sessionService: SessionService,
    public cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.registerForm = new UntypedFormGroup({
      email: new UntypedFormControl('', [
        Validators.required,
        Validators.email]),
      confirmEmail: new UntypedFormControl('', [Validators.required]),
      password: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
      confirmPassword: new UntypedFormControl('', [Validators.required])
    });

    this.registerForm.get('email').valueChanges.subscribe(value => {
      if (value) {
        this.e1 = value;
      }
    });

    this.registerForm.get('confirmEmail').valueChanges.subscribe(value => {
      if (value && value.trim() !== '') {
        if (this.e1 && this.e1.trim() !== '') {
          if (value !== this.e1) {
            this.emailMatchError = true;
            return;
          }
        }
      }
      this.emailMatchError = false;
    });

    this.registerForm.get('password').valueChanges.subscribe(value => {
      if (value && value !== '') {
        this.p1 = value;
      }
    });

    this.registerForm.get('confirmPassword').valueChanges.subscribe(value => {
      if (value && value.trim() !== '') {
        if (this.p1 && this.p1.trim() !== '') {
          if (value !== this.p1) {
            this.pwordMatchError = true;
            return;
          }
        }
      }
      this.pwordMatchError = false;
    });


  }

  navigateLogin() {
    this.sessionService.showRegisterModal = false;
    this.sessionService.showLoginModal = true;
  }

  registerHandler(event: any) {
    const email = this.registerForm.get('email').value;
    const password = this.registerForm.get('password').value;
    this.sessionService.registerNewUser(email, password);
  }

}