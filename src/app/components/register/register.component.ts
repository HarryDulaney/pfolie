import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ThemeService } from 'src/app/services/theme.service';
import { Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CONSTANT as Const } from '../../constants'
import { ScreenService } from 'src/app/services/screen.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputTextModule, NgIf, ButtonModule, RippleModule, DialogModule, ToastModule]
})
export class RegisterComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  destroySubject$ = new Subject();
  contentStyle = {
    'margin': '0 auto !important',
    'width': '100% !important'
  };
  screenSize: string;

  registerForm: UntypedFormGroup;
  private e1: string = '';
  private p1: string = '';
  emailMatchError: boolean;
  pwordMatchError: boolean;
  mainLogoSrc = "../../../assets/img/pfolie-logo-1-white.png";

  constructor(private sessionService: SessionService,
    private themeService: ThemeService,
    private screenService: ScreenService,
    public cd: ChangeDetectorRef) { }

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