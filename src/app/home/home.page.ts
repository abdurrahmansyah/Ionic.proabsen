import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { BagianData, GlobalService, JabatanData, JamKerjaData, KantorData, KaryawanData, AbsenData, KehadiranData, LeaderboardData } from '../services/global.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { ActionSheetController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { KaryawanComponent } from '../components/karyawan/karyawan.component';
import { BagianComponent } from '../components/bagian/bagian.component';
import { FirebaseService } from '../services/firebase.service';
import { JabatanComponent } from '../components/jabatan/jabatan.component';
import { KantorComponent } from '../components/kantor/kantor.component';
import { Storage } from '@ionic/storage-angular';
import { JamKerjaComponent } from '../components/jam-kerja/jam-kerja.component';
import { formatDate } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
import { AbsenComponent } from '../components/absen/absen.component';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Index Page
  public folder: string = String.toString();
  public isPageHome: boolean = false;
  public isPageLeaderboard: boolean = false;
  public isPageHistory: boolean = false;
  public isPageProfile: boolean = false;
  public isPageTentang: boolean = false;
  public isPageAdministrator: boolean = false;

  // Transaksi Data

  // Page Home
  public todayTransaksiDataList: AbsenData[] = this.globalService.todayTransaksiDataList;

  // Text Page Home
  public txtDayNow: string = String.toString();
  public performancePersen: string = '100%'; // = this.globalService.persenThisMonthOutcomeByLimit;
  public datang: string = '-';
  public pulang: string = '-';

  // Page Profile
  public idKaryawan: string; // = this.globalService.karyawanData.idKaryawan;
  public idKaryawanParent: string;
  public namaKaryawan: string;
  public photoURL: string;
  public jabatan: string;
  public bagian: string;
  public jamKerja: string;
  public karyawanData: KaryawanData; // = this.globalService.karyawanData;

  // Page Administrator
  public segment: any;
  // public karyawanDataList: KaryawanData[] = this.globalService.karyawanDataList;
  // private karyawanDataListCollection: AngularFirestoreCollection<KaryawanData>;
  // private jamKerjaDataListCollection: AngularFirestoreCollection<JamKerjaData>;
  // private bagianDataListCollection: AngularFirestoreCollection<BagianData>;
  // private jabatanDataListCollection: AngularFirestoreCollection<JabatanData>;
  // private kantorDataListCollection: AngularFirestoreCollection<KantorData>;
  // karyawanDataList: Observable<KaryawanData[]> = this.firebaseService.karyawanDataList;
  // jamKerjaDataList: Observable<JamKerjaData[]> = this.firebaseService.jamKerjaDataList;
  // bagianDataList: Observable<BagianData[]> = this.firebaseService.bagianDataList;
  // jabatanDataList: Observable<JabatanData[]> = this.firebaseService.jabatanDataList;
  // kantorDataList: Observable<KantorData[]> = this.firebaseService.kantorDataList;
  public karyawanTotal = 0;
  public karyawanTotalSisa = 0;
  public persenKaryawanTotal: string = '100%';
  public absenTotal = 0;
  public bulanTotal = 0;
  public hadirTotal = 0;
  public ijinTotal = 0;
  public sakitTotal = 0;
  public dinasDalamKotaTotal = 0;
  public dinasLuarKotaTotal = 0;

  // public bulanTotal = 0;
  // leaderboardDataList: LeaderboardData[] = this.firebaseService.leaderboardDataList;
  // public dashboardKaryawanDataList: string;


  constructor(
    public auth: AngularFireAuth,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private globalService: GlobalService,
    public firebaseService: FirebaseService,
    private afs: AngularFirestore,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private excelService: ExcelService,
    private loadingCtrl: LoadingController
  ) {
    this.InitializeApp();
    this.Timer();
    this.InitializeData();
  }

  private InitializeApp() {
    this.InitializePageAdministrator();
  }

  private Timer() {
    setInterval(() => {
      this.ShowRepeatData();
    }, 500);
  }

  private InitializeData() {
    this.LoadKaryawanData();
    this.LoadDashboardData()
  }

  ShowRepeatData() {
    this.DeclareDateNow();
  }

  ngOnInit() {
    console.log("whats page?", this.globalService.page);

    this.ConfusingHomeView();
  }

  public ConfusingHomeView() {
    setInterval(() => {
      // this.folder = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
      this.folder = this.globalService.page;
      this.isPageHome = this.folder == this.globalService.IndexPageData.Home ? true : false;
      this.isPageLeaderboard = this.folder == this.globalService.IndexPageData.Leaderboard ? true : false;
      this.isPageHistory = this.folder == this.globalService.IndexPageData.History ? true : false;
      this.isPageProfile = this.folder == this.globalService.IndexPageData.Profile ? true : false;
      this.isPageTentang = this.folder == this.globalService.IndexPageData.Tentang ? true : false;
      this.isPageAdministrator = this.folder == this.globalService.IndexPageData.Administrator ? true : false;
    }, 100);
  }

  public async TambahTransaksi() { }
  public async EditTransaksi(transaksiData: AbsenData) { }
  public LihatLaporanTransaksi() {
    this.globalService.page = this.globalService.IndexPageData.Leaderboard;
    // this.router.navigateByUrl('/home/Leaderboard', { replaceUrl: true });
  }
  public EditLimit() { }

  login() {
    this.authService.login();
  }

  Logout() {
    this.authService.logout();
  }

  //#region Home

  private DeclareDateNow() {
    var dateData = this.globalService.GetDate();
    this.txtDayNow = dateData.szDay + ", " + dateData.decDate + " " + dateData.szMonth + " " + dateData.decYear;
  }

  public async ToIzin() {
    var karyawanDataDoc = this.afs.doc<KaryawanData>(`karyawan/${this.idKaryawan}`);
    var karyawanData = karyawanDataDoc.ref.get();
    karyawanData.then(async res => {
      if (res.exists) {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var tanggal = year + '-' + month + '-' + day;
        // tanggal = "2023-03-16";
        var tanggal2 = year.toString() + month.toString() + day.toString();

        var absenDataListToday = this.globalService.absenDataList.filter((absen: any) => {
          return absen.idKaryawan === this.idKaryawan &&
            absen.tanggal === tanggal
        });
        console.log("absenDataListToday", absenDataListToday);

        if (absenDataListToday.length == 0) {
          const modal = await this.modalController.create({
            component: AbsenComponent,
            initialBreakpoint: 0.6,
            breakpoints: [0, 0.6, 0.8, 0.95],
            mode: 'md',
            cssClass: 'round-modal',
            componentProps: { 'aksi': 'tambah' }
          });
          modal.onDidDismiss().then((modelData) => {
            if (modelData.role == "confirm") {
              if (modelData.data.dataPassing == "BerhasilCreate") {
                this.globalService.PresentToast('Berhasil mengajukan izin');
              } else if (modelData.data.dataPassing == "BerhasilEdit") {
                this.globalService.PresentToast('BUG: Tidak ada edit izin');
              }
            }
          })

          return await modal.present();
        } else {
          this.globalService.PresentAlert('Pengajuan izin ditolak! Anda telah melakukan absen hari ini');
        }
      } else {
        this.globalService.PresentAlert('ID Karyawan tidak tersedia', 'Gagal melakukan izin!')
        this.idKaryawan = '';
        this.idKaryawanParent = '';
        this.namaKaryawan = '';
        this.photoURL = '';
        this.jabatan = '';
        this.bagian = '';
        this.jamKerja = '';
      }
    });
  }

  public ToHistory() {
    // this.router.navigateByUrl('/home/History', { replaceUrl: false });
    this.globalService.page = this.globalService.IndexPageData.History;
    console.log("ToHistory");
  }

  public ToProfile() {
    // this.router.navigateByUrl('/home/Profile', { replaceUrl: false });
    this.globalService.page = this.globalService.IndexPageData.Profile;
    console.log("ToProfile");
  }

  public async Absen() {
    const loading = await this.loadingCtrl.create({
      message: 'Validasi data...',
      spinner: 'circles',
    });
    loading.present();

    if (!this.idKaryawan) {
      loading.dismiss();
      this.globalService.PresentAlert('Anda belum menghubungkan akun dengan data karyawan. Silahkan masukkan ID Karyawan pada menu Profile');
    }
    else {
      var karyawanDataDoc = this.afs.doc<KaryawanData>(`karyawan/${this.idKaryawan}`);
      var karyawanData = karyawanDataDoc.ref.get();
      karyawanData.then(res => {
        if (res.exists) {
          var date = new Date();
          var year = date.getFullYear();
          var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
          var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
          var tanggal = year + '-' + month + '-' + day;
          // tanggal = "2023-03-16";
          var tanggal2 = year.toString() + month.toString() + day.toString();
          var bulan = month.toString() + '/' + year.toString();

          var dataIjin = this.globalService.absenDataList.filter((x: any) => { return x.idKaryawan === this.idKaryawan && x.tanggal === tanggal && x.kehadiran !== this.globalService.kehadiranData.Hadir });

          if (dataIjin.length > 0) {
            loading.dismiss();
            this.globalService.PresentAlert('Tidak dapat melakukan absensi! Anda telah mengajukan ijin hari ini');
          } else {
            var timeAbsen = formatDate(date, 'HH:mm', 'en-US');
            // timeAbsen = "07:51";

            var jamKerjaData = (this.globalService.jamKerjaDataList.filter((x: any) => { return x.jamKerja === this.jamKerja })).find((x: any) => x !== undefined);
            if (jamKerjaData !== undefined) {
              if (timeAbsen >= jamKerjaData.absenDatangStart && timeAbsen <= jamKerjaData.absenDatangEnd) {
                this.ProcessAbsen(loading, tanggal, bulan, timeAbsen, 1);
              } else if (timeAbsen >= jamKerjaData.absenSiang1Start && timeAbsen <= jamKerjaData.absenSiang1End) {
                this.ProcessAbsen(loading, tanggal, bulan, timeAbsen, 2);
              } else if (timeAbsen >= jamKerjaData.absenSiang2Start && timeAbsen <= jamKerjaData.absenSiang2End) {
                this.ProcessAbsen(loading, tanggal, bulan, timeAbsen, 3);
              } else if (timeAbsen >= jamKerjaData.absenPulangStart && timeAbsen <= jamKerjaData.absenPulangEnd) {
                this.ProcessAbsen(loading, tanggal, bulan, timeAbsen, 4);
              } else { loading.dismiss(); this.globalService.PresentAlert('Anda berada diluar waktu absensi yang telah ditetapkan!'); }
            } else { loading.dismiss(); this.globalService.PresentAlert("BUG: Jam Kerja Tidak Terdaftar"); }
          }
        } else {
          this.globalService.PresentAlert('ID Karyawan tidak tersedia', 'Gagal Absen!')
          this.idKaryawan = '';
          this.idKaryawanParent = '';
          this.namaKaryawan = '';
          this.photoURL = '';
          this.jabatan = '';
          this.bagian = '';
          this.jamKerja = '';
          loading.dismiss();
        }
      });
    }
  }

  private async ProcessAbsen(loadingThru: HTMLIonLoadingElement, tanggal: string, bulan: string, timeAbsen: string, index: number) {
    var data = this.globalService.absenDataList.filter((absen: any) => {
      if (this.idKaryawan === absen.idKaryawan && tanggal === absen.tanggal) {
        if (index === 1) return this.idKaryawan === absen.idKaryawan && tanggal === absen.tanggal && absen.absen1 !== '';
        else if (index === 2) return this.idKaryawan === absen.idKaryawan && tanggal === absen.tanggal && absen.absen2 !== '';
        else if (index === 3) return this.idKaryawan === absen.idKaryawan && tanggal === absen.tanggal && absen.absen3 !== '';
        else if (index === 3) return this.idKaryawan === absen.idKaryawan && tanggal === absen.tanggal && absen.absen4 !== '';
        else return;
      } else return;
    });

    if (data.length > 0) {
      loadingThru.dismiss();
      this.globalService.PresentAlert('Anda sudah melakukan absensi');
    } else {
      loadingThru.dismiss();

      const loadingLokasi = await this.loadingCtrl.create({
        message: 'Get info lokasi...',
        spinner: 'circles',
      });
      loadingLokasi.present();

      await Geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(async (position) => {
        console.log("My Position", position.coords);

        if (this.globalService.kantorDataList.length > 0) {
          var kantorAbsen: any;
          this.globalService.kantorDataList.forEach((kantorData: KantorData) => {
            var distance = this.distanceInMeterBetweenEarthCoordinates(kantorData.latitude, kantorData.longitude, position.coords.latitude, position.coords.longitude);
            // console.log(kantorData);
            // console.log("distance", distance);
            if (distance <= kantorData.radius) {
              kantorAbsen = kantorData;
            }
          });
          if (kantorAbsen !== undefined) {
            loadingLokasi.dismiss();

            await this.alertController.create({
              mode: 'ios',
              message: `Anda akan melakukan absen di ${kantorAbsen.kantor}. Konfirmasi untuk melanjutkan?`,
              buttons: [{
                text: 'CANCEL',
                role: 'Cancel'
              }, {
                text: 'Lanjut',
                handler: async () => {
                  const loadingAbsen = await this.loadingCtrl.create({
                    message: 'Proses Absen...',
                    spinner: 'circles',
                  });
                  loadingAbsen.present();

                  var absenDataListToday = this.globalService.absenDataList.filter((absen: any) => {
                    return absen.idKaryawan === this.idKaryawan &&
                      absen.tanggal === tanggal
                  });

                  if (absenDataListToday.length == 0) {
                    var absenData: AbsenData = {
                      idKaryawan: this.idKaryawan,
                      tanggal: tanggal,
                      bulan: bulan,
                      kehadiran: this.globalService.kehadiranData.Hadir,
                      absen1: index == 1 ? timeAbsen : '',
                      absen2: index == 2 ? timeAbsen : '',
                      absen3: index == 3 ? timeAbsen : '',
                      absen4: index == 4 ? timeAbsen : '',
                      lokasi1: index == 1 ? kantorAbsen.kantor : '',
                      lokasi2: index == 2 ? kantorAbsen.kantor : '',
                      lokasi3: index == 3 ? kantorAbsen.kantor : '',
                      lokasi4: index == 4 ? kantorAbsen.kantor : '',
                      ket: '',
                      lampiran: ''
                    }
                    loadingAbsen.dismiss();
                    this.firebaseService.absenDataListCollection.add(absenData);
                    this.globalService.PresentAlert('Berhasil melakukan absen');
                  }
                  else {
                    var absenDataToday = absenDataListToday.find((x: any) => x !== undefined);
                    if (absenDataToday !== undefined) {
                      console.log("absenDataToday", absenDataToday);
                      var absenData: AbsenData = {
                        idKaryawan: this.idKaryawan,
                        tanggal: tanggal,
                        bulan: bulan,
                        kehadiran: this.globalService.kehadiranData.Hadir,
                        absen1: index == 1 ? timeAbsen : absenDataToday.absen1,
                        absen2: index == 2 ? timeAbsen : absenDataToday.absen2,
                        absen3: index == 3 ? timeAbsen : absenDataToday.absen3,
                        absen4: index == 4 ? timeAbsen : absenDataToday.absen4,
                        lokasi1: index == 1 ? kantorAbsen.kantor : absenDataToday.lokasi1,
                        lokasi2: index == 2 ? kantorAbsen.kantor : absenDataToday.lokasi2,
                        lokasi3: index == 3 ? kantorAbsen.kantor : absenDataToday.lokasi3,
                        lokasi4: index == 4 ? kantorAbsen.kantor : absenDataToday.lokasi4,
                        ket: '',
                        lampiran: ''
                      }

                      loadingAbsen.dismiss();
                      var absenDataDoc = this.afs.doc<AbsenData>(`absen/${absenDataToday.id}`);
                      absenDataDoc.update(absenData);
                      this.globalService.PresentAlert('Berhasil melakukan absen');
                    } else { loadingAbsen.dismiss(); this.globalService.PresentAlert('BUG: Should not empty absenDataToday') }
                  }
                }
              }]
            }).then(alert => {
              return alert.present();
            });
          } else { loadingLokasi.dismiss(); this.globalService.PresentAlert("Anda tidak berada di lokasi kantor manapun", "Tidak dapat melakukan absen!"); }
        } else { loadingLokasi.dismiss(); this.globalService.PresentAlert("Data kantor tidak ada. Silahkan hubungi admin", "Tidak dapat melakukan absen!"); }
      }).catch(er => {
        loadingLokasi.dismiss();
        this.globalService.PresentAlert(JSON.stringify(er));
        console.log(er);
      })
    }
  }

  private distanceInMeterBetweenEarthCoordinates(lat1: any, lon1: any, lat2: any, lon2: any) {
    var earthRadiusKm = 6371;

    var dLat = this.degreesToRadians(lat2 - lat1);
    var dLon = this.degreesToRadians(lon2 - lon1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c * 1000;
  }

  private degreesToRadians(degrees: any) {
    return degrees * Math.PI / 180;
  }

  //#endregion

  //#region PROFILE

  private async LoadKaryawanData() {
    this.auth.user.subscribe(user => {
      if (user !== undefined && user !== null) {
        var karyawanDataListCollectionSpecificEmail = this.afs.collection<KaryawanData>('karyawan', ref => ref.where('email', '==', user.email));
        var karyawanDataListSpecificEmail = karyawanDataListCollectionSpecificEmail.valueChanges({ idField: 'id' });
        karyawanDataListSpecificEmail.subscribe(karyawanDataList => {
          if (karyawanDataList.length > 0) {
            var karyawanData = karyawanDataList.find(x => x);
            if (karyawanData !== undefined) {
              this.karyawanData = karyawanData;
              this.globalService.karyawanData = karyawanData;

              this.idKaryawan = karyawanData.idKaryawan;
              this.idKaryawanParent = karyawanData.idKaryawan;
              this.namaKaryawan = karyawanData.namaKaryawan;
              this.photoURL = karyawanData.photoURL;
              this.jabatan = karyawanData.jabatan;
              this.bagian = karyawanData.bagian;
              this.jamKerja = karyawanData.jamKerja;

              var date = new Date();
              var year = date.getFullYear();
              var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
              var bulan = month.toString() + '/' + date.getFullYear().toString();
              var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
              var tanggal = year + '-' + month + '-' + day;
              // tanggal = "2023-02-06";

              var absenDataListCollectionSpecificIdKaryawanThisMonth = this.afs.collection<AbsenData>('absen', ref => ref.where('idKaryawan', '==', this.idKaryawan).where('bulan', '==', bulan));
              var absenDataListSpecificIdKaryawanThisMonth = absenDataListCollectionSpecificIdKaryawanThisMonth.valueChanges({ idField: 'id' });
              absenDataListSpecificIdKaryawanThisMonth.subscribe(absenDataList => {
                if (absenDataList.length > 0) {
                  var absenHadir = absenDataList.filter(x => { return x.kehadiran == this.globalService.kehadiranData.Hadir });

                  this.performancePersen = (Math.ceil(absenHadir.length / absenDataList.length * 100)).toString() + '%';
                }
              })

              var absenDataListCollectionSpecificIdKaryawanToday = this.afs.collection<AbsenData>('absen', ref => ref.where('idKaryawan', '==', this.idKaryawan).where('tanggal', '==', tanggal));
              var absenDataListSpecificIdKaryawanToday = absenDataListCollectionSpecificIdKaryawanToday.valueChanges({ idField: 'id' });
              absenDataListSpecificIdKaryawanToday.subscribe(absenDataList => {
                if (absenDataList.length > 0) {
                  var absenData = absenDataList.find(x => x !== undefined);
                  if (absenData !== undefined) {
                    this.datang = absenData.absen1 ? absenData.absen1 : absenData.absen2 ? absenData.absen2 : absenData.absen3 ? absenData.absen3 : absenData.absen4 ? absenData.absen4 : '-';
                    this.pulang = absenData.absen4 ? absenData.absen4 : '-';

                    if (this.datang !== '-' && this.datang < '12:00') this.datang = this.datang + ' AM';
                    if (this.datang !== '-' && this.datang > '12:00') this.datang = this.datang + ' PM';
                    if (this.pulang !== '-' && this.pulang < '12:00') this.pulang = this.pulang + ' AM';
                    if (this.pulang !== '-' && this.pulang > '12:00') this.pulang = this.pulang + ' PM';
                  }
                } else {
                  this.datang = "-";
                  this.pulang = "-";
                }
              })

            } else console.log("BUG: Karyawan Data Kosong");
          }
        });
      }
    });
  }

  async EditIdKaryawan() {
    try {
      const actionSheet = await this.actionSheetCtrl.create({
        mode: 'ios',
        buttons: [
          {
            text: 'Edit ID Karyawan',
            handler: async () => {
              await this.alertController.create({
                mode: 'ios',
                message: 'Masukkan Id Karyawan Anda!',
                inputs: [{
                  placeholder: 'Id Karyawan',
                  type: 'text',
                  name: 'idKaryawan'
                }],
                buttons: [{
                  text: 'CANCEL',
                  role: 'Cancel',
                }, {
                  text: 'OK',
                  handler: async data => {
                    if (data.idKaryawan == this.idKaryawan) {
                      this.globalService.PresentAlert('Tidak ada perubahan data');
                    } else if (!data.idKaryawan) {
                      this.globalService.PresentAlert('ID Karyawan kosong!');
                    } else {
                      var alreadyProcessed = false;
                      this.auth.user.subscribe(user => {
                        if (user !== null) {
                          var karyawanDataDoc = this.afs.doc<KaryawanData>(`karyawan/${data.idKaryawan}`);
                          var karyawanData = karyawanDataDoc.valueChanges();
                          if (!alreadyProcessed) {
                            karyawanData.subscribe(async karyawanData => {
                              if (karyawanData !== undefined) {
                                if (karyawanData?.email) {
                                  if (!alreadyProcessed) {
                                    const alert = await this.alertController.create({
                                      mode: 'ios',
                                      message: `ID Karyawan sudah terdaftar pada akun '${karyawanData.email}'. Apakah anda yakin ingin merubah?`,
                                      buttons: [{
                                        text: 'CANCEL',
                                        role: 'Cancel'
                                      }, {
                                        text: 'OK',
                                        handler: async () => {
                                          if (!alreadyProcessed) {
                                            alreadyProcessed = this.ProcessingEditIdKaryawan(karyawanData, user, karyawanDataDoc, alreadyProcessed);
                                          }
                                        }
                                      }]
                                    }).then(alert => {
                                      return alert.present();
                                    });
                                  }
                                } else {
                                  if (!alreadyProcessed) {
                                    alreadyProcessed = this.ProcessingEditIdKaryawan(karyawanData, user, karyawanDataDoc, alreadyProcessed);
                                  }
                                }
                              } else {
                                if (!alreadyProcessed) {
                                  this.globalService.PresentAlert('Gagal! Id Karyawan tidak terdaftar');
                                  alreadyProcessed = true;
                                }
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                }]
              }).then(alert => {
                return alert.present();
              });
            },
          },
          {
            text: 'Hapus ID Karyawaan',
            handler: () => {
              if (this.idKaryawan !== undefined) {
                var alreadyProcessed = false;
                var karyawanDataDoc = this.afs.doc<KaryawanData>(`karyawan/${this.idKaryawan}`);
                var karyawanData = karyawanDataDoc.valueChanges();
                karyawanData.subscribe(async karyawanData => {
                  if (!alreadyProcessed) {
                    if (karyawanData !== undefined) {
                      var newKaryawanData: KaryawanData = {
                        idKaryawan: karyawanData.idKaryawan,
                        namaKaryawan: karyawanData.namaKaryawan,
                        jabatan: karyawanData.jabatan,
                        bagian: karyawanData.bagian,
                        jamKerja: karyawanData.jamKerja,
                        isAdmin: karyawanData.isAdmin,
                        email: '',
                        displayNameEmail: '',
                        photoURL: ''
                      };

                      karyawanDataDoc.update(newKaryawanData);

                      this.globalService.karyawanData = karyawanData;
                      this.idKaryawan = '';
                      this.namaKaryawan = '';
                      this.jabatan = '';
                      this.bagian = '';
                      this.jamKerja = '';

                      alreadyProcessed = true;
                      this.globalService.PresentAlert('Berhasil hapus Id Karyawan')
                    } else {
                      alreadyProcessed = true;
                      this.globalService.PresentAlert('Id Karyawan tidak terdaftar')
                    }
                  }
                });
              } else this.globalService.PresentAlert('ID Karyawan Kosong');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ],
      }).then(actionSheet => { return actionSheet.present(); });
    } catch (e) {
      console.log(e);
    }
  }

  private ProcessingEditIdKaryawan(karyawanData: KaryawanData, user: any, karyawanDataDoc: AngularFirestoreDocument<KaryawanData>, alreadyProcessed: boolean) {
    var newKaryawanData: KaryawanData = {
      idKaryawan: karyawanData.idKaryawan,
      namaKaryawan: karyawanData.namaKaryawan,
      jabatan: karyawanData.jabatan,
      bagian: karyawanData.bagian,
      jamKerja: karyawanData.jamKerja,
      isAdmin: karyawanData.isAdmin,
      email: user?.email ? user.email : '',
      displayNameEmail: user?.displayName ? user.displayName : '',
      photoURL: user?.photoURL ? user.photoURL : ''
    };

    karyawanDataDoc.update(newKaryawanData);

    var karyawanDataParentDoc = this.afs.doc<KaryawanData>(`karyawan/${this.idKaryawanParent}`);
    var karyawanDataParent = karyawanDataParentDoc.valueChanges();
    karyawanDataParent.subscribe(async karyawanDataParent => {
      if (karyawanDataParent !== undefined) {
        var karyawanData: KaryawanData = {
          idKaryawan: karyawanDataParent.idKaryawan,
          namaKaryawan: karyawanDataParent.namaKaryawan,
          jabatan: karyawanDataParent.jabatan,
          bagian: karyawanDataParent.bagian,
          jamKerja: karyawanDataParent.jamKerja,
          isAdmin: karyawanDataParent.isAdmin,
          email: '',
          displayNameEmail: '',
          photoURL: ''
        };
        karyawanDataParentDoc.update(karyawanData);
      }
    });

    this.globalService.karyawanData = karyawanData;
    this.karyawanData = karyawanData;
    this.idKaryawan = karyawanData.idKaryawan;
    this.namaKaryawan = karyawanData.namaKaryawan;
    this.jabatan = karyawanData.jabatan;
    this.bagian = karyawanData.bagian;
    this.jamKerja = karyawanData.jamKerja;

    alreadyProcessed = true;
    this.globalService.PresentAlert('Berhasil sinkronisasi Id Karyawan');
    return alreadyProcessed;
  }

  //#endregion

  //#region Page Tentang

  public HapusSemuaDataAbsen() {
    this.alertController.create({
      mode: 'ios',
      header: 'Warning!',
      message: 'Apakah Anda Yakin Ingin Menghapus Seluruh Data ?',
      // cssClass: 'alert-akun',
      buttons: [{
        text: 'YES',
        handler: () => {
          // Storage.remove({ key: "kategoriDataList" });
          // Storage.remove({ key: "transaksiDataList" });
          // this.globalService.PresentToast('Berhasil Menghapus Seluruh Data');
        }
      }, {
        text: 'CANCEL',
        role: 'Cancel'
      }]
    }).then(alert => {
      return alert.present();
    });
  }

  //#endregion

  //#region ADMINISTRATOR

  private InitializePageAdministrator() {
    // this.segment = "karyawan";
    this.segment = "overview";
  }

  private LoadDashboardData() {
    this.firebaseService.karyawanDataList.subscribe(karyawanDataList => {
      this.karyawanTotal = karyawanDataList.length;
      this.karyawanTotalSisa = 200 - this.karyawanTotal;
      // this.performancePersen = (Math.ceil(absenHadir.length / absenDataList.length * 100)).toString() + '%';
      this.persenKaryawanTotal = (Math.ceil(this.karyawanTotal / 200 * 100)).toString() + '%';
    });

    this.firebaseService.absenDataList.subscribe(absenDataList => {
      this.absenTotal = absenDataList.length;
      this.bulanTotal = [...new Set(absenDataList.map(absenData => absenData.bulan))].length;
      this.hadirTotal = absenDataList.filter(x => { return x.kehadiran === this.globalService.kehadiranData.Hadir }).length;
      this.ijinTotal = absenDataList.filter(x => { return x.kehadiran === this.globalService.kehadiranData.Ijin }).length;
      this.sakitTotal = absenDataList.filter(x => { return x.kehadiran === this.globalService.kehadiranData.Sakit }).length;
      this.dinasDalamKotaTotal = absenDataList.filter(x => { return x.kehadiran === this.globalService.kehadiranData.DinasDalamKota }).length;
      this.dinasLuarKotaTotal = absenDataList.filter(x => { return x.kehadiran === this.globalService.kehadiranData.DinasLuarKota }).length;
    })
  }

  public SegmentChanged(ev: any) {
    // console.log(ev);
  }

  public DownloadDataKaryawan() {
    this.globalService.PresentAlert('Fungsi tidak tersedia');
  }

  public async DeleteAllAbsenData() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Warning!',
      message: `Apakah anda yakin ingin menghapus seluruh data absen?`,
      buttons: [{
        text: 'CANCEL',
        role: 'Cancel'
      }, {
        text: 'OK',
        handler: async () => {
          var query = this.firebaseService.absenDataListCollection.ref.get();
          (await query).forEach(doc => {
            doc.ref.delete();
          });
        }
      }]
    }).then(alert => {
      return alert.present();
    });
  }

  public DownloadReportAbsen() {
    const fileName = 'ReportDownload' + this.GetUniqueCode() + '.xlsx';
    const worksheetname = 'Report';
    const title = 'Report Absen';
    const header = ['No', 'Tanggal', 'Bulan', 'ID Karyawan', 'Nama', 'Kehadiran', 'Absen 1', 'Absen 2', 'Absen 3', 'Absen 4', 'Lokasi 1', 'Lokasi 2', 'Lokasi 3', 'Lokasi 4', 'Keterangan'];
    const reportBy = this.namaKaryawan;


    var data: any[] = [];
    var index: number = 0;
    this.globalService.absenDataList.forEach((absenData: AbsenData) => {
      var namaKaryawan = this.globalService.karyawanDataList.filter((x: KaryawanData) => { return x.idKaryawan === absenData.idKaryawan }).find((x: any) => x !== undefined).namaKaryawan;

      index += 1;
      var row = [];
      row[0] = index.toString();
      row[1] = absenData.tanggal;
      row[2] = absenData.bulan;
      row[3] = absenData.idKaryawan;
      row[4] = namaKaryawan;
      row[5] = absenData.kehadiran;
      row[6] = absenData.absen1;
      row[7] = absenData.absen2;
      row[8] = absenData.absen3;
      row[9] = absenData.absen4;
      row[10] = absenData.lokasi1;
      row[11] = absenData.lokasi2;
      row[12] = absenData.lokasi3;
      row[13] = absenData.lokasi4;
      row[14] = absenData.ket;
      data.push(row);
    });
    console.log(data);
    console.log(this.globalService.absenDataList);

    this.excelService.ExportReportAbsenToExcel({ fileName, worksheetname, title, header, data, reportBy });
  }

  private GetUniqueCode() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    var index = year + '' + month + day + hour + min + sec;
    return index;
  }

  public async GetLocation() {
    var latRumah = -6.1974125;
    var longRumah = 106.7323754;
    var latPom = -6.1974125;
    var longPom = 106.7323754;
    var distance = this.CoordDistance(latRumah, longRumah, latPom, longPom);
    console.log("distance", distance);

    await Geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((position) => {
      this.globalService.PresentAlert("My position: " + JSON.stringify(position));
      var latRumah = -6.1974125;
      var longRumah = 106.7323754;
      var latPom = -6.1974125;
      var longPom = 106.7323754;
      var distance = this.CoordDistance(position.coords.latitude, position.coords.longitude, latPom, longPom);
      console.log("distance", distance);
    });
  }

  private CoordDistance(latitude1: number, longitude1: number, latitude2: number, longitude2: number) {
    return 6371 * Math.acos(
      Math.sin(latitude1) * Math.sin(latitude2)
      + Math.cos(latitude1) * Math.cos(latitude2) * Math.cos(longitude2 - longitude1));
  }

  public async TambahKaryawan() {
    if (this.globalService.karyawanDataList.length > 200) this.globalService.PresentAlert('Jumlah karyawan sudah mencapai kuota maksimal', 'Gagal menambah data karyawan!');
    else {
      const modal = await this.modalController.create({
        component: KaryawanComponent,
        initialBreakpoint: 0.6,
        breakpoints: [0, 0.6, 0.8],
        mode: 'md',
        cssClass: 'round-modal',
        componentProps: { 'aksi': 'tambah' }
      });
      modal.onDidDismiss().then((modelData) => {
        if (modelData.role == "confirm") {
          if (modelData.data.dataPassing == "BerhasilCreate") {
            this.globalService.PresentToast('Berhasil menambah satu karyawan');
          } else if (modelData.data.dataPassing == "BerhasilEdit") {
            this.globalService.PresentToast('Berhasil merubah satu karyawan');
          }
        }
      })

      return await modal.present();
    }
  }

  public async EditKaryawan(karyawanData: any) {
    console.log("edit karyawan");
    const modal = await this.modalController.create({
      component: KaryawanComponent,
      initialBreakpoint: 0.6,
      breakpoints: [0, 0.6, 0.8],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'edit', 'data': karyawanData }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu karyawan');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu karyawan');
        }
      }
    })

    return await modal.present();
  }

  public HapusKaryawan(karyawanData: any) {
    console.log("hapus karyawan");
    var karyawanDataDoc = this.afs.doc<KaryawanData>(`karyawan/${karyawanData.id}`);
    var data = this.globalService.absenDataList.filter((x: any) => { return x.idKaryawan == karyawanData.idKaryawan });
    if (data.length === 0) {
      karyawanDataDoc.delete();
    } else this.globalService.PresentAlert('Karyawan sudah pernah melakukan ' + data.length + ' kali absensi', 'Tidak dapat menghapus data!');
  }

  public async TambahJamKerja() {
    const modal = await this.modalController.create({
      component: JamKerjaComponent,
      initialBreakpoint: 0.62,
      breakpoints: [0, 0.62, 0.8],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'tambah' }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu jam kerja');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu jam kerja');
        }
      }
    })

    return await modal.present();
  }

  public async EditJamKerja(jamKerjaData: any) {
    console.log("edit jam kerja");
    const modal = await this.modalController.create({
      component: JamKerjaComponent,
      initialBreakpoint: 0.62,
      breakpoints: [0, 0.62, 0.8],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'edit', 'data': jamKerjaData }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu jam kerja');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu jam kerja');
        }
      }
    })

    return await modal.present();
  }

  public HapusJamKerja(jamKerjaData: any) {
    console.log("hapus jam kerja");
    var jamKerjaDataDoc = this.afs.doc<JamKerjaData>(`jamKerja/${jamKerjaData.id}`);
    var data = this.globalService.bagianDataList.filter((x: any) => { return x.jamKerja === jamKerjaData.jamKerja });
    if (data.length === 0) {
      var data = this.globalService.karyawanDataList.filter((x: any) => { return x.jamKerja === jamKerjaData.jamKerja });
      if (data.length === 0) {
        jamKerjaDataDoc.delete();
      } else this.globalService.PresentAlert("BUG: DEL JAM KERJA");
    } else {
      this.globalService.PresentAlert('Jam kerja digunakan oleh ' + data.length + ' data bagian', 'Tidak dapat menghapus data!')
    }
  }

  public async TambahBagian() {
    const modal = await this.modalController.create({
      component: BagianComponent,
      initialBreakpoint: 0.4,
      breakpoints: [0, 0.4, 0.6],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'tambah' }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu bagian');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu bagian');
        }
      }
    })

    return await modal.present();
  }

  public async EditBagian(bagianData: any) {
    console.log("edit bagian");
    const modal = await this.modalController.create({
      component: BagianComponent,
      initialBreakpoint: 0.4,
      breakpoints: [0, 0.4, 0.6],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'edit', 'data': bagianData }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu bagian');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu bagian');
        }
      }
    })

    return await modal.present();
  }

  public HapusBagian(bagianData: any) {
    console.log("hapus bagian", bagianData);
    var bagianDataDoc = this.afs.doc<BagianData>(`bagian/${bagianData.id}`);
    var data = this.globalService.jabatanDataList.filter((x: any) => { return x.bagian === bagianData.bagian });
    if (data.length === 0) {
      var data = this.globalService.karyawanDataList.filter((x: any) => { return x.bagian === bagianData.bagian });
      if (data.length === 0) {
        bagianDataDoc.delete();
      } else this.globalService.PresentAlert("BUG: DEL BAGIAN");
    } else {
      this.globalService.PresentAlert('Bagian digunakan oleh ' + data.length + ' data jabatan', 'Tidak dapat menghapus data!')
    }
  }

  public async TambahJabatan() {
    const modal = await this.modalController.create({
      component: JabatanComponent,
      initialBreakpoint: 0.4,
      breakpoints: [0, 0.4, 0.6],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'tambah' }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu jabatan');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu jabatan');
        }
      }
    })

    return await modal.present();
  }

  public async EditJabatan(jabatanData: any) {
    console.log("edit jabatan");
    const modal = await this.modalController.create({
      component: JabatanComponent,
      initialBreakpoint: 0.4,
      breakpoints: [0, 0.4, 0.6],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'edit', 'data': jabatanData }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu jabatan');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu jabatan');
        }
      }
    })

    return await modal.present();
  }

  public HapusJabatan(jabatanData: any) {
    console.log("hapus jabatan");
    var jabatanDataDoc = this.afs.doc<JabatanData>(`jabatan/${jabatanData.id}`);
    var data = this.globalService.karyawanDataList.filter((x: any) => { return x.jabatan === jabatanData.jabatan });
    if (data.length === 0) {
      jabatanDataDoc.delete();
    } else {
      this.globalService.PresentAlert('Jabatan digunakan oleh ' + data.length + ' data karyawan', 'Tidak dapat menghapus data!')
    }
  }

  public async TambahKantor() {
    const modal = await this.modalController.create({
      component: KantorComponent,
      initialBreakpoint: 0.55,
      breakpoints: [0, 0.55, 0.7],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'tambah' }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu kantor');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu kantor');
        }
      }
    })

    return await modal.present();
  }

  public async EditKantor(kantorData: any) {
    console.log("edit kantor");
    const modal = await this.modalController.create({
      component: KantorComponent,
      initialBreakpoint: 0.55,
      breakpoints: [0, 0.55, 0.7],
      mode: 'md',
      cssClass: 'round-modal',
      componentProps: { 'aksi': 'edit', 'data': kantorData }
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.role == "confirm") {
        if (modelData.data.dataPassing == "BerhasilCreate") {
          this.globalService.PresentToast('Berhasil menambah satu kantor');
        } else if (modelData.data.dataPassing == "BerhasilEdit") {
          this.globalService.PresentToast('Berhasil merubah satu kantor');
        }
      }
    })

    return await modal.present();
  }

  public HapusKantor(kantorData: any) {
    console.log("hapus kantor");
    var kantorDataDoc = this.afs.doc<KantorData>(`kantor/${kantorData.id}`);
    kantorDataDoc.delete();
  }

  //#endregion
}
