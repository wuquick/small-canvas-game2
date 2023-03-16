import { EMouseState, Position, Size } from "./types";

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

export class GameObject {
  public position: Position
  protected children: GameObject[] = [];
  protected parent: GameObject | null = null;

  constructor(position: Position) {
    this.position = position;
  }

  draw() {}

  update() {
    this.draw();
    this.children.forEach(c => {
      c.update();
    });
  }

  computePosition() {
    let parent = this.parent;
    while (parent) {
      this.position.x += parent.position.x;
      this.position.y += parent.position.y;
      parent = parent.parent;
    }
  }

  addChilden(obj: GameObject) {
    this.children.push(obj);
    obj.parent = this;
    obj.computePosition();
  }
  removeChildren(obj: GameObject) {
    this.children.filter(c => c === obj);
  }
}

export class VisualObject extends GameObject {
  protected size: Size;
  private drawFunc?: Function;

  constructor(position: Position = { x: 0, y: 0}, size: Size = { width: 50, height: 50 }, drawFunc?: Function) {
    super(position);
    this.size = size;
    this.drawFunc = drawFunc;
  }

  draw() {
    GCanvas.ctx.save();
    this.drawFunc?.();
    GCanvas.ctx.restore();
  }

  update() {
    super.update();
  }

  addChilden(obj: GameObject): void {
    super.addChilden(obj);
  }
}

export class MoveableObject extends VisualObject {
  private startMove: boolean = false;
  private startDisX: number = 0;
  private startDisY: number = 0;
  constructor(position: Position = { x: 0, y: 0}, size: Size = { width: 50, height: 50 }, drawFunc?: Function) {
    super(position, size, drawFunc);
  }

  isMouseIn() {
    const { mouseX, mouseY } = GCanvas;
    const { x, y } = this.position;
    const { width, height } = this.size;
    return mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;
  }

  move(x: number, y: number) {
    let { x: oldX, y: oldY } = this.position;
    x = x - this.startDisX;
    y = y - this.startDisY;
    if (x !== oldX && y !== oldY) {
      this.position = { x, y };
      // this.children.forEach(c => c.computePosition());
    }
  }

  update() {
    if (!this.startMove && this.isMouseIn() && GCanvas.mouseState === EMouseState.DOWN) {
      this.startMove = true;
      this.startDisX = GCanvas.mouseX - this.position.x;
      this.startDisY = GCanvas.mouseY - this.position.y;
    } else if (GCanvas.mouseState === EMouseState.UP) {
      this.startMove = false;
    }
    if (this.startMove) {
      this.move(GCanvas.mouseX, GCanvas.mouseY);
    }
    super.update();
  }
}

export class Gate extends MoveableObject {
  public pins: Pin[] = []
  constructor(position: Position = { x: 0, y: 0}, size: Size = { width: 50, height: 50 }, drawFunc?: Function) {
    if (!drawFunc) {
      drawFunc = () => {
        const { x, y } = this.position;
        GCanvas.ctx.fillStyle = 'skyblue';
        GCanvas.ctx.fillRect(x, y, this.size.width, this.size.height);
      }
    }
    super(position, size, drawFunc);
  }
  addPin(pin: Pin) {
    this.pins.push(pin);
    this.addChilden(pin);
  }
}

export class Pin extends VisualObject {
  private color: string
  constructor(position: Position = { x: 0, y: 0}, size: Size = { width: 5, height: 5 }, drawFunc?: Function, color = 'pink') {
    if (!drawFunc) {
      drawFunc = () => {
        const { x, y } = this.position;
        GCanvas.ctx.fillStyle = this.color ?? color;
        GCanvas.ctx.arc(x, y, this.size.width, 0, 2 * Math.PI);
        GCanvas.ctx.fill();
        // GCanvas.ctx.fillRect(x, y, this.size.width, this.size.height);
      }
    }
    super(position, size, drawFunc);
    this.color = color;
  }
}



