import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AbsenData, BagianData, GlobalService, JabatanData, JamKerjaData, KantorData, KaryawanData, KehadiranData, LeaderboardData } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // Master Data
  public karyawanDataListCollection: AngularFirestoreCollection<KaryawanData>;
  public jamKerjaDataListCollection: AngularFirestoreCollection<JamKerjaData>;
  public bagianDataListCollection: AngularFirestoreCollection<BagianData>;
  public jabatanDataListCollection: AngularFirestoreCollection<JabatanData>;
  public kantorDataListCollection: AngularFirestoreCollection<KantorData>;
  public karyawanDataList: Observable<KaryawanData[]>;
  public jamKerjaDataList: Observable<(JamKerjaData & { id: string; })[]>;
  public bagianDataList: Observable<BagianData[]>;
  public jabatanDataList: Observable<JabatanData[]>;
  public kantorDataList: Observable<KantorData[]>;

  // Transaksi Data
  public absenDataListCollection: AngularFirestoreCollection<AbsenData>;
  public absenDataList: Observable<(AbsenData & { id: string; })[]>;
  public absenDataListForleaderboardCollection: AngularFirestoreCollection<AbsenData>;
  public absenDataListForleaderboard: Observable<(AbsenData & { id: string; })[]>;
  // public leaderboardDataListCollection: AngularFirestoreCollection<AbsenData>;
  public leaderboardDataList: LeaderboardData[] = [];

  constructor(
    private afs: AngularFirestore,
    private globalService: GlobalService
  ) {
    this.karyawanDataListCollection = this.afs.collection<KaryawanData>('karyawan', ref => ref.orderBy('namaKaryawan'));
    this.jamKerjaDataListCollection = this.afs.collection<JamKerjaData>('jamKerja');
    this.bagianDataListCollection = this.afs.collection<BagianData>('bagian');
    this.jabatanDataListCollection = this.afs.collection<JabatanData>('jabatan');
    this.kantorDataListCollection = this.afs.collection<KantorData>('kantor');
    this.karyawanDataList = this.karyawanDataListCollection.valueChanges({ idField: 'id' });
    this.jamKerjaDataList = this.jamKerjaDataListCollection.valueChanges({ idField: 'id' });
    this.bagianDataList = this.bagianDataListCollection.valueChanges({ idField: 'id' });
    this.jabatanDataList = this.jabatanDataListCollection.valueChanges({ idField: 'id' });
    this.kantorDataList = this.kantorDataListCollection.valueChanges({ idField: 'id' });
    this.karyawanDataList.subscribe(karyawanDataList => {
      this.globalService.karyawanDataList = karyawanDataList;
    });
    this.jamKerjaDataList.subscribe(jamKerjaDataList => {
      this.globalService.jamKerjaDataList = jamKerjaDataList;
    });
    this.bagianDataList.subscribe(bagianDataList => {
      this.globalService.bagianDataList = bagianDataList;
    });
    this.jabatanDataList.subscribe(jabatanDataList => {
      this.globalService.jabatanDataList = jabatanDataList;
    });
    this.kantorDataList.subscribe(kantorDataList => {
      this.globalService.kantorDataList = kantorDataList;
    });

    this.absenDataListCollection = this.afs.collection<AbsenData>('absen', ref => ref.orderBy('tanggal').orderBy('absen1'));
    this.absenDataList = this.absenDataListCollection.valueChanges({ idField: 'id' });
    this.absenDataList.subscribe(absenDataList => {
      this.globalService.absenDataList = absenDataList;
    });

    this.InitializeLeaderboardData();
  }

  private InitializeLeaderboardData() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var tanggal = year + '-' + month + '-' + day;
    // tanggal = "2023-02-06";

    this.absenDataListForleaderboardCollection = this.afs.collection<AbsenData>('absen', ref => ref.where('tanggal', '==', tanggal).where('kehadiran', '==', this.globalService.kehadiranData.Hadir).orderBy('absen1'));
    this.absenDataListForleaderboard = this.absenDataListForleaderboardCollection.valueChanges({ idField: 'id' });
    this.absenDataListForleaderboard.subscribe(absenDataListForleaderboard => {
      this.leaderboardDataList = [];
      var index = 0;
      absenDataListForleaderboard.forEach((absenData: AbsenData) => {
        index += 1;
        var karyawanData = this.globalService.karyawanDataList.filter((x: any) => { return x.idKaryawan === absenData.idKaryawan; }).find((x: any) => x != undefined);
        var leaderboardData: LeaderboardData = {
          idKaryawan: absenData.idKaryawan,
          namaKaryawan: karyawanData.namaKaryawan,
          bagian: karyawanData.bagian,
          jabatan: karyawanData.jabatan,
          photoURL: karyawanData.photoURL,
          tanggal: absenData.tanggal,
          bulan: absenData.bulan,
          kehadiran: absenData.kehadiran,
          absen1: absenData.absen1,
          absen2: absenData.absen2,
          absen3: absenData.absen3,
          absen4: absenData.absen4,
          lokasi1: absenData.lokasi1,
          lokasi2: absenData.lokasi2,
          lokasi3: absenData.lokasi3,
          lokasi4: absenData.lokasi4,
          ket: absenData.ket,
          lampiran: absenData.lampiran,
        };
        if (index <= 4) this.leaderboardDataList.push(leaderboardData);
      });
    });
  }
}
