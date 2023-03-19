import { EMouseState, Position, Size } from "./types";

export class GameObject {
  public position: Position;
  public worldPosition: Position;
  public children: GameObject[] = [];
  protected parent: GameObject | null = null;

  constructor(position: Position) {
    this.position = position;
    this.worldPosition = position;
  }

  draw() {}

  update() {
    this.computeWorldPos();
    this.draw();
    this.children.forEach(c => {
      c.update();
    });
  }

  computeWorldPos() {
    this.worldPosition = { ...this.position };
    if (this.parent) {
      this.worldPosition.x = this.parent.worldPosition.x + this.position.x;
      this.worldPosition.y = this.parent.worldPosition.y + this.position.y;
    }
  }

  isMouseIn(): boolean{
    return false;
  }


  addChildren(obj: GameObject) {
    this.children.push(obj);
    obj.parent = this;
  }

  removeChildren(obj: GameObject) {
    this.children.filter(c => c === obj);
  }

  moveToLast() {
    if (!this.parent) return;
    const idx = this.parent.children.findIndex(c => c === this);
    const last = this.parent.children.length - 1;
    let temp = this.parent.children[idx];
    this.parent.children[idx] = this.parent.children[last];
    this.parent.children[last] = temp;
  }
}

export class GCanvas {
  static w: number;
  static h: number;
  static ctx: CanvasRenderingContext2D;
  static Scene: GameObject = new GameObject({x: 0, y: 0});
  static curOpObj: GameObject | null = null

  constructor(canvas: HTMLCanvasElement) {
    GCanvas.w = canvas.width = window.innerWidth / 2;
    GCanvas.h = canvas.height = window.innerHeight / 2;
    GCanvas.ctx = canvas.getContext('2d')!;

    canvas.addEventListener('mousemove', (e) => {
      MouseState.mousePos = { x: e.clientX, y: e.clientY };
    })

    function handleMouseDown(obj: GameObject) {
      if (MouseState.curMouseObj) {
        return;
      }
      obj.children.forEach(c => handleMouseDown(c));
      if (obj.isMouseIn()) {
        MouseState.curMouseObj = obj;
      }
    }
    function handleMouseUp(obj: GameObject) {
      GCanvas.curOpObj = null;
      if (!(MouseState.curMouseObj instanceof OutPin)) {
        return;
      }
      obj.children.forEach(c => handleMouseUp(c));
      if (obj.isMouseIn() && obj instanceof InPin) {
        const outPin = MouseState.curMouseObj as OutPin;
        if (obj.lines.length) {
          obj.lines[0].removeSelf();
        }
        obj.value = outPin.value;
        obj.lines.push(outPin.curMovingLine!);
        outPin.curMovingLine!.end = obj;
      }
    }
    canvas.addEventListener('mousedown', () => {
      MouseState.mouseState = EMouseState.DOWN;
      // 找到点击的物体赋值给curMouseObj
      GCanvas.Scene.children.forEach(c => handleMouseDown(c))
    })
    canvas.addEventListener('mouseup', () => {
      MouseState.mouseState = EMouseState.UP;
      GCanvas.Scene.children.forEach(c => handleMouseUp(c));
      MouseState.curMouseObj = null;
      // 0.1s 后变为 normal，to optimize
      setTimeout(() => {
        MouseState.mouseState = EMouseState.NORMAL;
      }, 100);
    })
  }
}
export class GameLogic {
  static startGate: Gate | null = null;
  static endGate: Gate | null = null;

  static update() {
    if (!this.startGate || !this.endGate) {
      return;
    }

  }
}

export class MouseState {
  static mousePos: Position = { x: 0, y: 0 };
  static mouseState: EMouseState = EMouseState.NORMAL;
  static curMouseObj: null | GameObject = null; // 鼠标在哪个对象上按下
}

export class VisualObject extends GameObject {
  private drawFunc?: Function;

  constructor(position: Position = { x: 0, y: 0}, drawFunc?: Function) {
    super(position);
    this.drawFunc = drawFunc;
  }

  draw() {
    GCanvas.ctx.save();
    GCanvas.ctx.beginPath();
    GCanvas.ctx.translate(this.worldPosition.x, this.worldPosition.y);
    this.drawFunc?.();
    GCanvas.ctx.closePath();
    GCanvas.ctx.restore();
  }

  update() {
    super.update();
  }

  addChildren(obj: GameObject): void {
    super.addChildren(obj);
  }
}

export class MoveableObject extends VisualObject {
  private startMove: boolean = false;
  private startDisX: number = 0;
  private startDisY: number = 0;
  protected size: Size
  constructor(position: Position = { x: 0, y: 0}, size: Size = { width: 50, height: 50 }, drawFunc?: Function) {
    super(position, drawFunc);
    this.size = size;
  }

  isMouseIn() {
    const { x: mouseX, y: mouseY } = MouseState.mousePos;
    const { x, y } = this.worldPosition;
    const { width, height } = this.size;
    return mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;
  }

  move(x: number, y: number) {
    x = x - this.startDisX;
    y = y - this.startDisY;
    this.position.x = x;
    this.position.y = y;
  }

  update() {
    if (!this.startMove && MouseState.curMouseObj === this) {
      this.startMove = true;
      this.startDisX = MouseState.mousePos.x - this.position.x;
      this.startDisY = MouseState.mousePos.y - this.position.y;
      this.moveToLast();
    } else if (MouseState.mouseState === EMouseState.UP) {
      this.startMove = false;
    }
    if (this.startMove) {
      this.move(MouseState.mousePos.x, MouseState.mousePos.y);
    }
    super.update();
  }
}

export class Gate extends MoveableObject {
  public inPins: InPin[] = []
  public outPins: OutPin[] = []
  constructor(position: Position = { x: 0, y: 0}, size: Size = { width: 50, height: 50 }, drawFunc?: Function) {
    if (!drawFunc) {
      drawFunc = () => {
        GCanvas.ctx.fillStyle = 'skyblue';
        GCanvas.ctx.fillRect(0, 0, this.size.width, this.size.height);
      }
    }
    super(position, size, drawFunc);
    GCanvas.Scene.addChildren(this);
  }
  addPin(pin: Pin) {
    if (pin instanceof InPin) {
      this.inPins.push(pin);
    } else {
      this.outPins.push(pin as OutPin);
    }
    this.addChildren(pin);
    this.computeSizeAndPinPos();
  }
  computeSizeAndPinPos() {
    const computePinPos = (pins: Pin[], type: 'in' | 'out') => {
      const partLen = max / pins.length * part;
      pins.forEach((p, i) => {
        p.position.y = partLen * i + partLen / 2;
        p.position.x = type === 'in' ? 0 : this.size.width;
      });
    } 
    const max = Math.max(this.inPins.length, this.outPins.length);
    const min = Math.min(this.inPins.length, this.outPins.length);
    const part = 20;
    this.size.width = min === 0 ? 20 : 60;
    this.size.height = max * part;
    computePinPos(this.inPins, 'in');
    computePinPos(this.outPins, 'out');
  }
}

export abstract class Pin extends VisualObject {
  private color: string
  protected radius: number
  public lines: Line[] = [];
  public value: boolean = false;
  constructor(value: boolean = false, position: Position = { x: 0, y: 0}, radius: number = 5, drawFunc?: Function, color = 'pink') {
    if (!drawFunc) {
      drawFunc = () => {
        GCanvas.ctx.fillStyle = this.color ?? color;
        GCanvas.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        GCanvas.ctx.fill();
        // GCanvas.ctx.fillRect(x, y, this.size.width, this.size.height);
      }
    }
    super(position, drawFunc);
    this.radius = radius;
    this.color = color;
    this.value = value;
  }
  isMouseIn() {
    const { x: mouseX, y: mouseY } = MouseState.mousePos;
    const { x, y } = this.worldPosition;
    return (mouseY - y) * (mouseY - y) + (mouseX - x) * (mouseX - x) <= this.radius * this.radius;
  }
  update(): void {
    this.color = this.value ? 'green' : 'red';
    this.lines.forEach(l => {
      const idx = this instanceof OutPin ? 0 : l.paths.length -1;
      l.paths[idx] = this.worldPosition;
      l.update();
    });
    super.update();
  }
}

export class InPin extends Pin {
}

export class OutPin extends Pin {
  public isDrawingLine: boolean = false;
  public curMovingLine: Line | null = null;

  update() {
    if (!this.isDrawingLine && MouseState.curMouseObj === this) {
      this.isDrawingLine = true;
    } else if (MouseState.mouseState === EMouseState.UP) {
      this.isDrawingLine = false;
      this.curMovingLine = null;
    }
    if (this.isDrawingLine) {
      if (!this.curMovingLine) {
        this.curMovingLine = new Line();
        this.lines.push(this.curMovingLine);
        this.curMovingLine.start = this;
      }
      this.curMovingLine.paths = [this.worldPosition, MouseState.mousePos];
    }
    super.update();
  }
}

export class Line extends VisualObject {
  public paths: Position[] = [];
  private color: string;
  public start: OutPin | null = null;
  public end: InPin | null = null;
  constructor(position: Position = { x: 0, y: 0}, drawFunc?: Function, color = 'yellow') {
    if (!drawFunc) {
      drawFunc = () => {
        GCanvas.ctx.strokeStyle = this.color ?? color;
        GCanvas.ctx.lineWidth = 5;
        for (let i = 0; i < this.paths.length; i++) {
          const { x, y } = this.paths[i];
          if (i === 0) {
            GCanvas.ctx.moveTo(x, y);
          } else {
            GCanvas.ctx.lineTo(x, y);
          }
        }
        GCanvas.ctx.stroke();
      }
    }
    super(position, drawFunc);
    this.color = color;
  }
  removeSelf() {
    const idx1 = this.start!.lines.findIndex(l => l === this);
    idx1 >= 0 && this.start!.lines.splice(idx1, 1);
    const idx2 = this.end!.lines.findIndex(l => l === this);
    idx2 >= 0 && this.end!.lines.splice(idx2, 1);
    this.end!.value = false;
  }
}



