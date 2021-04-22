// Mouse Class //
class Mouse {
  constructor(element) {
    this.element = element || window;
    this.drag = false;
    this.x;
    this.y;
    this.reset();
    this.events = ["mouseenter", "mousemove"];
    this.events.forEach((eventName) => {
      this.element.addEventListener(eventName, this.getCoordinates);
    });
    this.element.addEventListener("mousedown", () => {
      this.drag = true;
    });
    this.element.addEventListener("mouseup", () => {
      this.drag = false;
    });
  }
  reset = () => {
    this.x =
      ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
    this.y =
      ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
  };
  getCoordinates = (event) => {
    event.preventDefault();
    const x = event.pageX;
    const y = event.pageY;
    if (this.drag) {
      this.x = x;
      this.y = y;
    }
  };
  pointer = () => {
    return {
      x: this.x,
      y: this.y,
      z: this.drag,
    };
  };
}

export default Mouse;
