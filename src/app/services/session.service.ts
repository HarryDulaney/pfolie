import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, firstValueFrom, map } from 'rxjs';
import { ToastService } from './toast.service';
import { SIGN_IN_PERSISTENCE_LEVEL } from '../constants';
import { UserService } from './user.service';
import { WatchListService } from './watchlist.service';
import { UserPreferences } from '../models/appconfig';
import { BasicCoinInfoStore } from '../store/global/basic-coins.store';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { BasicCoin } from '../models/coin-gecko';
import { PortfolioService } from './portfolio.service';


@Injectable()
export class SessionService {
    private preferences: UserPreferences = {} as UserPreferences;
    public static isAuthenticated: boolean = false;
    public static isGuestLogin = false;
    private user: firebase.User = null;
    public showLoginModal = false;
    private redirectUrlFragment = null;
    public showRegisterModal = false;
    public initialized: boolean = false;
    /* User tried to watch an item while signed out,
   cache the Id and add to users watchlist after sign in successful */
    private watchItemId = null;
    public showUpgradeGuestModal = false;


    constructor(
        private auth: AngularFireAuth,
        private router: Router,
        private toastService: ToastService,
        private watchListService: WatchListService,
        private userService: UserService,
        private basicCoinInfoStore: BasicCoinInfoStore,
        private apiService: ApiService,
        private cache: CacheService
    ) {
    }

    init(): Promise<void> {
        return this.auth.setPersistence(SIGN_IN_PERSISTENCE_LEVEL).then(
            () => {
                this.auth.user.subscribe((user) => {
                    if (user) {
                        SessionService.isAuthenticated = true;
                        this.initialized = true;
                        this.user = user;
                        if (this.user.isAnonymous) {
                            SessionService.isGuestLogin = true;
                        } else {
                            SessionService.isGuestLogin = false;
                        }

                        this.userService.initialize(this.user);
                    } else {
                        user = null;
                        SessionService.isGuestLogin = false;
                        this.userService.reset();
                        SessionService.isAuthenticated = false;
                    }
                });
            });
    }


    preload(): Promise<void> {
        this.preferences = Object.assign(this.preferences, this.cache.getUserPreferences());
        return Promise.all(
            [
                this.init(),
                firstValueFrom(this.apiService.getListCoins())
            ]
        ).then(
            ([r1, r2]) => {
                let baseCoins: BasicCoin[] = r2;
                let filteredCoins = [];
                filteredCoins.push(...baseCoins);
                this.basicCoinInfoStore.allCoinsStore.set(baseCoins);

            });
    }

    getPreferences(): UserPreferences {
        return this.cache.getUserPreferences();
    }

    setPreferences(preferences: UserPreferences) {
        this.cache.setUserPreferences(preferences);
        this.preferences = this.cache.getUserPreferences();
    }


    getGlobalStore(): BasicCoinInfoStore {
        return this.basicCoinInfoStore;
    }



    public get authenticated(): boolean {
        return SessionService.isAuthenticated;
    }


    public get isGuest(): boolean {
        return SessionService.isGuestLogin;
    }

    getCurrentUser(): firebase.User {
        return this.user;
    }

    getAuth(): Observable<firebase.User> {
        return this.auth.user;
    }

    public toggleRegistrationModal() {
        if (this.showLoginModal) {
            this.showLoginModal = !this.showLoginModal;
        }

        this.showRegisterModal = true;
    }

    public toggleLoginModal() {
        if (this.showRegisterModal) {
            this.showRegisterModal = !this.showRegisterModal;
        }
        this.showLoginModal = true;
    }

    private signIn(userCredentials: firebase.auth.UserCredential) {
        const firebaseUser = userCredentials.user;
        if (firebaseUser.uid) {
            this.user = firebaseUser;
            SessionService.isAuthenticated = true;
            if (this.user.isAnonymous) {
                SessionService.isGuestLogin = true;
            } else {
                SessionService.isGuestLogin = false;
            }
            this.toastService.showLoginSuccess();
            this.showLoginModal = false;
            if (this.redirectUrlFragment !== null) {
                this.router.navigate([this.redirectUrlFragment]).finally(() => {
                    this.redirectUrlFragment = null;
                });

            } else if (this.watchItemId !== null) {
                this.watchListService.addTracked(this.watchItemId);
                this.watchItemId = null;
            } else {
                this.router.navigate(['/home']);
            }
        }
    }

    private upgradeGuest(userCredentials: firebase.auth.UserCredential) {
        const firebaseUser = userCredentials.user;
        if (firebaseUser.uid) {
            this.user = firebaseUser;
            SessionService.isAuthenticated = true;
            if (this.user.isAnonymous) {
                SessionService.isGuestLogin = true;
            } else {
                SessionService.isGuestLogin = false;
            }
            this.toastService.showUpgradeSuccess();
            this.showUpgradeGuestModal = false;
        }
    }

    public signOutUser() {
        this.auth.signOut().then(res => {
            this.user = null;
            SessionService.isAuthenticated = false;
            SessionService.isGuestLogin = false;
            this.router.navigate(['/', 'home']);
            this.toastService.showSuccessToast('Sign Out Success. Thank you for using Pfolie!');
        });
    }


    signInExistingUser(email: string, password: string): void {
        this.auth.signInWithEmailAndPassword(email, password).then(
            userCredentials => {
                this.signIn(userCredentials);
            })
            .catch((error) => {
                this.toastService.showErrorToast("Login Attempt Failed. Error: " + error);
            });


    }

    signInWithGithub() {
        let provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('user:email');
        this.auth.signInWithPopup(provider).then(
            userCredentials => {
                this.signIn(userCredentials);
            })
            .catch((error) => {
                this.toastService.showErrorToast("Login Attempt Failed. Error: " + error);

            });
    }

    signInWithFacebook() {
        this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(
            userCredentials => {
                this.signIn(userCredentials);
            })
            .catch((error) => {
                this.toastService.showErrorToast("Login Attempt Failed. Error: " + error);

            });
    }

    signInWithGoogle() {
        this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(
            userCredentials => {
                this.signIn(userCredentials);
            })
            .catch((error) => {
                this.toastService.showErrorToast("Login Attempt Failed. Error: " + error);

            });

    }

    signInAnonymously() {
        return this.auth.signInAnonymously().then(
            userCredentials => {
                this.signIn(userCredentials);
            }
        ).catch((error) => {
            this.toastService.showErrorToast("Login Attempt Failed. Error: " + error);
        }
        );
    }


    registerNewUser(email: any, password: any) {
        this.auth.createUserWithEmailAndPassword(email, password).then(value => {
            this.toastService.showSuccessToast('Create Account Success! Now sign in to your new account!');
            this.showRegisterModal = false;
            this.showLoginModal = true;
        },
            (reason) => {
                this.toastService.showErrorToast('Registeration Error...' + reason);
            }
        );

    }

    verifyUserEmail() {

    }

    upgradeWithEmail(email: any, password: any) {
        this.user.linkWithCredential(firebase.auth.EmailAuthProvider.credential(email, password))
            .then(
                userCredentials => {
                    this.upgradeGuest(userCredentials);
                }
            ).catch((error) => {
                this.toastService.showErrorToast("Upgrade Attempt Failed. Error: " + error);
            });

    }

    upgradeWithGithub() {
        let provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('user:email');
        this.user.linkWithPopup(provider).then(
            userCredentials => {
                this.upgradeGuest(userCredentials);
            }
        ).catch((error) => {
            this.toastService.showErrorToast("Upgrade Attempt Failed. Error: " + error);

        });
    }

    upgradeWithFacebook() {
        this.user.linkWithPopup(new firebase.auth.FacebookAuthProvider()).then(
            userCredentials => {
                this.upgradeGuest(userCredentials);
            }
        ).catch((error) => {
            this.toastService.showErrorToast("Upgrade Attempt Failed. Error: " + error);

        });

    }

    upgradeWithGoogle() {
        this.user.linkWithPopup(new firebase.auth.GoogleAuthProvider()).then(
            userCredentials => {
                this.upgradeGuest(userCredentials);
            })
            .catch((error) => {
                this.toastService.showErrorToast("Upgrade Attempt Failed. Error: " + error);

            });

    }

    isEmailVerified(): boolean {
        if (SessionService.isAuthenticated) {
            return this.user.emailVerified;
        }
        return false;
    }

    performPasswordReset(email: string) {
        this.auth.sendPasswordResetEmail(email).then(r => {
            this.toastService.showSuccessToast('Please follow the reset link we just sent to your email address');
        });
    }


    /**
     * Redirect to Login Modal and continue navigation on successful login.
     * @param redirect to true will open portfolio after sign in  
     */
    public displayLoginModal(fragment?: string, watchItemId?: string) {
        if (fragment) {
            this.redirectUrlFragment = fragment;
        }

        if (watchItemId) {
            this.watchItemId = watchItemId;
        }

        this.toastService.showLoginToast('Please sign in to perform that action.');
        this.showLoginModal = true;
    }

    public getUser(): Observable<firebase.User> {
        return this.auth.user;
    }


    public isLoggedIn(route: ActivatedRouteSnapshot): Observable<boolean> {
        return this.getUser()
            .pipe(
                map((user) => {
                    if (user === null) {
                        let fragment = route.url[0]['path'];
                        this.displayLoginModal(fragment);
                        this.router.navigate(['/home']);
                        return false;
                    }

                    return (user !== null && user !== undefined);
                })
            );
    }

    public getCurrentUserId(): string {
        if (this.user) {
            return this.user.uid;
        }
        return null;
    }
}

