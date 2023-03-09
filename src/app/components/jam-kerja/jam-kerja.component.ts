import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { IonDatetime, ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BagianData, GlobalService, JamKerjaData, KaryawanData } from 'src/app/services/global.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-jam-kerja',
  templateUrl: './jam-kerja.component.html',
  styleUrls: ['./jam-kerja.component.scss'],
})
export class JamKerjaComponent implements OnInit {
  public id: string;
  public jamKerja: string;
  public absenDatangStart: string = '2000-01-01T00:00:00';
  public absenDatangEnd: string = '2000-01-01T00:00:00';
  public absenSiang1Start: string = '2000-01-01T00:00:00';
  public absenSiang1End: string = '2000-01-01T00:00:00';
  public absenSiang2Start: string = '2000-01-01T00:00:00';
  public absenSiang2End: string = '2000-01-01T00:00:00';
  public absenPulangStart: string = '2000-01-01T00:00:00';
  public absenPulangEnd: string = '2000-01-01T00:00:00';
  private jamKerjaDataParent: any = '2000-01-01T00:00:00';

  public isAddNew: boolean = false;

  private jamKerjaDataDoc: AngularFirestoreDocument<JamKerjaData>;

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

      // this.firebaseService.jamKerjaDataList.subscribe(res => { this.jamKerjaDataList = res });
    }
    else {
      this.isAddNew = false;
      this.jamKerjaDataParent = this.navParams.get('data');

      this.id = this.jamKerjaDataParent.id;
      this.jamKerja = this.jamKerjaDataParent.jamKerja;
      this.absenDatangStart = '2000-01-01T' + this.jamKerjaDataParent.absenDatangStart + ':00+07:00';
      this.absenDatangEnd = '2000-01-01T' + this.jamKerjaDataParent.absenDatangEnd + ':00+07:00';
      this.absenSiang1Start = '2000-01-01T' + this.jamKerjaDataParent.absenSiang1Start + ':00+07:00';
      this.absenSiang1End = '2000-01-01T' + this.jamKerjaDataParent.absenSiang1End + ':00+07:00';
      this.absenSiang2Start = '2000-01-01T' + this.jamKerjaDataParent.absenSiang2Start + ':00+07:00';
      this.absenSiang2End = '2000-01-01T' + this.jamKerjaDataParent.absenSiang2End + ':00+07:00';
      this.absenPulangStart = '2000-01-01T' + this.jamKerjaDataParent.absenPulangStart + ':00+07:00';
      this.absenPulangEnd = '2000-01-01T' + this.jamKerjaDataParent.absenPulangEnd + ':00+07:00';

      // this.firebaseService.jamKerjaDataList.subscribe(res => { this.jamKerjaDataList = res; this.jamKerja = this.bagianDataParent.jamKerja });

      this.jamKerjaDataDoc = this.afs.doc<JamKerjaData>(`jamKerja/${this.id}`);
    }
  }

  public async AddNewData() {
    var absenDatangStart = formatDate(this.absenDatangStart, 'HH:mm', 'en-US');
    var absenDatangEnd = formatDate(this.absenDatangEnd, 'HH:mm', 'en-US');
    var absenSiang1Start = formatDate(this.absenSiang1Start, 'HH:mm', 'en-US');
    var absenSiang1End = formatDate(this.absenSiang1End, 'HH:mm', 'en-US');
    var absenSiang2Start = formatDate(this.absenSiang2Start, 'HH:mm', 'en-US');
    var absenSiang2End = formatDate(this.absenSiang2End, 'HH:mm', 'en-US');
    var absenPulangStart = formatDate(this.absenPulangStart, 'HH:mm', 'en-US');
    var absenPulangEnd = formatDate(this.absenPulangEnd, 'HH:mm', 'en-US');

    if (!this.jamKerja) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else if (absenDatangStart > absenDatangEnd) {
      this.globalService.PresentAlert('Start absen datang tidak boleh lebih besar dari batas waktu absen');
    } else if (absenSiang1Start > absenSiang1End) {
      this.globalService.PresentAlert('Start absen siang pertama tidak boleh lebih besar dari batas waktu absen');
    } else if (absenSiang2Start > absenSiang2End) {
      this.globalService.PresentAlert('Start absen siang kedua tidak boleh lebih besar dari batas waktu absen');
    } else if (absenPulangStart > absenPulangEnd) {
      this.globalService.PresentAlert('Start absen pulang tidak boleh lebih besar dari batas waktu absen');
    }
    else {
      var alreadyProcessed = false;
      var jamKerjaData: JamKerjaData = {
        jamKerja: this.jamKerja, absenDatangStart: absenDatangStart, absenDatangEnd: absenDatangEnd,
        absenSiang1Start: absenSiang1Start, absenSiang1End: absenSiang1End, absenSiang2Start: absenSiang2Start, absenSiang2End: absenSiang2End,
        absenPulangStart: absenPulangStart, absenPulangEnd: absenPulangEnd
      };

      this.firebaseService.jamKerjaDataList.subscribe(jamKerjaDataList => {
        var isAnyMatchDataFromExist = jamKerjaDataList.filter(jamKerja => {
          return jamKerja.jamKerja.toUpperCase() === jamKerjaData.jamKerja.toUpperCase()
        });

        if (!alreadyProcessed) {
          if (isAnyMatchDataFromExist.length > 0) {
            this.globalService.PresentAlert('Data jam kerja sudah ada');
            alreadyProcessed = true;
          } else {
            this.firebaseService.jamKerjaDataListCollection.add(jamKerjaData);
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
    var absenDatangStart = formatDate(this.absenDatangStart, 'HH:mm', 'en-US');
    var absenDatangEnd = formatDate(this.absenDatangEnd, 'HH:mm', 'en-US');
    var absenSiang1Start = formatDate(this.absenSiang1Start, 'HH:mm', 'en-US');
    var absenSiang1End = formatDate(this.absenSiang1End, 'HH:mm', 'en-US');
    var absenSiang2Start = formatDate(this.absenSiang2Start, 'HH:mm', 'en-US');
    var absenSiang2End = formatDate(this.absenSiang2End, 'HH:mm', 'en-US');
    var absenPulangStart = formatDate(this.absenPulangStart, 'HH:mm', 'en-US');
    var absenPulangEnd = formatDate(this.absenPulangEnd, 'HH:mm', 'en-US');

    if (!this.jamKerja) {
      this.globalService.PresentAlert('Silahkan lengkapi data isian terlebih dahulu');
    } else if (absenDatangStart > absenDatangEnd) {
      this.globalService.PresentAlert('Start absen datang tidak boleh lebih besar dari batas waktu absen');
    } else if (absenSiang1Start > absenSiang1End) {
      this.globalService.PresentAlert('Start absen siang pertama tidak boleh lebih besar dari batas waktu absen');
    } else if (absenSiang2Start > absenSiang2End) {
      this.globalService.PresentAlert('Start absen siang kedua tidak boleh lebih besar dari batas waktu absen');
    } else if (absenPulangStart > absenPulangEnd) {
      this.globalService.PresentAlert('Start absen pulang tidak boleh lebih besar dari batas waktu absen');
    } else {
      var alreadyProcessed = false;
      var jamKerjaData: JamKerjaData = {
        jamKerja: this.jamKerja, absenDatangStart: absenDatangStart, absenDatangEnd: absenDatangEnd,
        absenSiang1Start: absenSiang1Start, absenSiang1End: absenSiang1End, absenSiang2Start: absenSiang2Start, absenSiang2End: absenSiang2End,
        absenPulangStart: absenPulangStart, absenPulangEnd: absenPulangEnd
      };

      this.firebaseService.jamKerjaDataList.subscribe(jamKerjaDataList => {
        var isAnyKeyFromExist = jamKerjaDataList.filter(x => { return x.jamKerja === jamKerjaData.jamKerja });

        if (!alreadyProcessed) {
          if (isAnyKeyFromExist.length > 0 && this.jamKerjaDataParent.jamKerja != jamKerjaData.jamKerja) {
            alreadyProcessed = true;
            this.globalService.PresentAlert('Nama Jam Kerja sudah pernah digunakan');
          } else {
            var isAnyMatchDataFromExist = jamKerjaDataList.filter(jamKerja => {
              return jamKerja.jamKerja.toUpperCase() === jamKerjaData.jamKerja.toUpperCase() &&
                jamKerja.absenDatangStart.toUpperCase() === jamKerjaData.absenDatangStart.toUpperCase() &&
                jamKerja.absenDatangEnd.toUpperCase() === jamKerjaData.absenDatangEnd.toUpperCase() &&
                jamKerja.absenSiang1Start.toUpperCase() === jamKerjaData.absenSiang1Start.toUpperCase() &&
                jamKerja.absenSiang1End.toUpperCase() === jamKerjaData.absenSiang1End.toUpperCase() &&
                jamKerja.absenSiang2Start.toUpperCase() === jamKerjaData.absenSiang2Start.toUpperCase() &&
                jamKerja.absenSiang2End.toUpperCase() === jamKerjaData.absenSiang2End.toUpperCase() &&
                jamKerja.absenPulangStart.toUpperCase() === jamKerjaData.absenPulangStart.toUpperCase() &&
                jamKerja.absenPulangEnd.toUpperCase() === jamKerjaData.absenPulangEnd.toUpperCase()
            });

            if (!alreadyProcessed) {
              if (isAnyMatchDataFromExist.length > 0) {
                if (this.jamKerjaDataParent.jamKerja.toUpperCase() === jamKerjaData.jamKerja.toUpperCase() &&
                  this.jamKerjaDataParent.absenDatangStart.toUpperCase() === jamKerjaData.absenDatangStart.toUpperCase() &&
                  this.jamKerjaDataParent.absenDatangEnd.toUpperCase() === jamKerjaData.absenDatangEnd.toUpperCase() &&
                  this.jamKerjaDataParent.absenSiang1Start.toUpperCase() === jamKerjaData.absenSiang1Start.toUpperCase() &&
                  this.jamKerjaDataParent.absenSiang1End.toUpperCase() === jamKerjaData.absenSiang1End.toUpperCase() &&
                  this.jamKerjaDataParent.absenSiang2Start.toUpperCase() === jamKerjaData.absenSiang2Start.toUpperCase() &&
                  this.jamKerjaDataParent.absenSiang2End.toUpperCase() === jamKerjaData.absenSiang2End.toUpperCase() &&
                  this.jamKerjaDataParent.absenPulangStart.toUpperCase() === jamKerjaData.absenPulangStart.toUpperCase() &&
                  this.jamKerjaDataParent.absenPulangEnd.toUpperCase() === jamKerjaData.absenPulangEnd.toUpperCase()) {
                  this.globalService.PresentAlert('Tidak ada perubahan data jam kerja');
                } else
                  this.globalService.PresentAlert('Data jam kerja sudah ada');
                alreadyProcessed = true;
              } else {
                this.jamKerjaDataDoc.update(jamKerjaData);
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
