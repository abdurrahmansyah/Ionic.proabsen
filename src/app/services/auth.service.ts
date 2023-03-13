import { Injectable } from '@angular/core';
//import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Storage } from '@ionic/storage-angular';
import { getAuth, signInWithRedirect } from "firebase/auth";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GlobalService } from './global.service';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userCredential: any;
  confirmationResult: any;

  constructor(
    public auth: AngularFireAuth,
    private router: Router,
    private globalService: GlobalService,
    private loadingCtrl: LoadingController
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
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'circles',
    });

    await GoogleAuth.signIn().then(async res => {
      loading.present();
      const credential = firebase.auth.GoogleAuthProvider.credential(res.authentication.idToken);
      await this.auth.signInAndRetrieveDataWithCredential(credential).then(async res => {
        loading.dismiss();
        this.router.navigateByUrl('/home', { replaceUrl: true });
      });
    }).catch(er => {
      loading.dismiss();
      this.globalService.PresentAlert("error signIn: " + JSON.stringify(er));
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
