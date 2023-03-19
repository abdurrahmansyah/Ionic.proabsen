import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ModalController, NavParams } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AbsenData, BagianData, GlobalService } from 'src/app/services/global.service';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-absen',
  templateUrl: './absen.component.html',
  styleUrls: ['./absen.component.scss'],
})
export class AbsenComponent implements OnInit {
  public id: string;
  public kehadiran: string;
  public keterangan: string;
  public lampiran: string;
  public isAddNew: boolean = false;

  public photo: any;

  constructor(private navParams: NavParams,
    private globalService: GlobalService,
    private modalController: ModalController,
    private afs: AngularFirestore,
    private firebaseService: FirebaseService,
    private photoService: PhotoService
  ) { }

  ngOnInit() {
    var aksi = this.navParams.get('aksi');
    if (aksi == 'tambah') {
      this.isAddNew = true;
    }
    else {
      this.isAddNew = false;
    }
  }

  public async TakeAPhoto() {
    const image = await this.photoService.ChooseFromGallery();
    this.lampiran = image.base64String ? image.base64String : '';
    this.photo = this.photoService.ConvertPhotoBase64ToImage(image.base64String);
  }

  public async AddNewData() {
    if (!this.kehadiran || !this.keterangan || !this.lampiran) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
      var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      var tanggal = year + '-' + month + '-' + day;
      // tanggal = "2023-03-16";
      var tanggal2 = year.toString() + month.toString() + day.toString();
      var bulan = month.toString() + '/' + year.toString();
      var timeAbsen = formatDate(date, 'HH:mm', 'en-US');
      // timeAbsen = "08:29";

      var absenData: AbsenData = {
        idKaryawan: this.globalService.karyawanData.idKaryawan,
        tanggal: tanggal,
        bulan: bulan,
        kehadiran: this.kehadiran,
        absen1: '',
        absen2: '',
        absen3: '',
        absen4: '',
        lokasi1: '',
        lokasi2: '',
        lokasi3: '',
        lokasi4: '',
        ket: this.keterangan,
        lampiran: this.lampiran
      }
      console.log("absenData", absenData);
      this.firebaseService.absenDataListCollection.add(absenData);
      this.modalController.dismiss(
        { dataPassing: "BerhasilCreate" },
        'confirm'
      );
    }
  }

  public CloseTambahEdit() {
    this.modalController.dismiss(
      { dataPassing: "JUSTCANCEL" },
      'backdrop'
    );
  }
}
