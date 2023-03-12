import { Injectable } from '@angular/core';
//import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Storage } from '@ionic/storage-angular';
import { getAuth, signInWithRedirect } from "firebase/auth";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userCredential: any;
  confirmationResult: any;

  constructor(
    public auth: AngularFireAuth,
    private router: Router,
    private storage: Storage
  ) { }

  // async createUserWithEmailAndPassword(email: string, password: string) {
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(this._fireAuth, email, password);
  //     this.userCredential = userCredential;

  //     await sendEmailVerification(userCredential.user);

  //     return userCredential;
  //   } catch (e) { throw (e) }
  // }

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(async res => {
      console.log("res", res);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    });
  }

  loginRedirect() {
    this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider()).then(res => {
      this.auth.getRedirectResult().then(data => {
        console.log("data", data);
        this.router.navigateByUrl('/home', { replaceUrl: true });
      });
    });
  }

  async loginWithGoogleAuth() {
    let googleUser = await GoogleAuth.signIn();
    const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
    this.auth.signInAndRetrieveDataWithCredential(credential).then(async res => {
      console.log("res", res);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    });
  }

  logout() {
    this.auth.signOut().then(() => {
      // this.storage.remove('idKaryawan').then(() =>
      this.router.navigateByUrl('/login', { replaceUrl: true })
      // );
    })
  }
}
