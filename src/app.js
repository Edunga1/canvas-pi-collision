class Canvas {
  constructor(document, container, width, height) {
    this.document = document
    this.container = container
    this.canvas = this.#createCanvas(width, height)
    this.container.appendChild(this.canvas)
    this.context = this.canvas.getContext("2d")
  }

  #createCanvas(width, height) {
    const canvas = this.document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    return canvas
  }

  addRect(x, y, width, height, color) {
    this.context.fillStyle = color || "black"
    this.context.fillRect(x, y, width, height)
  }

  draw(func) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.save()
    func(this)
    this.context.restore()
  }
}

class World {
  constructor(canvas) {
    this.canvas = canvas
    this.entities = [
      {x: 10, y: 10, width: 50, height: 50, velocity: {x: 1, y: 0}, color: "red"},
      {x: 300, y: 10, width: 50, height: 50, velocity: {x: -1, y: 0}, color: "green"},
    ]
  }

  #update() {
    this.entities.forEach((entity) => {
      entity.x += entity.velocity.x
      entity.y += entity.velocity.y
      if (entity.x < 0 || entity.x > this.canvas.canvas.width) {
        entity.velocity.x *= -1
      }
      if (entity.y < 0 || entity.y > this.canvas.canvas.height) {
        entity.velocity.y *= -1
      }
    })
  }

  #render() {
    this.canvas.draw((canvas) => {
      this.entities.forEach((entity) => {
        canvas.addRect(entity.x, entity.y, entity.width, entity.height, entity.color)
      })
    })
  }

  run() {
    const that = this
    requestAnimationFrame(function tick() {
      that.#update()
      that.#render()
      requestAnimationFrame(tick)
    })
  }
}

function main() {
  const canvas = new Canvas(document, document.body, 500, 500)
  new World(canvas).run()
}

main()
