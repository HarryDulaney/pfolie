import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, map, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { PortfolioService } from '../components/portfolio/services/portfolio.service';
import { SIGN_IN_PERSISTENCE_LEVEL } from '../constants';


@Injectable({
    providedIn: 'root'
})
export class SessionService {
    public static isAuthenticated: boolean = false;
    private user: firebase.User = null;
    public showLoginModal = false;
    private redirectUrlFragment = null;
    public showRegisterModal = false;
    public initialized: boolean = false;


    constructor(
        private auth: AngularFireAuth,
        private router: Router,
        private toastService: ToastService,
        private portfolioService: PortfolioService
    ) {
        this.init();
    }

    init(): void {
        this.auth.setPersistence(SIGN_IN_PERSISTENCE_LEVEL).then(
            () => {
                this.auth.user.subscribe((user) => {
                    if (user) {
                        this.user = user;
                        this.portfolioService.handleStartPortfolioSession(this.user);
                        SessionService.isAuthenticated = true;
                        this.initialized = true;
                    } else {
                        user = null;
                        this.initialized = false;
                        SessionService.isAuthenticated = false;
                    }
                });
            });
    }


    public get authenticated(): boolean {
        return SessionService.isAuthenticated;
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
            this.toastService.showLoginSuccess();
            this.showLoginModal = false;
            if (this.redirectUrlFragment !== null) {
                this.router.navigate(['/', this.redirectUrlFragment]).finally(() => {
                    this.redirectUrlFragment = null;
                });

            } else {
                this.router.navigate(['/home']);
            }
        }
    }

    public signOutUser() {
        this.auth.signOut().then(res => {
            this.user = null;
            SessionService.isAuthenticated = false;
            this.portfolioService.endSession();
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
        this.auth.signInAnonymously().then(
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
    public displayLoginModal(fragment?: string) {
        if (fragment) {
            this.redirectUrlFragment = fragment;
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

