import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ScreenService } from 'src/app/services/screen.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, InputTextModule, NgIf, MatButtonModule]
})
export class LoginComponent implements OnInit {
  email: string;
  password: string
  currentRoute: string;
  googleIconSrc = '../../../assets/img/google-icon-org.svg';
  screenSize: string;
  constructor(
    public screenService: ScreenService,
    public cd: ChangeDetectorRef,
    private sessionService: SessionService,
  ) { }

  ngOnInit(): void {
    this.screenService.screenSource$.subscribe((screen) => {
      this.screenSize = screen;
      this.cd.detectChanges();
    }
    );

  }

  googleSignIn() {
    this.sessionService.signInWithGoogle();
  }

  facebookSignIn() {
    this.sessionService.signInWithFacebook();
  }

  githubSignIn() {
    this.sessionService.signInWithGithub();
  }


  navigateRegister() {
    this.sessionService.showLoginModal = false;
    this.sessionService.showRegisterModal = true;
  }

  signInHandler(event: any) {
    this.sessionService.signInExistingUser(this.email, this.password);
  }


  isValid(): boolean {
    return this.isValidEmail() && this.isValidPassword();
  }

  isValidEmail() {
    return (this.email && this.email.trim() !== '');
  }

  isValidPassword() {
    return (this.password && this.password.trim() !== '');
  }

}
