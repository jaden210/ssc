import { Injectable } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { takeLast, flatMap, catchError, mergeMap } from "rxjs/operators";

@Injectable()
export class ImageService {
  constructor(private storage: AngularFireStorage) {}

  public uploadImage(image, path: string): any {
    let filePath = path;
    let ref = this.storage.ref(filePath);
    let task = this.storage.upload(filePath, image);
    return task.snapshotChanges().pipe(
      takeLast(1),
      mergeMap(() => ref.getDownloadURL()),
      catchError((error) => {
        console.error(`Error saving image for topic`, error);
        return error;
      })
    );
  }

  public uploadImageString(image, path: string): any {
    let filePath = path;
    let ref = this.storage.ref(filePath);
    let task = ref.putString(image, 'data_url');
    return task.snapshotChanges().pipe(
      takeLast(1),
      mergeMap(() => ref.getDownloadURL()),
      catchError((error) => {
        console.error(`Error saving image for topic`, error);
        return error;
      })
    );
  }

  public resampleImage(
    image: HTMLImageElement,
    fileType: string,
    maxDimensionPx: number
  ): Promise<{ blob: Blob; height: number; width: number }> {
    const widthSource: number = image.width;
    const heightSource: number = image.height;

    let width = image.width;
    let height = image.height;
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);

    let scaleFactor;
    if (height > maxDimensionPx) {
      scaleFactor = maxDimensionPx / height;
      height = maxDimensionPx;
      width = width * scaleFactor;
    } else if (width > maxDimensionPx) {
      scaleFactor = maxDimensionPx / width;
      width = maxDimensionPx;
      height = height * scaleFactor;
    }

    width = Math.round(width);
    height = Math.round(height);

    var ratio_w = widthSource / width;
    var ratio_h = heightSource / height;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    // var ctx = canvas.getContext("2d");
    var img = ctx.getImageData(0, 0, widthSource, heightSource);
    var img2 = ctx.createImageData(width, height);
    var data = img.data;
    var data2 = img2.data;

    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++) {
        var x2 = (i + j * width) * 4;
        var weight = 0;
        var weights = 0;
        var weights_alpha = 0;
        var gx_r = 0;
        var gx_g = 0;
        var gx_b = 0;
        var gx_a = 0;
        var center_y = (j + 0.5) * ratio_h;
        var yy_start = Math.floor(j * ratio_h);
        var yy_stop = Math.ceil((j + 1) * ratio_h);
        for (var yy = yy_start; yy < yy_stop; yy++) {
          var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
          var center_x = (i + 0.5) * ratio_w;
          var w0 = dy * dy; //pre-calc part of w
          var xx_start = Math.floor(i * ratio_w);
          var xx_stop = Math.ceil((i + 1) * ratio_w);
          for (var xx = xx_start; xx < xx_stop; xx++) {
            var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
            var w = Math.sqrt(w0 + dx * dx);
            if (w >= 1) {
              //pixel too far
              continue;
            }
            //hermite filter
            weight = 2 * w * w * w - 3 * w * w + 1;
            var pos_x = 4 * (xx + yy * widthSource);
            //alpha
            gx_a += weight * data[pos_x + 3];
            weights_alpha += weight;
            //colors
            if (data[pos_x + 3] < 255)
              weight = (weight * data[pos_x + 3]) / 250;
            gx_r += weight * data[pos_x];
            gx_g += weight * data[pos_x + 1];
            gx_b += weight * data[pos_x + 2];
            weights += weight;
          }
        }
        data2[x2] = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights_alpha;
      }
    }
    canvas.width = width;
    canvas.height = height;

    //draw
    ctx.putImageData(img2, 0, 0);

    return new Promise((resolve) =>
      ctx.canvas.toBlob((blob) => {
        resolve({ blob, height, width });
      }, fileType)
    );
  }
}
