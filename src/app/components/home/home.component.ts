import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MenuItem, MessageService, SharedModule } from 'primeng/api';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { SessionService } from 'src/app/services/session.service';
import { LoginComponent } from '../login/login.component';
import { ToastMessage } from 'src/app/models/toast-message';
import { Toast, ToastModule } from 'primeng/toast';
import { ToastService } from 'src/app/services/toast.service';
import firebase from 'firebase/compat/app';
import { RegisterComponent } from '../register/register.component';
import { SearchComponent } from '../search/search.component';
import { NavService } from 'src/app/services/nav.service';
import { concatMap, exhaustMap, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Subject, firstValueFrom, from, timer } from 'rxjs';
import { DashboardService } from '../dashboard/dashboard.service';
import { BasicCoin, GlobalData, GlobalDataView } from 'src/app/models/coin-gecko';
import { ScreenService } from 'src/app/services/screen.service';
import { CONSTANT as Const, EDIT_TRACKED_ITEMS, PROJECT_LINKS, SELECT_ITEM_EVENT, NEW_WATCHLIST_NAME, NEW_PORTFOLIO_NAME } from '../../constants'
import { Observable } from "rxjs"
import { FooterComponent } from '../footer/footer.component';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { InputTextModule } from 'primeng/inputtext';
import { NgIf, AsyncPipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidebarModule } from 'primeng/sidebar';
import { SettingsComponent } from "../settings/settings.component";
import { UserPreferences } from 'src/app/models/appconfig';
import { ThemeService } from 'src/app/services/theme.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UpgradeGuestComponent } from '../upgrade-guest/upgrade-guest.component';
import { UserService } from 'src/app/services/user.service';
import { PortfolioMeta, WatchListMeta } from 'src/app/models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';
import { WatchListService } from '../../services/watchlist.service';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';
import { ListStore } from 'src/app/store/list-store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('showHideSearchBox', [
      state('show', style({
        width: '100%',
        opacity: '1',
      })),
      state('hide', style({
        width: '0px',
        opacity: '0',
      })),
      transition('show => hide', [
        animate('0.5s')
      ]),
      transition('hide => show', [
        animate('0.5s')
      ]),
    ]),
  ],
  providers: [MessageService, DashboardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, NgIf, FormsModule, InputTextModule,
    ReactiveFormsModule, MatSidenavModule, PanelMenuModule, SidebarModule, ButtonModule,
    ToastModule, SharedModule, OverlayPanelModule, SearchComponent, MenuModule, RouterOutlet,
    DialogModule, LoginComponent, RegisterComponent, FooterComponent, AsyncPipe, SettingsComponent,
    CommonModule, UpgradeGuestComponent]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('snav') snav: MatSidenav;
  @ViewChild('accountPanel') accountPanel: OverlayPanel;
  @ViewChild('loginModal') loginModal: LoginComponent;
  @ViewChild('register') registerComp: RegisterComponent;
  @ViewChild('login') loginComp: LoginComponent;
  @ViewChild('upgrade') upgradeComponent: UpgradeGuestComponent;

  @ViewChild('appSearch') searchComponent: SearchComponent;
  @ViewChild('searchInputWrapper') searchInputTarget: ElementRef;
  @ViewChild('settingsComponent') settingsComponent: SettingsComponent;
  @ViewChild('settingsButton', { read: ElementRef, static: false }) settingsButton: ElementRef;
  @ViewChild('searchButton', { read: ElementRef, static: false }) searchButton: ElementRef;


  theme: string;
  screenSize: string;
  navOpened: boolean;
  settingsVisible: boolean;
  searchVisible: boolean;
  isSignedIn: boolean;
  mainLogoSrc: string = '../../../assets/img/pfolie-logo-1-white.png';
  searchField: UntypedFormControl = new UntypedFormControl('');
  searchForm: UntypedFormGroup;
  toast: Toast;
  private user: firebase.User = null;
  private readonly issuesLink = PROJECT_LINKS.ISSUES;
  private readonly aboutPageLink = PROJECT_LINKS.ABOUT;
  private basicPortfolios: PortfolioMeta[] = [];
  private basicWatchlists: WatchListMeta[] = [];
  private filteredCoinsStore: ListStore<BasicCoin> = new ListStore<BasicCoin>([]);

  searchInitialized$ = new Subject<boolean>();
  navbarTitleStart: 'P';
  navbarTitleEnd: string = 'folie';
  isLoading: boolean;
  verified: boolean;
  searchActive: boolean;
  userProfilePictureSource: string = '../../../assets/img/image_filler_icon_blank.jpg';
  signedOutNavItems: MenuItem[];
  signedInNavItems: MenuItem[];
  accountMenuItems: MenuItem[];
  signedOutAccountMenuItems: MenuItem[];
  globalDataSource$: Observable<GlobalData>;
  destroySubject$ = new Subject();
  globalDataView: GlobalDataView = {} as GlobalDataView;
  isGlobalDataLoading: boolean;
  googleIconSrc = '../../../assets/img/google-icon-org.svg';
  userPreferences: UserPreferences = {} as UserPreferences;
  allCoins: BasicCoin[] = [];
  filteredSearchProvider$: Observable<BasicCoin[]> = this.filteredCoinsStore.select();


  constructor(
    private router: Router,
    private navService: NavService,
    public sessionService: SessionService,
    private screenService: ScreenService,
    private portfolioService: PortfolioService,
    private watchlistService: WatchListService,
    private toastService: ToastService,
    private basicCoinInfoStore: BasicCoinInfoStore,
    private themeService: ThemeService,
    private userService: UserService,
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    fb: UntypedFormBuilder,
    private messageService: MessageService) {
    this.searchForm = fb.group({
      searchField: this.searchField
    });

    this.screenService.screenSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      screenSize => {
        this.screenSize = screenSize;
        if (this.screenService.isMobileScreen(screenSize)) {
          this.navOpened = false;
          this.cd.markForCheck();
        } else {
          this.navOpened = this.sessionService.getPreferences().sideNav === 'expand' ? true : false;
          this.cd.markForCheck();
        }
      });

    this.screenService.documentClickedSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      (event: Event) => {
        const menuBtn = document.getElementById('settingMenuButton');
        if (this.settingsComponent && this.settingsComponent.visible) {
          if (this.isEventTargetOutsideSettings(event, menuBtn)) {
            this.settingsVisible = false;
            this.settingsComponent.visible = false;
            this.cd.markForCheck();
          }
        }

        if (this.isEventTargetOutsideSearch(event)) {
          this.searchVisible = false;
          this.cd.markForCheck();
        }
      }
    );

  }


  ngOnInit() {
    this.userPreferences = this.sessionService.getPreferences();
    this.themeService.themeSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      theme => {
        this.theme = theme;
        this.mainLogoSrc = this.theme.includes('dark') ? '../../../assets/img/pfolie-logo-1-white.png' : '../../../assets/img/pfolie-logo-1.png';
        this.cd.markForCheck();
      }
    );

    this.sessionService.getAuth()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        user => {
          this.user = user;
          this.isSignedIn = (user && user !== null && user !== undefined);
          this.userStateChanged(this.isSignedIn, user);
          this.cd.markForCheck();

        });

    this.userService.basicPortfolioSource$.pipe(
      takeUntil(this.destroySubject$))
      .subscribe({
        next: (basicPortfolios) => {
          this.basicPortfolios = basicPortfolios;
          this.cd.markForCheck();
          this.signedInNavItems = this.buildUserNavMenu(this.basicPortfolios, this.basicWatchlists);
          this.cd.markForCheck();

        }
      });


    this.userService.basicWatchlistSource$.pipe(
      takeUntil(this.destroySubject$))
      .subscribe({
        next: (basicWatchLists) => {
          this.basicWatchlists = basicWatchLists;
          this.signedInNavItems = this.buildUserNavMenu(this.basicPortfolios, this.basicWatchlists);
          this.cd.markForCheck();

        }
      });

    this.basicCoinInfoStore.allCoinsStore.select()
      .pipe(takeUntil(this.searchInitialized$))
      .subscribe({
        next: (coins) => {
          if (coins && coins.length > 0) {
            this.allCoins = coins;
            this.filteredCoinsStore.set(this.allCoins);
            this.cd.markForCheck();
            this.searchInitialized$.next(true);
            this.searchInitialized$.complete();
          }

        },
        complete: () => {
          this.searchInitialized$.next(true);
          this.searchInitialized$.complete();
        }
      });

    if (this.screenService.isMobileScreen(this.screenSize)) {
      this.navService.navExpandedSource$.next(false);
    } else {

      this.navService.navExpandedSource$.next(true);
    }

    this.initNavMenus();
    this.isGlobalDataLoading = true;
    timer(0, 60000).pipe(
      concatMap((value) => this.dashboardService.getGlobalDataSource()),
      map((globalData) => {
        return this.dashboardService.getGlobalDataView(globalData);
      }),
      takeUntil(this.destroySubject$)
    ).subscribe(
      {
        next: (globalView) => {
          if (globalView) {
            this.globalDataView = globalView;
            this.isGlobalDataLoading = false;
            this.cd.markForCheck();
          }
        }
      }
    );

    this.screenService.windowScrollSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (event) => {
          if (event) {
            if (this.searchComponent.overlayVisible) {
              this.searchComponent.hide();
              this.searchVisible = false;
            }
            if (this.accountPanel.overlayVisible) {
              this.accountPanel.hide();
            }

            if (this.settingsVisible) {
              this.settingsVisible = false;
            }
          }

        }
      });
  }


  userStateChanged(isSignedIn: boolean, user: firebase.User) {
    if (isSignedIn) {
      this.accountMenuItems = this.buildUserAccountMenu();
      this.signedInNavItems = this.buildUserNavMenu(this.basicPortfolios, this.basicWatchlists);
      if (user.isAnonymous) {
        this.accountMenuItems = this.buildGuestAccountMenu();
        this.signedInNavItems = this.buildGuestNavMenu(this.basicPortfolios, this.basicWatchlists);
        this.userProfilePictureSource = '../../../assets/img/robo-default-avatar-icon.png';
      } else if (user.photoURL) {
        this.userProfilePictureSource = user.photoURL;
      } else {
        this.userProfilePictureSource = '../../../assets/img/image_filler_icon_blank.jpg';
      }
    }
  }

  isEventTargetOutsideSettings(event: Event, menuBtn: HTMLElement) {
    if (this.settingsComponent.el.nativeElement.contains(event.target)) {
      return false;
    }

    if (this.settingsButton && this.settingsButton.nativeElement.contains(event.target)) {
      return false;
    }

    if (menuBtn && menuBtn.contains(event.target as HTMLElement)) {
      return false;
    }

    return true;

  }


  ngAfterViewInit(): void {
    this.dashboardService.eventSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      event => {
        if (event) {
          switch (event.name) {
            case EDIT_TRACKED_ITEMS:
              this.openTrackedAssets();
              break;
            case SELECT_ITEM_EVENT:
              this.navService.navigateTo(event.event.id);
              break;

          }
        }
      });

    this.searchForm.get('searchField').valueChanges.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(word => {
      if (this.searchComponent.overlayHidden) {
        this.searchComponent.show(new Event("change"), this.searchInputTarget.nativeElement);
      }
      this.filter(word);
    });

    this.toastService.messageEmitter.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((toastMessage: ToastMessage) => {
      this.showToast(toastMessage);
    });

    this.searchComponent.onShow.pipe(
      takeUntil(this.destroySubject$),
      switchMap(show => {
        return this.searchComponent.onSelect;
      })
    ).subscribe(
      selected => {
        if (selected) {
          this.searchComponent.hide();
          this.navService.navigateTo(selected);
        }
      });
  }


  navMenuTogglePressed() {
    let prefs = this.sessionService.getPreferences();
    if (this.snav.opened) {
      prefs.sideNav = 'contract';
    } else {
      prefs.sideNav = 'expand';
    }
    this.sessionService.setPreferences(prefs);
    this.snav.toggle();
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

  toggleSearchInput($event: any) {
    this.searchVisible = !this.searchVisible;
  }

  toggleSettings(event) {
    this.handleNavDrawerState().then(() => {
      if (this.settingsVisible) {
        this.settingsVisible = false;
      } else {
        this.settingsVisible = true;
      }
    });
  }


  toggleSearch(event) {
    if (this.searchVisible) {
      this.searchVisible = false;
    } else {
      this.searchVisible = true;
    }
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  addNewPortfolio() {
    from(this.handleNavDrawerState())
      .pipe(
        exhaustMap(() => this.portfolioService.createNewPortfolio(this.user.uid)))
      .subscribe({
        next: (portfolio) => {
          this.portfolioService.setPortfolio(portfolio);
          this.router.navigate(['portfolio']);
        }
      });
  }

  addNewWatchlist() {
    from(this.handleNavDrawerState())
      .pipe(
        exhaustMap(() => this.watchlistService.createNewWatchlist(this.user.uid)))
      .subscribe({
        next: (watchList) => {
          this.watchlistService.setWatchList(watchList);
          this.router.navigate(['watch-list']);
        }
      });
  }

  initNavMenus() {
    this.signedInNavItems = this.sessionService.isGuest ?
      this.buildGuestNavMenu(this.basicPortfolios, this.basicWatchlists) :
      this.buildUserNavMenu(this.basicPortfolios, this.basicWatchlists);
    this.signedOutNavItems = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: (event) => {
          this.home();
        }
      },
      {
        label: 'Account',
        icon: 'pi pi-fw pi-user',
        items: [{
          label: 'Sign In',
          icon: 'pi pi-fw pi-sign-in',
          command: (event) => {
            this.openLoginWindow();
          }
        },
        {
          label: 'Register',
          icon: 'pi pi-fw pi-user-plus',
          command: (event) => {
            this.register();
          }
        },
        {
          label: 'Privacy Policy',
          icon: 'pi pi-fw pi-info-circle',
          command: (event) => {
            this.privacyPolicy();
          }
        }]
      },
      {
        label: 'News Aggregator',
        icon: 'fa-solid fa-newspaper',
        command: (event) => {
          this.allNews();
        }
      },
      {
        label: 'Portfolios',
        expanded: true,
        icon: 'fa-solid fa-bar-chart',
        items: [this.addSignedOutPortfolioMenuItem()],
      },
      {
        label: 'Watchlists',
        expanded: true,
        icon: 'fa-solid fa-eye',
        items: [this.addSignedOutWatchListMenuItem()],
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
            icon: 'fa-solid fa-bug',
            url: this.issuesLink
          }
        ]
      }
    ];

    this.signedOutAccountMenuItems = [
      {
        label: 'Sign In',
        icon: 'pi pi-fw pi-sign-in',
        command: (event) => {
          this.handleAccountMenuState().then(() => {
            this.sessionService.toggleLoginModal();
          });
        }
      },
      {
        label: 'Register',
        icon: 'pi pi-fw pi-user-plus',
        command: (event) => {
          this.handleAccountMenuState().then(() => {
            this.sessionService.toggleRegistrationModal();
          });
        }
      }
    ];

    this.accountMenuItems = this.sessionService.isGuest ? this.buildGuestAccountMenu() : this.buildUserAccountMenu();
  }


  buildUserNavMenu(
    basicPortfolio: PortfolioMeta[],
    basicWatchlists: WatchListMeta[]
  ): MenuItem[] {
    return [
      {
        label: 'Account',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'Sign Out',
            icon: 'pi pi-fw pi-sign-out',
            command: (event) => {
              this.handleSignOut();
            }
          },
          {
            label: 'Privacy Policy',
            icon: 'pi pi-fw pi-info-circle',
            command: (event) => {
              this.privacyPolicy();
            }
          }
        ]
      },
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: (event) => {
          this.home();
        }
      },
      {
        label: 'News Aggregator',
        icon: 'fa-solid fa-newspaper',
        command: (event) => {
          this.allNews();
        }
      },
      {
        label: 'Portfolios',
        expanded: true,
        icon: 'fa-solid fa-bar-chart',
        items: this.buildPortfolioNavItems(basicPortfolio),
      },
      {
        label: 'Watchlists',
        expanded: true,
        icon: 'fa-solid fa-eye',
        items: this.buildWatchListNavItems(basicWatchlists),
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
  }

  addPortfolioMenuItem(disabled: boolean): MenuItem {
    let menuItem: MenuItem =
    {
      label: 'New Portfolio',
      icon: 'fa-solid fa-plus',
      disabled: disabled,
      tooltipOptions: disabled ? { tooltipLabel: 'Max Portfolios Reached', tooltipPosition: 'right' } : { tooltipLabel: 'Create New Portfolio', tooltipPosition: 'right' },
      command: (event) => {
        this.addNewPortfolio();
        this.cd.markForCheck();
      }
    }

    return menuItem;
  }

  addWatchListMenuItem(disabled: boolean): MenuItem {
    let menuItem: MenuItem =
    {
      label: 'New Watchlist',
      icon: 'fa-solid fa-plus',
      tooltipOptions: disabled ? { tooltipLabel: 'Max Watchlists Reached', tooltipPosition: 'right' } : { tooltipLabel: 'Create New Watchlist', tooltipPosition: 'right' },
      disabled: disabled,
      command: (event) => {
        this.addNewWatchlist();
      }
    }

    return menuItem;
  }


  addSignedOutPortfolioMenuItem(): MenuItem {
    let menuItem: MenuItem =
    {
      label: 'New Portfolio',
      icon: 'fa-solid fa-plus',
      disabled: false,
      command: (event) => {
        this.handleNavDrawerState().then(() => {
          this.router.navigate(['portfolio']);
        });
      }
    };

    return menuItem;
  }

  addSignedOutWatchListMenuItem(): MenuItem {
    let menuItem: MenuItem =
    {
      label: 'New Watchlist',
      icon: 'fa-solid fa-plus',
      disabled: false,
      command: (event) => {
        this.handleNavDrawerState().then(() => {
          this.router.navigate(['watch-list']);
        });
      }
    }

    return menuItem;
  }

  buildGuestNavMenu(
    basicPortfolio: PortfolioMeta[],
    basicWatchlists: WatchListMeta[]
  ): MenuItem[] {
    return [
      {
        label: 'Guest Account',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'Upgrade Account',
            icon: 'pi pi-fw pi-arrow-up',
            command: (event) => {
              this.handleNavDrawerState().then(() => {
                this.sessionService.showUpgradeGuestModal = true;
              });
            }
          },
          {
            label: 'Sign Out',
            icon: 'pi pi-fw pi-sign-out',
            command: (event) => {
              this.handleSignOut();
            }
          },
          {
            label: 'Privacy Policy',
            icon: 'pi pi-fw pi-info-circle',
            command: (event) => {
              this.privacyPolicy();
            }
          }
        ]
      },
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: (event) => {
          this.home();
        }
      },
      {
        label: 'News Aggregator',
        icon: 'fa-solid fa-newspaper',
        command: (event) => {
          this.allNews();
        }
      },
      {
        label: 'Portfolios',
        expanded: true,
        icon: 'fa-solid fa-bar-chart',
        items: this.buildPortfolioNavItems(basicPortfolio),
      },
      {
        label: 'Watchlists',
        expanded: true,
        icon: 'fa-solid fa-eye',
        items: this.buildWatchListNavItems(basicWatchlists),
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
  }

  buildGuestAccountMenu(): MenuItem[] {
    return [
      {
        label: 'Guest Account',
        disabled: true
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-fw pi-sign-out',
        command: (event) => {
          this.handleAccountMenuState().then(() => {
            this.sessionService.signOutUser();
          });
        }
      },
      {
        label: 'Upgrade Account',
        icon: 'pi pi-fw pi-arrow-up',
        command: (event) => {
          this.handleAccountMenuState().then(() => {
            this.sessionService.showUpgradeGuestModal = true;
          });
        }
      }
    ];
  }


  buildUserAccountMenu(): MenuItem[] {
    return [
      {
        label: 'Sign Out',
        icon: 'pi pi-fw pi-sign-out',
        command: (event) => {
          this.handleAccountMenuState().then(() => {
            this.sessionService.signOutUser();
          });
        }
      }
    ];
  }



  buildPortfolioNavItems(basicPortfolios: PortfolioMeta[]): MenuItem[] {
    let navItems = []; // reset menu items
    let addDisabled = false;
    if (basicPortfolios.length >= 5) {
      addDisabled = true;
    }
    navItems.push(this.addPortfolioMenuItem(addDisabled));

    for (let i = 0; i < basicPortfolios.length; i++) {
      const portfolio = basicPortfolios[i];
      let item = {} as MenuItem;
      if (portfolio.isMain) {
        item = {
          label: portfolio.portfolioName,
          icon: 'fa-solid fa-pencil',
          badge: 'Main',
          tooltipOptions: { tooltipLabel: `Open: ${portfolio.portfolioName} (Main)`, tooltipPosition: 'right' },
          command: (event) => {
            from(this.handleNavDrawerState())
              .pipe(
                exhaustMap(
                  () => this.portfolioService.loadAndOpen(portfolio)))
              .subscribe({
                next: (portfolio) => {
                  this.portfolioService.setPortfolio(portfolio);
                  this.router.navigate(['portfolio']);
                }
              });
          }
        };
      } else {
        item = {
          label: portfolio.portfolioName,
          icon: 'fa-solid fa-pencil',
          iconStyle: { fontSize: 'small' },
          tooltipOptions: { tooltipLabel: `Open: ${portfolio.portfolioName}`, tooltipPosition: 'right' },
          command: (event) => {
            from(this.handleNavDrawerState())
              .pipe(
                exhaustMap(
                  () => this.portfolioService.loadAndOpen(portfolio)))
              .subscribe({
                next: (portfolio) => {
                  this.portfolioService.setPortfolio(portfolio);
                  this.router.navigate(['portfolio']);
                }
              });
          }
        };

      }

      navItems.push(item);

    }
    return navItems;
  }

  buildWatchListNavItems(lists: WatchListMeta[]): MenuItem[] {
    let navItems = []; // reset menu items
    let addDisabled = false;
    if (lists.length >= 5) {
      addDisabled = true;
    }
    navItems.push(this.addWatchListMenuItem(addDisabled));

    for (let i = 0; i < lists.length; i++) {
      let item = {} as MenuItem;
      const watchList = lists[i];
      if (watchList.isMain) {
        item = {
          label: watchList.watchListName,
          badge: 'Main',
          icon: 'fa-solid fa-pencil',
          tooltipOptions: { tooltipLabel: `Open: ${watchList.watchListName} (Main)`, tooltipPosition: 'right' },
          command: (event) => {
            from(this.handleNavDrawerState())
              .pipe(
                exhaustMap(
                  () => this.watchlistService.loadAndOpen(watchList)))
              .subscribe({
                next: (res) => {
                  this.watchlistService.setWatchList(res);
                  this.router.navigate(['watch-list']);
                }
              });
          }
        };
      } else {
        item = {
          label: watchList.watchListName,
          icon: 'fa-solid fa-pencil',
          iconStyle: { fontSize: 'small' },
          tooltipOptions: { tooltipLabel: `Open: ${watchList.watchListName}`, tooltipPosition: 'right' },
          command: (event) => {
            from(this.handleNavDrawerState())
              .pipe(
                exhaustMap(
                  () => this.watchlistService.loadAndOpen(watchList)))
              .subscribe({
                next: (res) => {
                  this.watchlistService.setWatchList(res);
                  this.router.navigate(['watch-list']);
                }
              });
          }
        };
      }
      navItems.push(item);

    }
    return navItems;
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
      this.router.navigate(['watch-list']);
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
      this.router.navigate(['portfolio']);
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
    this.searchComponent.hide();
  }

  /* Toast */
  public showToast(toastMessage: ToastMessage) {
    const { key, severity, summary, detail, sticky, life } = toastMessage;
    this.messageService.add({ key, severity, summary, detail, sticky, life });

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
    if ((this.screenSize === Const.SCREEN_SIZE.XS && this.snav.opened)
      || (this.sessionService.getPreferences().sideNav === 'contract' && this.snav.opened)) {
      return this.snav.close();
    }
    return new Promise((resolve, reject) => {
      resolve('');
    });

  }

  /* Account Menu Dropdown */
  handleAccountMenuState(): Promise<any> {
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

  filter(word: string) {
    let filterCoins = [];
    if (word && word !== '') {
      filterCoins = this.allCoins.filter(v => {
        return v.name.toLowerCase().startsWith(word.toLowerCase())
      });
    } else {
      filterCoins = this.allCoins;
    }
    this.filteredCoinsStore.set(filterCoins);
  }

  resetFilter() {
    let allCoins = this.basicCoinInfoStore.allCoinsStore.state;
    this.filteredCoinsStore.set(allCoins);

  }

  settingsChanged(userPreferences: UserPreferences) {
    this.userPreferences = userPreferences;
    this.sessionService.setPreferences(this.userPreferences);
    this.userPreferences = this.sessionService.getPreferences();
    this.themeService.setTheme(this.userPreferences.theme);
  }

  createAccount(event) {
    this.register();
  }

  guestSignIn() {
    this.sessionService.signInAnonymously();
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

  private isEventTargetOutsideSearch(event: Event): boolean {
    return this.searchVisible &&
      !this.searchComponent.overlayVisible &&
      this.searchButton.nativeElement &&
      this.searchInputTarget.nativeElement &&
      !this.searchButton.nativeElement.contains(event.target as HTMLElement) &&
      !this.searchInputTarget.nativeElement.contains(event.target as HTMLElement);
  }

}


