import { GCanvas } from "./canvas";
import { Gate } from "./component/gate";

new GCanvas(document.querySelector('canvas')!)

const gate = new Gate({ x: 20, y: 20 });

timeLoop();

function timeLoop() {
  GCanvas.ctx.clearRect(0, 0, GCanvas.w, GCanvas.h);
  gate.update();
  requestAnimationFrame(timeLoop);
}
