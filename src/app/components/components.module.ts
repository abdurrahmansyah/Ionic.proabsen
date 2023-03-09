import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KaryawanComponent } from './karyawan/karyawan.component';
import { BagianComponent } from './bagian/bagian.component';
import { JabatanComponent } from './jabatan/jabatan.component';
import { KantorComponent } from './kantor/kantor.component';
import { JamKerjaComponent } from './jam-kerja/jam-kerja.component';
import { AbsenComponent } from './absen/absen.component';

@NgModule({
  declarations: [KaryawanComponent, JamKerjaComponent, BagianComponent, JabatanComponent, KantorComponent, AbsenComponent],
  exports: [KaryawanComponent, JamKerjaComponent, BagianComponent, JabatanComponent, KantorComponent, AbsenComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule { }
