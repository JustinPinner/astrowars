import { Point2D } from '../lib/2d';

class Sprite {
  constructor(conf, x, y, imageService) {
      this.conf = conf;
      this.coordinates = new Point2D(x, y);
      this.width = this.conf.image ? this.conf.image.imageWidth : this.conf.sheet.frameWidth;
      this.height = this.conf.image ? this.conf.image.imageHeight : this.conf.sheet.frameHeight;
      this.frames = this.conf.sheet ? (this.conf.sheet.rows * this.conf.sheet.columns) : undefined;
      this.frame = (this.conf.sheet && this.conf.sheet.startFrame) ? 
                    this.conf.sheet.startFrame : 
                    0;
      this.imagePath = this.conf.image ? this.conf.image.path : this.conf.sheet.path;
      this.image = imageService.load(this.imagePath);
      this.columns = (this.conf.sheet && this.conf.sheet.columns) ?
                    this.conf.sheet.columns : 
                    1;
      this.rows = (this.conf.sheet && this.conf.sheet.rows) ?
                    this.conf.sheet.rows : 
                    1;
  }
}

export default Sprite;