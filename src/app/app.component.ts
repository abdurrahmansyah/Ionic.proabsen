import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { GlobalService, KaryawanData } from './services/global.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public isAdmin: boolean = false;
  public folder: string = "Home";
  public isPageHome: boolean = false;
  public isPageLeaderboard: boolean = false;
  public isPageHistory: boolean = false;
  public isPageProfile: boolean = false;
  public isPageTentang: boolean = false;
  public isPageAdministrator: boolean = false;

  constructor(private authService: AuthService,
    private storage: Storage,
    private globalService: GlobalService,
    private afs: AngularFirestore,
    private router: Router,
    public auth: AngularFireAuth,
    private platform: Platform) {
    this.initializeApp();
    this.auth.user.subscribe(user => {
      if (user !== undefined && user !== null) {
        var karyawanDataListCollectionSpecificEmail = this.afs.collection<KaryawanData>('karyawan', ref => ref.where('email', '==', user.email));
        var karyawanDataListSpecificEmail = karyawanDataListCollectionSpecificEmail.valueChanges({ idField: 'id' });
        karyawanDataListSpecificEmail.subscribe(karyawanDataList => {
          if (karyawanDataList.length > 0) {
            var karyawanData = karyawanDataList.find(x => x);
            if (karyawanData !== undefined) {
              this.isAdmin = karyawanData.isAdmin;
            } else console.log("BUG: Karyawan Data Kosong");
          } else this.isAdmin = false;
        });
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      GoogleAuth.initialize({
        clientId: '723073598683-21fhhrmq3kkq1t6s3trpg6pfsf0bnh5j.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    })
  }

  ngOnInit() {
    setInterval(() => {
      this.folder = this.globalService.page;
      this.isPageHome = this.folder == this.globalService.IndexPageData.Home ? true : false;
      this.isPageLeaderboard = this.folder == this.globalService.IndexPageData.Leaderboard ? true : false;
      this.isPageHistory = this.folder == this.globalService.IndexPageData.History ? true : false;
      this.isPageProfile = this.folder == this.globalService.IndexPageData.Profile ? true : false;
      this.isPageTentang = this.folder == this.globalService.IndexPageData.Tentang ? true : false;
      this.isPageAdministrator = this.folder == this.globalService.IndexPageData.Administrator ? true : false;
    }, 100);
  }

  public ToHome() {
    this.globalService.page = this.globalService.IndexPageData.Home;
  }

  public ToLeaderboard() {
    this.globalService.page = this.globalService.IndexPageData.Leaderboard;
  }

  public ToHistory() {
    this.globalService.page = this.globalService.IndexPageData.History;
  }

  public ToProfile() {
    this.globalService.page = this.globalService.IndexPageData.Profile;
  }

  public ToTentang() {
    this.globalService.page = this.globalService.IndexPageData.Tentang;
  }

  public ToAdministrator() {
    this.globalService.page = this.globalService.IndexPageData.Administrator;
  }

  logout() {
    this.authService.logout();
  }
}
