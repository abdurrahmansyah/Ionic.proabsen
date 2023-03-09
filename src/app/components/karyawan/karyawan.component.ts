import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BagianData, GlobalService, JabatanData, JamKerjaData, KaryawanData } from 'src/app/services/global.service';

@Component({
  selector: 'app-karyawan',
  templateUrl: './karyawan.component.html',
  styleUrls: ['./karyawan.component.scss'],
})
export class KaryawanComponent implements OnInit {

  public id: string;
  public idKaryawan: string;
  public namaKaryawan: string;
  public bagian: string;
  public jabatan: string;
  public jamKerja: string;
  public isAdmin: boolean = false;
  private karyawanDataParent: any;

  public isAddNew: boolean = false;

  private karyawanDataDoc: AngularFirestoreDocument<KaryawanData>;
  jabatanDataList: any;// = this.firebaseService.jabatanDataList;
  bagianDataList: any;// = this.firebaseService.bagianDataList;
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

      this.firebaseService.jabatanDataList.subscribe(res => { this.jabatanDataList = res });
      this.firebaseService.bagianDataList.subscribe(res => { this.bagianDataList = res });
      this.firebaseService.jamKerjaDataList.subscribe(res => { this.jamKerjaDataList = res });
    }
    else {
      this.isAddNew = false;
      this.karyawanDataParent = this.navParams.get('data');

      this.id = this.karyawanDataParent.id;
      this.idKaryawan = this.karyawanDataParent.idKaryawan;
      this.namaKaryawan = this.karyawanDataParent.namaKaryawan;
      this.isAdmin = this.karyawanDataParent.isAdmin;
      this.firebaseService.jabatanDataList.subscribe(res => { this.jabatanDataList = res; this.jabatan = this.karyawanDataParent.jabatan });
      this.firebaseService.bagianDataList.subscribe(res => { this.bagianDataList = res; this.bagian = this.karyawanDataParent.bagian });
      this.firebaseService.jamKerjaDataList.subscribe(res => { this.jamKerjaDataList = res; this.jamKerja = this.karyawanDataParent.jamKerja });

      this.karyawanDataDoc = this.afs.doc<KaryawanData>(`karyawan/${this.id}`);
    }
  }

  public handleChangeJabatan(e: any) {
    this.firebaseService.jabatanDataList.subscribe(jabatanDataList => {
      const jabatanData = jabatanDataList.find(jabatanData => {
        return jabatanData.jabatan.toUpperCase() === e.detail.value.toUpperCase();
      });

      if (jabatanData !== undefined) {
        this.bagian = jabatanData.bagian;

        this.firebaseService.bagianDataList.subscribe(bagianDataList => {
          const bagianData = bagianDataList.find(bagianData => {
            return bagianData.bagian.toUpperCase() === jabatanData.bagian.toUpperCase();
          });

          if (bagianData !== undefined) {
            this.jamKerja = bagianData.jamKerja;
          }
        });
      }
    });
  }

  public async AddNewData() {
    if (!this.idKaryawan || !this.namaKaryawan || !this.bagian || !this.jabatan || !this.jamKerja) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var karyawanData: KaryawanData = { idKaryawan: this.idKaryawan, namaKaryawan: this.namaKaryawan, bagian: this.bagian, jabatan: this.jabatan, jamKerja: this.jamKerja, isAdmin: this.isAdmin, email: '', displayNameEmail: '', photoURL: '' };

      this.firebaseService.karyawanDataList.subscribe(karyawanDataList => {
        var isAnyMatchDataFromExist = karyawanDataList.filter(karyawan => {
          return karyawan.idKaryawan.toUpperCase() === karyawanData.idKaryawan.toUpperCase();
        });

        if (!alreadyProcessed) {
          if (isAnyMatchDataFromExist.length > 0) {
            this.globalService.PresentAlert('Data karyawan dengan ID tersebut sudah ada');
            alreadyProcessed = true;
          } else {
            // this.firebaseService.karyawanDataListCollection.add(karyawanData);
            this.firebaseService.karyawanDataListCollection.doc(karyawanData.idKaryawan).set(karyawanData);

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
    if (!this.idKaryawan || !this.namaKaryawan || !this.bagian || !this.jabatan || !this.jamKerja) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var alreadyProcessed = false;
      var karyawanData: KaryawanData = {
        idKaryawan: this.idKaryawan, namaKaryawan: this.namaKaryawan, bagian: this.bagian, jabatan: this.jabatan, jamKerja: this.jamKerja, isAdmin: this.isAdmin,
        email: this.karyawanDataParent.email, displayNameEmail: this.karyawanDataParent.displayNameEmail, photoURL: this.karyawanDataParent.photoURL
      };

      this.firebaseService.karyawanDataList.subscribe(karyawanDataList => {
        var isAnyMatchDataFromExist = karyawanDataList.filter(karyawan => {
          return karyawan.idKaryawan.toUpperCase() === karyawanData.idKaryawan.toUpperCase() &&
            karyawan.namaKaryawan.toUpperCase() === karyawanData.namaKaryawan.toUpperCase() &&
            karyawan.bagian.toUpperCase() === karyawanData.bagian.toUpperCase() &&
            karyawan.jabatan.toUpperCase() === karyawanData.jabatan.toUpperCase() &&
            karyawan.jamKerja.toUpperCase() === karyawanData.jamKerja.toUpperCase() &&
            karyawan.isAdmin === karyawanData.isAdmin
        });

        if (!alreadyProcessed) {
          if (isAnyMatchDataFromExist.length > 0) {
            if (this.karyawanDataParent.idKaryawan.toUpperCase() === karyawanData.idKaryawan.toUpperCase() &&
              this.karyawanDataParent.namaKaryawan.toUpperCase() === karyawanData.namaKaryawan.toUpperCase() &&
              this.karyawanDataParent.bagian.toUpperCase() === karyawanData.bagian.toUpperCase() &&
              this.karyawanDataParent.jabatan.toUpperCase() === karyawanData.jabatan.toUpperCase() &&
              this.karyawanDataParent.jamKerja.toUpperCase() === karyawanData.jamKerja.toUpperCase() &&
              this.karyawanDataParent.isAdmin === karyawanData.isAdmin) {
              this.globalService.PresentAlert('Tidak ada perubahan data karyawan');
            } else
              this.globalService.PresentAlert('Data karyawan sudah ada');
            alreadyProcessed = true;
          } else {
            this.karyawanDataDoc.update(karyawanData);
            alreadyProcessed = true;

            this.modalController.dismiss(
              { dataPassing: "BerhasilEdit" },
              'confirm'
            );
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
