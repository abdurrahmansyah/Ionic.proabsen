import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BagianData, GlobalService, JabatanData, JamKerjaData, KaryawanData } from 'src/app/services/global.service';

@Component({
  selector: 'app-jabatan',
  templateUrl: './jabatan.component.html',
  styleUrls: ['./jabatan.component.scss'],
})
export class JabatanComponent implements OnInit {
  public id: string;
  public jabatan: string;
  public bagian: string;
  private jabatanDataParent: any;

  public isAddNew: boolean = false;

  private jabatanDataDoc: AngularFirestoreDocument<JabatanData>;
  bagianDataList: any;

  constructor(private navParams: NavParams,
    private globalService: GlobalService,
    private modalController: ModalController,
    private afs: AngularFirestore,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    var aksi = this.navParams.get('aksi');
    if (aksi == 'tambah') {
      this.isAddNew = true;
      this.firebaseService.bagianDataList.subscribe(res => { this.bagianDataList = res });
    }
    else {
      this.isAddNew = false;
      this.jabatanDataParent = this.navParams.get('data');

      this.id = this.jabatanDataParent.id;
      this.jabatan = this.jabatanDataParent.jabatan;
      this.firebaseService.bagianDataList.subscribe(res => { this.bagianDataList = res; this.bagian = this.jabatanDataParent.bagian });

      this.jabatanDataDoc = this.afs.doc<JabatanData>(`jabatan/${this.id}`);
    }
  }

  public async AddNewData() {
    if (!this.jabatan || !this.bagian) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var jabatanData: JabatanData = { jabatan: this.jabatan, bagian: this.bagian };

      this.firebaseService.jabatanDataList.subscribe(jabatanDataList => {
        var isAnyMatchDataFromExist = jabatanDataList.filter(jabatan => {
          return jabatan.jabatan.toUpperCase() === jabatanData.jabatan.toUpperCase()
        });

        if (!alreadyProcessed) {
          if (isAnyMatchDataFromExist.length > 0) {
            this.globalService.PresentAlert('Data jabatan sudah ada');
            alreadyProcessed = true;
          } else {
            this.firebaseService.jabatanDataListCollection.add(jabatanData);
            alreadyProcessed = true;

            this.modalController.dismiss(
              { dataPassing: "BerhasilCreate" },
              'confirm'
            );
          }
        }
      });
    }
  }

  public async EditData() {
    if (!this.jabatan || !this.bagian) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var jabatanData: JabatanData = { jabatan: this.jabatan, bagian: this.bagian };

      this.firebaseService.jabatanDataList.subscribe(jabatanDataList => {
        var isAnyKeyFromExist = jabatanDataList.filter(x => { return x.jabatan === jabatanData.jabatan });

        if (!alreadyProcessed) {
          if (isAnyKeyFromExist.length > 0 && this.jabatanDataParent.jabatan != jabatanData.jabatan) {
            alreadyProcessed = true;
            this.globalService.PresentAlert('Nama jabatan sudah pernah digunakan');
          } else {
            var isAnyMatchDataFromExist = jabatanDataList.filter(jabatan => {
              return jabatan.jabatan.toUpperCase() === jabatanData.jabatan.toUpperCase() &&
                jabatan.bagian.toUpperCase() === jabatanData.bagian.toUpperCase()
            });
    
            if (!alreadyProcessed) {
              if (isAnyMatchDataFromExist.length > 0) {
                if (this.jabatanDataParent.jabatan.toUpperCase() === jabatanData.jabatan.toUpperCase() &&
                  this.jabatanDataParent.bagian.toUpperCase() === jabatanData.bagian.toUpperCase()) {
                  this.globalService.PresentAlert('Tidak ada perubahan data jabatan');
                } else
                  this.globalService.PresentAlert('Data jabatan sudah ada');
                alreadyProcessed = true;
              } else {
                this.jabatanDataDoc.update(jabatanData);
                alreadyProcessed = true;
    
                this.modalController.dismiss(
                  { dataPassing: "BerhasilEdit" },
                  'confirm'
                );
              }
            }
          }
        }
      });
    }
  }

  public CloseTambahEdit() {
    this.modalController.dismiss(
      { dataPassing: "JUSTCANCEL" },
      'backdrop'
    );
  }
}
