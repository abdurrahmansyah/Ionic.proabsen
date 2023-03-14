// import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { GlobalService } from './global.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import write_blob from 'capacitor-blob-writer';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(
    private loadingCtrl: LoadingController,
    private globalService: GlobalService,
    // private datePipe: DatePipe
  ) { }

  // CreateExcel() {
  //   let workbook = new Workbook();
  //   let worksheet = workbook.addWorksheet('Car Data');

  //   const title = 'Car Sell Report';
  //   const header = ["Year", "Month", "Make", "Model", "Quantity", "Pct"]
  //   const data = [
  //     [2007, 1, "Volkswagen ", "Volkswagen Passat", 1267, 10],
  //     [2007, 1, "Toyota ", "Toyota Rav4", 819, 6.5],
  //     [2007, 1, "Toyota ", "Toyota Avensis", 787, 6.2],
  //     [2007, 1, "Volkswagen ", "Volkswagen Golf", 720, 5.7],
  //     [2007, 1, "Toyota ", "Toyota Corolla", 691, 5.4],
  //   ];

  //   // Add new row
  //   let titleRow = worksheet.addRow([title]);
  //   // Set font, size and style in title row.
  //   titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true };
  //   // Blank Row
  //   worksheet.addRow([]);
  //   //Add row with current date
  //   let subTitleRow = worksheet.addRow(['Date : ' + this.datePipe.transform(new Date(), 'medium')]);

  // }

  async exportListAsExcelJS(exportOptions: { fileName: string; worksheetname: string; title: string; header: string[]; data: any[][]; }) {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'circles',
    });
    loading.present();

    const { fileName, worksheetname, title, header, data } = exportOptions;
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(worksheetname);

    // Add new row
    let titleRow = worksheet.addRow([title]);
    // Set font, size and style in title row.
    titleRow.font = {
      name: 'Comic Sans MS',
      family: 4,
      size: 16,
      underline: 'double',
      bold: true,
    };
    // Blank Row
    worksheet.addRow([]);
    //Add row with current date
    let subTitleRow = worksheet.addRow([
      // 'Date : ' + this.datePipe.transform(new Date(), 'medium'),
      'Date : ' + "today",
    ]);

    worksheet.mergeCells('A1:D2');

    let headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    data.forEach((d) => {
      let row = worksheet.addRow(d);
      let qty = row.getCell(5);
      let color = 'FF99FF99';
      if (qty.value !== undefined && qty.value !== null) {
        if (+qty.value < 500) {
          color = 'FF9999';
        }
      }
      qty.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
      };
    });

    this.globalService.PresentAlert("data file excel: " + JSON.stringify(data));

    workbook.xlsx.writeBuffer().then(async (data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      this.globalService.PresentAlert("data blob: " + JSON.stringify(blob));

      // (FAILED)
      // await Filesystem.writeFile({ 
      //   path: 'secrets/text.txt',
      //   data: "This is a test",
      //   directory: Directory.Documents,
      //   encoding: Encoding.UTF8,
      // });

      // (FAILED)
      // fs.saveAs(blob, 'CarData.xlsx');

      // (TDK BISA UTK MOBILE)
      // workbook.xlsx.writeBuffer().then((data) => {
      //   let blob = new Blob([data], {
      //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      //   });
      //   this.blobToSaveAs(fileName, blob);
      // });

      write_blob({
        path: 'Bismillah.xlsx',
        directory: Directory.Documents,
        blob: blob
      }).then((res) => {
        this.globalService.PresentAlert("Alhamdulillah berhasil ges: " + res);
      }).catch((er) => {
        this.globalService.PresentAlert("ERR saat write blob: " + JSON.stringify(er));
      })
      loading.dismiss();
    }).catch(er => {
      loading.dismiss();
      this.globalService.PresentAlert("error Download: " + JSON.stringify(er));
    });
  }

  blobToSaveAs(fileName: string, blob: Blob) {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // feature detection
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error('BlobToSaveAs error', e);
    }
  }
}
