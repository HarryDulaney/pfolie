import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ScreenService } from 'src/app/services/screen.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Subject, takeUntil } from 'rxjs';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CONSTANT as Const } from '../../constants'
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, InputTextModule, NgIf, MatButtonModule, ButtonModule, SharedModule, DialogModule, ToastModule]
})
export class LoginComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  email: string;
  password: string
  currentRoute: string;
  googleIconSrc = '../../../assets/img/google-icon-org.svg';
  facebookIconSrc = '../../../assets/img/icons8-facebook.svg';
  githubIconSrc = '../../../assets/img/icons8-github.svg';

  mainLogoSrc = "../../../assets/img/pfolie-logo-1-white.png";
  screenSize: string;
  destroySubject$ = new Subject();

  contentStyle = {
    'margin': '0 auto !important',
    'width': '100% !important'
  };

  styleClass = 'login-dialog-container';

  constructor(
    public screenService: ScreenService,
    public themeService: ThemeService,
    public cd: ChangeDetectorRef,
    private sessionService: SessionService,
  ) { }



  ngOnInit(): void {
    this.screenService.screenSource$
      .subscribe(
        (screen) => {
          this.screenSize = screen;
          if (screen === Const.SCREEN_SIZE.XS) {
            this.contentStyle = {
              'margin': '0 auto !important',
              'width': '100% !important'

            }
          } else if (screen === Const.SCREEN_SIZE.S) {
            this.contentStyle = {
              'margin': '0 auto !important',
              'width': '100% !important'

            }
          } else if (screen === Const.SCREEN_SIZE.M) {
            this.contentStyle = {
              'margin': '0 auto !important',
              'width': '100% !important'

            }
          } else if (screen === Const.SCREEN_SIZE.L) {
            this.contentStyle = {
              'margin': '0 auto !important',
              'width': '40% !important'

            }
          } else {
            this.contentStyle = {
              'margin': '0 auto !important',
              'width': '30% !important'
            };
          }

        });

    this.themeService.themeSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((theme) => {
      if (theme) {
        if (theme.includes('dark')) {
          this.mainLogoSrc = "../../../assets/img/pfolie-logo-1-white.png";
        } else {
          this.mainLogoSrc = "../../../assets/img/pfolie-logo-1-black.png";
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
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

  signInTempAccount() {
    this.sessionService.signInAnonymously();
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
