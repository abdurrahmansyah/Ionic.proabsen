import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BagianData, GlobalService, JabatanData, JamKerjaData, KantorData, KaryawanData } from 'src/app/services/global.service';

@Component({
  selector: 'app-kantor',
  templateUrl: './kantor.component.html',
  styleUrls: ['./kantor.component.scss'],
})
export class KantorComponent implements OnInit {
  public id: string;
  public kantor: string;
  public alamat: string;
  public longitude: number;
  public latitude: number;
  public radius: number;
  private kantorDataParent: any;

  public isAddNew: boolean = false;

  // private bagianDataListCollection: AngularFirestoreCollection<BagianData>;
  // private jamKerjaDataListCollection: AngularFirestoreCollection<JamKerjaData>;
  private kantorDataDoc: AngularFirestoreDocument<KantorData>;
  // bagianDataList: Observable<BagianData[]>;
  // bagianDataList: Observable<BagianData[]> = this.firebaseService.bagianDataList;
  kantorData: Observable<KantorData | undefined>;

  constructor(private navParams: NavParams,
    private globalService: GlobalService,
    private modalController: ModalController,
    private afs: AngularFirestore,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    var aksi = this.navParams.get('aksi');
    if (aksi == 'tambah')
      this.isAddNew = true;
    else {
      this.isAddNew = false;
      this.kantorDataParent = this.navParams.get('data');

      this.id = this.kantorDataParent.id;
      this.kantor = this.kantorDataParent.kantor;
      this.alamat = this.kantorDataParent.alamat;
      this.longitude = this.kantorDataParent.longitude;
      this.latitude = this.kantorDataParent.latitude;
      this.radius = this.kantorDataParent.radius;
      // this.firebaseService.bagianDataList.subscribe(() => { this.alamat = this.kantorDataParent.bagian });
      // this.jamKerja = this.bagianDataParent.jamKerja;

      this.kantorDataDoc = this.afs.doc<KantorData>(`kantor/${this.id}`);
      this.kantorData = this.kantorDataDoc.valueChanges();
    }
  }

  public async AddNewData() {
    if (!this.kantor || !this.alamat || !this.longitude || !this.latitude || !this.radius) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var kantorData: KantorData = { kantor: this.kantor, alamat: this.alamat, longitude: this.longitude, latitude: this.latitude, radius: this.radius };

      this.firebaseService.kantorDataList.subscribe(kantorDataList => {
        var isAnyMatchDataFromExist = kantorDataList.filter(kantor => {
          return kantor.kantor.toUpperCase() === kantorData.kantor.toUpperCase();
        });

        if (!alreadyProcessed) {
          if (isAnyMatchDataFromExist.length > 0) {
            this.globalService.PresentAlert('Data kantor sudah ada');
            alreadyProcessed = true;
          } else {
            this.firebaseService.kantorDataListCollection.add(kantorData);
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
    if (!this.kantor || !this.alamat || !this.longitude || !this.latitude || !this.radius) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var kantorData: KantorData = { kantor: this.kantor, alamat: this.alamat, longitude: this.longitude, latitude: this.latitude, radius: this.radius };

      this.firebaseService.kantorDataList.subscribe(kantorDataList => {
        var isAnyKeyFromExist = kantorDataList.filter(x => { return x.kantor === kantorData.kantor });

        if (!alreadyProcessed) {
          if (isAnyKeyFromExist.length > 0 && this.kantorDataParent.kantor != kantorData.kantor) {
            alreadyProcessed = true;
            this.globalService.PresentAlert('Nama kantor sudah pernah digunakan');
          } else {
            var isAnyMatchDataFromExist = kantorDataList.filter(kantor => {
              return kantor.kantor.toUpperCase() === kantorData.kantor.toUpperCase() &&
                kantor.alamat.toUpperCase() === kantorData.alamat.toUpperCase() &&
                kantor.longitude === kantorData.longitude &&
                kantor.latitude === kantorData.latitude &&
                kantor.radius === kantorData.radius;
            });

            if (!alreadyProcessed) {
              if (isAnyMatchDataFromExist.length > 0) {
                if (this.kantorDataParent.kantor.toUpperCase() === kantorData.kantor.toUpperCase() &&
                  this.kantorDataParent.alamat.toUpperCase() === kantorData.alamat.toUpperCase() &&
                  this.kantorDataParent.longitude === kantorData.longitude &&
                  this.kantorDataParent.latitude === kantorData.latitude &&
                  this.kantorDataParent.radius === kantorData.radius) {
                  this.globalService.PresentAlert('Tidak ada perubahan data kantor');
                } else
                  this.globalService.PresentAlert('Data kantor sudah ada');
                alreadyProcessed = true;
              } else {
                this.kantorDataDoc.update(kantorData);
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
