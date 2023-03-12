import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

export interface Item { name: string; }

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    private authService: AuthService,
    public auth: AngularFireAuth,
    private afs: AngularFirestore
  ) { }

  ngOnInit() {
  }

  login() {
    this.authService.loginWithGoogleAuth();
    // this.authService.loginRedirect();
    // this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
