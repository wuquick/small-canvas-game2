import { Gate, InPin, OutPin } from "../canvas";
import { Position } from "../types";

export class AndGate extends Gate {
  constructor(position: Position) {
    super(position);
    const inPin1 = new InPin();
    const inPin2 = new InPin();
    const outPin = new OutPin();
    this.addPin(inPin1);
    this.addPin(inPin2);
    this.addPin(outPin);
  }

  judge() {
    this.outPins[0].value = this.inPins[0].value && this.inPins[1].value;
  }

  update() {
    this.judge();
    super.update();
  }
}

export class NotGate extends Gate {
  constructor(position: Position) {
    super(position);
    const inPin1 = new InPin();
    const outPin = new OutPin();
    this.addPin(inPin1);
    this.addPin(outPin);
  }

  judge() {
    this.outPins[0].value = !this.inPins[0].value;
  }

  update() {
    this.judge();
    super.update();
  }
}

export class JointGate extends Gate {
  constructor(position: Position) {
    super(position);
    const inPin1 = new InPin();
    const inPin2 = new InPin();
    const outPin = new OutPin();
    this.addPin(inPin1);
    this.addPin(inPin2);
    this.addPin(outPin);
  }

  judge() {
    this.outPins[0].value = this.inPins[0].value || this.inPins[1].value;
  }

  update() {
    this.judge();
    super.update();
  }
}