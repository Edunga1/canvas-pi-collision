class Canvas {
  constructor(document, container, width, height) {
    this.document = document
    this.container = container
    this.canvas = this.#createCanvas(width, height)
    this.container.appendChild(this.canvas)
    this.context = this.canvas.getContext("2d")
  }

  get height() {
    return this.canvas.height
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

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(other) {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  mul(factor) {
    return new Vector(this.x * factor, this.y * factor)
  }
}

class World {
  constructor(canvas) {
    this.canvas = canvas
    this.entities = [
      {x: 150, y: 10, w: 50, h: 50, m: 1, v: new Vector(0, 0), cl: "red"},
      {x: 300, y: 10, w: 50, h: 50, m: 10, v: new Vector(-1, 0), cl: "green"},
    ]
  }

  #update() {
    this.entities.forEach((entity) => {
      this.entities.forEach((other) => {
        if (entity === other) {
          return
        }
        if (entity.x < other.x + other.w &&
            entity.x + entity.w > other.x &&
            entity.y < other.y + other.h &&
            entity.y + entity.h > other.y) {
          const entityNewV = entity.v.mul((entity.m - other.m) / (entity.m + other.m)).add(other.v.mul((2 * other.m) / (entity.m + other.m)))
          const otherNewV = entity.v.mul((2 * other.m) / (entity.m + other.m)).add(other.v.mul((other.m - entity.m) / (entity.m + other.m)))
          entity.v = entityNewV
          other.v = otherNewV
        }
        // check walls
        if (entity.x < 0) {
          entity.x = 0
          entity.v.x *= -1
        }
      })
      entity.x += entity.v.x
      entity.y += entity.v.y
    })
  }

  #render() {
    this.canvas.draw((canvas) => {
      this.entities.forEach((entity) => {
        canvas.addRect(entity.x, entity.y, entity.w, entity.h, entity.cl)
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
