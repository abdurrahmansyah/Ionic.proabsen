import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  IndexPageData: IndexPage = new IndexPage();
  kehadiranData: KehadiranData = new KehadiranData();
  page: string = 'Home';

  // karyawanDataList: KaryawanData[] = [];
  transaksiDataList: AbsenData[] = [];
  todayTransaksiDataList: AbsenData[] = [];

  // PROFILE
  public karyawanData: KaryawanData = new KaryawanData();

  // Master Data
  public karyawanDataList: any = [];
  public jamKerjaDataList: any = [];
  public bagianDataList: any = [];
  public jabatanDataList: any = [];
  public kantorDataList: any = [];

  // Transaksi Data
  public absenDataList: any = [];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  public GetDate(param?: any): DateData {
    var dateData = new DateData();
    var months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    // var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    if (param) var date = new Date(param);
    else var date = new Date();

    dateData.date = date;
    dateData.decYear = date.getFullYear();
    dateData.szMonth = months[date.getMonth()];
    dateData.decMonth = date.getMonth() + 1;
    dateData.decDate = date.getDate();
    dateData.szDay = days[date.getDay()];
    dateData.decMinute = date.getMinutes();
    dateData.szMinute = dateData.decMinute < 10 ? "0" + dateData.decMinute : dateData.decMinute.toString();
    dateData.decHour = date.getHours();
    dateData.szHour = dateData.decHour < 10 ? "0" + dateData.decHour : dateData.decHour.toString();
    dateData.decSec = date.getSeconds();
    dateData.szAMPM = dateData.decHour > 12 ? "PM" : "AM";
    dateData.todayFormatted = formatDate(date, 'YYYY-MM-dd', 'en-US');

    return dateData;
  }

  PresentAlert(msg: string, header?: string) {
    this.alertController.create({
      mode: 'ios',
      header: header,
      message: msg,
      buttons: ['OK']
    }).then(alert => {
      return alert.present();
    });
  }

  async PresentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: "dark",
      mode: "ios"
    });
    toast.present();
  }
}

export class IndexPage {
  public readonly Home: string = "Home";
  public readonly Leaderboard: string = "Leaderboard";
  public readonly History: string = "History";
  public readonly Profile: string = "Profile";
  public readonly Tentang: string = "Tentang";
  public readonly Administrator: string = "Administrator";
}

export class KehadiranData {
  public readonly Hadir: string = "Hadir";
  public readonly Ijin: string = "Ijin";
  public readonly Sakit: string = "Sakit";
  public readonly DinasDalamKota: string = "Dinas Dalam Kota";
  public readonly DinasLuarKota: string = "Dinas Luar Kota";
}

export class DateData {
  public date: Date = new Date();
  public szDay: string = String.toString();
  public decDate: number = Number.MIN_VALUE;
  public szMonth: string = String.toString();
  public decYear: number = Number.MIN_VALUE;
  public decHour: number = Number.MIN_VALUE;
  public szHour: string = String.toString();
  public decMinute: number = Number.MIN_VALUE;
  public szMinute: string = String.toString();
  public szAMPM: string = String.toString();
  public decSec: number = Number.MIN_VALUE;
  public decMonth: number = Number.MIN_VALUE;
  public todayFormatted: string = String.toString();

  constructor() { }
}

export class KaryawanData {
  public idKaryawan: string = "";
  public namaKaryawan: string = "";
  public bagian: string = "";
  public jabatan: string = "";
  public jamKerja: string = "";
  public isAdmin: boolean = false;
  public email: string = "";
  public displayNameEmail: string = "";
  public photoURL: string = "";

  constructor() { }
}

// export class KaryawanDataUpdated {
//   public karyawanData: KaryawanData = new KaryawanData();
//   public email: string | null | undefined = String.toString();
//   public displayNameEmail: string | null | undefined = String.toString();
//   public photoURL: string | null | undefined = String.toString();

//   constructor() { }
// }

export class JamKerjaData {
  public jamKerja: string = String.toString();
  // public namaJamKerja: string = String.toString();
  // public waktu: string = String.toString();
  public absenDatangStart: string = String.toString();
  public absenDatangEnd: string = String.toString();
  public absenSiang1Start: string = String.toString();
  public absenSiang1End: string = String.toString();
  public absenSiang2Start: string = String.toString();
  public absenSiang2End: string = String.toString();
  public absenPulangStart: string = String.toString();
  public absenPulangEnd: string = String.toString();


  constructor() { }
}

export class BagianData {
  public bagian: string = String.toString();
  public jamKerja: string = String.toString();

  constructor() { }
}

export class JabatanData {
  public jabatan: string = String.toString();
  public bagian: string = String.toString();

  constructor() { }
}

export class KantorData {
  public kantor: string = String.toString();
  public alamat: string = String.toString();
  public longitude: number = 0;
  public latitude: number = 0;
  public radius: number = 0;

  constructor() { }
}

export class AbsenData {
  public idKaryawan: string = String.toString();
  // public namaKaryawan: string = String.toString();
  // public bagian: string = String.toString();
  // public jabatan: string = String.toString();
  // public photoURL: string = String.toString();
  public tanggal: string = String.toString();
  public bulan: string = String.toString();
  public kehadiran: string = String.toString();
  public absen1: string = String.toString();
  public absen2: string = String.toString();
  public absen3: string = String.toString();
  public absen4: string = String.toString();
  public lokasi1: string = String.toString();
  public lokasi2: string = String.toString();
  public lokasi3: string = String.toString();
  public lokasi4: string = String.toString();
  public ket: string = String.toString();
  public lampiran: string = String.toString();

  constructor() { }
}

export class LeaderboardData {
  public idKaryawan: string = String.toString();
  public namaKaryawan: string = String.toString();
  public bagian: string = String.toString();
  public jabatan: string = String.toString();
  public photoURL: string = String.toString();
  public tanggal: string = String.toString();
  public bulan: string = String.toString();
  public kehadiran: string = String.toString();
  public absen1: string = String.toString();
  public absen2: string = String.toString();
  public absen3: string = String.toString();
  public absen4: string = String.toString();
  public lokasi1: string = String.toString();
  public lokasi2: string = String.toString();
  public lokasi3: string = String.toString();
  public lokasi4: string = String.toString();
  public ket: string = String.toString();
  public lampiran: string = String.toString();

  constructor() { }
}
