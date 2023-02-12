import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string;
  password: string
  currentRoute: string;
  googleIconSrc = '../../../assets/img/google-icon-org.svg';

  constructor(
    private sessionService: SessionService,
    private router: Router,
    public cd: ChangeDetectorRef
  ) { }

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
