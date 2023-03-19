import { GCanvas, InPin, OutPin } from "./canvas";
import { Gate } from "./canvas";
import { AndGate, JointGate, NotGate } from "./gates/AndGate";


new GCanvas(document.querySelector('canvas')!)

const gate = new Gate({ x: 20, y: 20 });
const pin4 = new OutPin(true);
const pin5 = new OutPin(false);
gate.addPin(pin4);
gate.addPin(pin5);

// const gate_2 = new Gate({ x: 200, y: 20 });
// const pin_2 = new InPin();
// const pin2_2 = new InPin();
// const pin4_2 = new OutPin();
// gate_2.addPin(pin_2);
// gate_2.addPin(pin2_2);
// gate_2.addPin(pin4_2);

const gate2 = new AndGate({ x: 200, y: 20 });
new NotGate({ x: 400, y: 20 });
new JointGate({ x: 400, y: 220 })


timeLoop();

function timeLoop() {
  GCanvas.ctx.clearRect(0, 0, GCanvas.w, GCanvas.h);
  GCanvas.Scene.update();
  requestAnimationFrame(timeLoop);
}
