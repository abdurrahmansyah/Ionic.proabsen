import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { GlobalService, KaryawanData } from './services/global.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public isAdmin: boolean = false;

  constructor(private authService: AuthService,
    private storage: Storage,
    private globalService: GlobalService,
    private afs: AngularFirestore,
    public auth: AngularFireAuth) {
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

  async ngOnInit() {
  }

  logout() {
    this.authService.logout();
  }
}
