import { GCanvas } from "../canvas"
import { EMouseState, Position } from "../types";

export class Gate {
  // private inPins: Pin[]
  // private outPins: Pin[]
  private sprite: Sprite;
  private width: number = 50;
  private height: number = 50;
  private startMove: boolean = false;
  private startDisX: number = 0;
  private startDisY: number = 0;

  constructor(position: Position) {
    this.sprite = new Sprite(position);
    this.draw();
  }

  draw() {
    const drawInner = () => {
      const { x, y } = this.sprite.position;
      GCanvas.ctx.fillStyle = 'skyblue';
      GCanvas.ctx.fillRect(x, y, this.width, this.height);
    }
    this.sprite.draw(drawInner);
  }

  update() {
    if (!this.startMove && this.isMouseIn() && GCanvas.mouseState === EMouseState.DOWN) {
      this.startMove = true;
      this.startDisX = GCanvas.mouseX - this.sprite.position.x;
      this.startDisY = GCanvas.mouseY - this.sprite.position.y;
    } else if (GCanvas.mouseState === EMouseState.UP) {
      this.startMove = false;
    }
    if (this.startMove) {
      this.move(GCanvas.mouseX, GCanvas.mouseY);
    }
    this.draw();
  }

  isMouseIn() {
    const { mouseX, mouseY } = GCanvas;
    const { x, y } = this.sprite.position;
    return mouseX > x && mouseX < x + this.width && mouseY > y && mouseY < y + this.height;
  }

  move(x: number, y: number) {
    x = x - this.startDisX;
    y = y - this.startDisY;
    this.sprite.position = { x, y };
  }

  compute() {}
}

export class Pin {

}

export class Line {
  private startPin: Pin
  private endPin: Pin

  
}


export class Sprite {
  position: Position
  
  constructor(position: Position) {
    this.position = position;
  }

  draw(drawCallback: Function) {
    GCanvas.ctx.save();
    drawCallback();
    GCanvas.ctx.restore();
  }
}