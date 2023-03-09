import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BagianData, GlobalService, JamKerjaData, KaryawanData } from 'src/app/services/global.service';

@Component({
  selector: 'app-bagian',
  templateUrl: './bagian.component.html',
  styleUrls: ['./bagian.component.scss'],
})
export class BagianComponent implements OnInit {
  public id: string;
  public bagian: string;
  public jamKerja: string;
  private bagianDataParent: any;

  public isAddNew: boolean = false;

  private bagianDataDoc: AngularFirestoreDocument<BagianData>;
  jamKerjaDataList: any;// = this.firebaseService.jamKerjaDataList;

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
      this.firebaseService.jamKerjaDataList.subscribe(res => { this.jamKerjaDataList = res });
    }
    else {
      this.isAddNew = false;
      this.bagianDataParent = this.navParams.get('data');

      this.id = this.bagianDataParent.id;
      this.bagian = this.bagianDataParent.bagian;
      this.firebaseService.jamKerjaDataList.subscribe(res => { this.jamKerjaDataList = res; this.jamKerja = this.bagianDataParent.jamKerja });

      this.bagianDataDoc = this.afs.doc<BagianData>(`bagian/${this.id}`);
    }
  }

  public async AddNewData() {
    if (!this.bagian || !this.jamKerja) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var bagianData: BagianData = { bagian: this.bagian, jamKerja: this.jamKerja };

      this.firebaseService.bagianDataList.subscribe(bagianDataList => {
        var isAnyMatchDataFromExist = bagianDataList.filter(bagian => {
          return bagian.bagian.toUpperCase() === bagianData.bagian.toUpperCase()
        });

        if (!alreadyProcessed) {
          if (isAnyMatchDataFromExist.length > 0) {
            this.globalService.PresentAlert('Data bagian sudah ada');
            alreadyProcessed = true;
          } else {
            this.firebaseService.bagianDataListCollection.add(bagianData);
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
    if (!this.bagian || !this.jamKerja) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var bagianData: BagianData = { bagian: this.bagian, jamKerja: this.jamKerja };

      this.firebaseService.bagianDataList.subscribe(bagianDataList => {
        var isAnyKeyFromExist = bagianDataList.filter(x => { return x.bagian === bagianData.bagian });

        if (!alreadyProcessed) {
          if (isAnyKeyFromExist.length > 0 && this.bagianDataParent.bagian != bagianData.bagian) {
            alreadyProcessed = true;
            this.globalService.PresentAlert('Nama bagian sudah pernah digunakan');
          } else {
            var isAnyMatchDataFromExist = bagianDataList.filter(bagian => {
              return bagian.bagian.toUpperCase() === bagianData.bagian.toUpperCase() &&
                bagian.jamKerja.toUpperCase() === bagianData.jamKerja.toUpperCase()
            });

            if (!alreadyProcessed) {
              if (isAnyMatchDataFromExist.length > 0) {
                if (this.bagianDataParent.bagian.toUpperCase() === bagianData.bagian.toUpperCase() &&
                  this.bagianDataParent.jamKerja.toUpperCase() === bagianData.jamKerja.toUpperCase()) {
                  this.globalService.PresentAlert('Tidak ada perubahan data bagian');
                } else
                  this.globalService.PresentAlert('Data bagian sudah ada');
                alreadyProcessed = true;
              } else {
                this.bagianDataDoc.update(bagianData);
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
