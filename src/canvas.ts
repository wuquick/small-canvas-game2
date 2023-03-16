import { EMouseState, Position } from "./types";

export class GCanvas {
  static w: number;
  static h: number;
  static mouseX: number;
  static mouseY: number;
  static mouseState: EMouseState = EMouseState.NORMAL;
  static ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    GCanvas.w = canvas.width = window.innerWidth / 2;
    GCanvas.h = canvas.height = window.innerHeight / 2;
    GCanvas.ctx = canvas.getContext('2d')!;

    canvas.addEventListener('mousemove', (e) => {
      [GCanvas.mouseX, GCanvas.mouseY] = [e.clientX, e.clientY];
    })
    canvas.addEventListener('mousedown', () => {
      GCanvas.mouseState = EMouseState.DOWN;
    })
    canvas.addEventListener('mouseup', () => {
      GCanvas.mouseState = EMouseState.UP;
      // 0.1s 后变为 normal，to optimize
      setTimeout(() => {
        GCanvas.mouseState = EMouseState.NORMAL;
      }, 100);
    })
  }
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