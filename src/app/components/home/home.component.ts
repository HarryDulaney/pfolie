import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { MatSidenav } from '@angular/material/sidenav';
import { MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SessionService } from 'src/app/services/session.service';
import { LoginComponent } from '../login/login.component';
import { ToastMessage } from 'src/app/models/toast-message';
import { Toast } from 'primeng/toast';
import { ToastService } from 'src/app/services/toast.service';
import firebase from 'firebase/compat/app';
import { RegisterComponent } from '../register/register.component';
import { SearchComponent } from '../search/search.component';
import { NavService } from 'src/app/services/nav.service';
import { mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, timer } from 'rxjs';
import { DashboardService } from '../dashboard/dashboard.service';
import { BasicCoin, GlobalDataView } from 'src/app/models/coin-gecko';
import { ScreenService } from 'src/app/services/screen.service';
import { CONSTANT as Const, PROJECT_LINKS } from '../../constants'
import { Observable } from "rxjs"
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService, DashboardService]

})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('snav') snav: MatSidenav;
  @ViewChild('searchPanel') searchPanel: OverlayPanel;
  @ViewChild('accountPanel') accountPanel: OverlayPanel;
  @ViewChild('loginModal') loginModal: LoginComponent;
  @ViewChild('register') registerComp: RegisterComponent;
  @ViewChild('login') loginComp: LoginComponent;
  @ViewChild('appSearch') searchComponent: SearchComponent;
  @ViewChild('searchInputWrapper') searchInputTarget: ElementRef;



  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    if (event) {
      if (this.searchPanel.overlayVisible) {
        this.searchPanel.hide();
      }
      if (this.accountPanel.overlayVisible) {
        this.accountPanel.hide();
      }
    }
  }

  screenSize: string;
  navOpened: boolean;

  searchField: FormControl = new FormControl('');
  searchForm: FormGroup;
  toast: Toast;
  private user: firebase.User = null;
  private readonly issuesLink = PROJECT_LINKS.ISSUES;
  private readonly aboutPageLink = PROJECT_LINKS.ABOUT;
  title = 'Pfolie';
  navbarTitle: string = this.title;
  isLoading: boolean;
  verified: boolean;
  searchActive: boolean;
  userProfilePictureSource: string = null;
  signedOutNavItems: MenuItem[];
  signedInNavItems: MenuItem[];
  accountMenuItems: MenuItem[];
  signedOutAccountMenuItems: MenuItem[];

  destroySubject$ = new Subject();
  globalDataView: GlobalDataView = {} as GlobalDataView;
  isGlobalDataLoading: boolean;

  imagePreviewSrc: string = '../assets/img/image_filler_icon_blank.jpg';
  googleIconSrc = '../../../assets/img/google-icon-org.svg';

  allCoins: BasicCoin[] = [];

  constructor(
    private router: Router,
    private navService: NavService,
    public sessionService: SessionService,
    public configService: ConfigService,
    private screenService: ScreenService,
    private toastService: ToastService,
    private cd: ChangeDetectorRef,
    fb: FormBuilder,
    private dashboardService: DashboardService,
    private messageService: MessageService) {

    this.searchForm = fb.group({
      searchField: this.searchField
    });

    this.screenService.screenSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      screenSize => {
        this.screenSize = screenSize;
        if (this.screenSize === Const.SCREEN_SIZE.XS) {
          this.navOpened = false;
        } else {
          this.navOpened = true;
        }
      });

  }

  ngAfterViewInit(): void {
    this.searchForm.get('searchField').valueChanges.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(word => {
      if (!this.searchPanel.overlayVisible) {
        this.searchPanel.show(new Event("change"), this.searchInputTarget.nativeElement);
      }
      this.configService.filter(word);
    });

    this.toastService.messageEmitter.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((toastMessage: ToastMessage) => {
      this.showToast(toastMessage);
    });

    this.searchPanel.onShow.pipe(
      takeUntil(this.destroySubject$),
      switchMap(show => {
        return this.searchComponent.onSelect;
      })
    ).subscribe(
      selected => {
        if (selected) {
          this.searchPanel.hide();
          this.navService.navigateTo(selected);
        }
      });
  }


  ngOnInit() {
    this.sessionService.getAuth().pipe(takeUntil(this.destroySubject$)).subscribe(user => {
      this.user = user;
      if (user !== null) {
        if (user.photoURL) {
          this.userProfilePictureSource = user.photoURL;
        } else {
          this.userProfilePictureSource = this.imagePreviewSrc;
        }
      }
    });

    this.configService.getGlobalStore().state$.select('basicCoins')
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        coins => this.allCoins = coins
      );

    if (this.screenSize === Const.SCREEN_SIZE.XS) {
      this.navService.navExpandedSource$.next(false);
    } else {

      this.navService.navExpandedSource$.next(true);
    }

    this.initNavMenus();
    this.isGlobalDataLoading = true;
    timer(0, 60000).pipe(
      takeUntil(this.destroySubject$),
      mergeMap((value) => this.dashboardService.getGlobalData())
    ).subscribe(
      {
        next: (globalView) => {
          if (globalView) {
            this.globalDataView = globalView;
            this.isGlobalDataLoading = false;
          }
        }
      }
    )
    this.cd.detectChanges();

  }


  getMainNavStyleClass(): string {
    if (this.screenSize === Const.SCREEN_SIZE.XS) {
      return 'mobile--side-nav';
    }
    return 'non-mobile--side-nav';
  }

  getMainNavMode(): string {
    if (this.screenSize === Const.SCREEN_SIZE.XS) {
      return 'over';
    }
    return 'side';
  }


  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  getFilteredCoins(): Observable<BasicCoin[]> {
    return this.configService.getGlobalStore().state$.select('filteredCoins');
  }

  initNavMenus() {
    this.signedInNavItems = [
      {
        label: 'Account',
        icon: 'fa fa-user-circle',
        items: [
          /*      {
                 label: 'Settings (Coming Soon)',
                 icon: 'fa fa-gear',
                 disabled: true,
                 command: (event) => {
                   // Open settings
                 }
               }, */
          {
            label: 'Sign Out',
            icon: 'fa fa-sign-out',
            command: (event) => {
              this.handleSignOut();
            }
          },
          {
            label: 'Privacy Policy',
            icon: 'fa fa-lock',
            command: (event) => {
              this.privacyPolicy();
            }
          }
        ]
      },
      {
        label: 'Home',
        icon: 'fa fa-home',
        command: (event) => {
          this.home();
        }
      },
      {
        label: 'News Aggregator',
        icon: 'fa fa-newspaper-o',
        command: (event) => {
          this.allNews();
        }
      },
      {
        label: 'Portfolio',
        expanded: true,
        icon: 'fa fa-bar-chart',
        items: [
          {
            label: 'Portfolio Manager',
            icon: 'fa fa-bar-chart',
            disabled: false,
            command: (event) => {
              this.portfolio();
            }
          },
          {
            label: 'Watchlist',
            icon: 'fa fa-eye',
            disabled: false,
            command: (event) => {
              this.openTrackedAssets();
            }
          },
        ],
      },

      {
        label: 'Help',
        icon: 'pi pi-fw pi-question',
        expanded: true,
        items: [
          {
            label: 'About',
            icon: 'pi pi-external-link',
            url: this.aboutPageLink
          },
          {
            label: 'Report A Bug',
            icon: 'fa fa-bug',
            url: this.issuesLink
          }
        ]
      }
    ];

    this.signedOutNavItems = [
      {
        label: 'Home',
        icon: 'fa fa-home',
        command: (event) => {
          this.home();
        }
      },
      {
        label: 'Account',
        icon: 'fa fa-user-circle',
        items: [{
          label: 'Sign In',
          icon: 'fa fa-user-o',
          command: (event) => {
            this.openLoginWindow();
          }
        },
        {
          label: 'Register',
          icon: 'fa fa-user-plus',
          command: (event) => {
            this.register();
          }
        },
        {
          label: 'Privacy Policy',
          icon: 'fa fa-lock',
          command: (event) => {
            this.privacyPolicy();
          }
        }]
      },
      {
        label: 'News Aggregator',
        icon: 'fa fa-newspaper-o',
        command: (event) => {
          this.allNews();
        }
      },
      {
        label: 'Portfolio',
        expanded: true,
        icon: 'fa fa-bar-chart',
        items: [
          {
            label: 'Portfolio Manager',
            icon: 'fa fa-bar-chart',
            disabled: false,
            command: (event) => {
              this.portfolio();
            }
          },
          {
            label: 'Watchlist',
            icon: 'fa fa-eye',
            disabled: false,
            command: (event) => {
              this.openTrackedAssets();
            }
          },
        ],
      },
      {
        label: 'Help',
        icon: 'pi pi-fw pi-question',
        items: [
          {
            label: 'About',
            icon: 'pi pi-external-link',
            url: this.aboutPageLink
          },
          {
            label: 'Report A Bug',
            icon: 'fa fa-bug',
            url: this.issuesLink
          }
        ]
      }
    ];

    this.signedOutAccountMenuItems = [
      {
        label: 'Home',
        icon: 'fa fa-home',
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.router.navigate(['/', 'home']);
          });
        }
      },
      {
        label: 'Sign In',
        icon: 'fa fa-user-o',
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.sessionService.toggleLoginModal();
          });
        }
      },
      {
        label: 'Register',
        icon: 'fa fa-user-plus',
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.sessionService.toggleRegistrationModal();
          });
        }
      }
    ];

    this.accountMenuItems = [
      {
        label: 'Home',
        icon: 'fa fa-home',
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.router.navigate(['/', 'home']);
          });
        }
      },
      {
        label: 'Portfolio Manager',
        icon: 'fa fa-bar-chart',
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.router.navigate(['/', 'portfolio']);
          });
        }
      },
      {
        label: 'Watchlist',
        icon: 'fa fa-clock-o',
        disabled: false,
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.router.navigate(['/', 'tracking']);
          });
        }
      },
      {
        label: 'Sign Out',
        icon: 'fa fa-signout',
        command: (event) => {
          this.handleAccontMenuState().then(() => {
            this.sessionService.signOutUser();
          });
        }
      }
    ];
  }

  navMenuOpenedChange(event) {
    this.navService.navExpandedSource$.next(this.snav.opened)
  }

  onShowAccountMenu(event) {
    if (this.snav.opened && this.screenSize === Const.SCREEN_SIZE.XS) {
      this.snav.close();
    }
  }

  openTrackedAssets() {
    this.handleNavDrawerState().then(() => {
      this.router.navigate(['/', 'tracking']);
    });

  }

  toggleAccountMenu($event: any) {
    this.accountPanel.toggle($event);
  }

  handleSignOut() {
    this.handleNavDrawerState().then(() => {
      this.sessionService.signOutUser();
    });

  }

  portfolio() {
    this.handleNavDrawerState().then(() => {
      this.router.navigate(['/', 'portfolio']);
    });

  }

  home() {
    this.handleNavDrawerState().then(() => {
      this.router.navigate(['/', 'home']);
    });
  }

  openLoginWindow() {
    this.handleNavDrawerState().then(() => {
      this.sessionService.toggleLoginModal();
    });
  }

  privacyPolicy() {
    this.handleNavDrawerState().then(() => {
      this.router.navigate(['/', 'privacy-policy'])
    });

  }

  register() {
    this.handleNavDrawerState().then(() => {
      this.sessionService.toggleRegistrationModal();
    });

  }

  allNews() {
    this.handleNavDrawerState().then(
      () => {
        this.router.navigate(['/', 'news']);
      })
  }

  toggleSearchpanel() {
    this.searchPanel.hide();
  }

  /* Toast */
  public showToast(toastMessage: ToastMessage) {
    const { key, severity, summary, detail, sticky } = toastMessage;
    this.messageService.add({ key: key, severity: severity, summary: summary, detail: detail, sticky: sticky });

  }
  public closeToast() {
    this.messageService.clear();
  }

  public onPromptToastConfirm(event) {
    this.toastService.messageResultEmitter.next(true);
    this.closeToast();
  }

  public onPromptToastReject(event) {
    this.toastService.messageResultEmitter.next(false);
    this.closeToast();
  }

  /* Main Menu SideNav */
  handleNavDrawerState(): Promise<any> {
    if (this.screenSize === Const.SCREEN_SIZE.XS && this.snav.opened) {
      return this.snav.close();
    }
    return new Promise((resolve, reject) => {
      resolve('');
    });

  }

  /* Account Menu Dropdown */
  handleAccontMenuState(): Promise<any> {
    if (this.accountPanel.overlayVisible) {
      this.accountPanel.hide();
      return new Promise((resolve, reject) => {
        resolve('hidden');
      });
    }

    return new Promise((resolve, reject) => {
      resolve('Already Hidden');
    });

  }

  createAccount(event) {
    this.register();
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

}