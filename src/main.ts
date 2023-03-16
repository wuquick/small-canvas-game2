import { GCanvas, Pin } from "./canvas";
import { Gate } from "./canvas";

new GCanvas(document.querySelector('canvas')!)

const gate = new Gate({ x: 20, y: 20 });
const pin = new Pin({ x: 0, y: 0 });
gate.addPin(pin);

timeLoop();

function timeLoop() {
  GCanvas.ctx.clearRect(0, 0, GCanvas.w, GCanvas.h);
  console.log('clear over');
  gate.update();
  requestAnimationFrame(timeLoop);
}
