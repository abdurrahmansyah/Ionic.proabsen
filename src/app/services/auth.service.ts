import { Injectable } from '@angular/core';
//import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Storage } from '@ionic/storage-angular';

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
      console.log(res.user);

      this.router.navigateByUrl('/home/Home', { replaceUrl: true });
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
