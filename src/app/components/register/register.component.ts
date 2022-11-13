import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  private e1: string = '';
  private p1: string = '';
  emailMatchError: boolean;
  pwordMatchError: boolean;

  constructor(private sessionService: SessionService,
    public cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email]),
      confirmEmail: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
      confirmPassword: new FormControl('', [Validators.required])
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