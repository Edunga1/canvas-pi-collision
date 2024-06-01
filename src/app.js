class Canvas {
  constructor(document, container, canvas, width, height) {
    this.document = document
    this.container = container
    this.canvas = canvas
    this.container.appendChild(this.canvas)
    this.context = this.canvas.getContext("2d")

    this.resize(width, height)
  }

  resize(width, height) {
    this.canvas.width = width
    this.canvas.height = height
  }


  addRect(x, y, width, height, color, text = '') {
    this.context.fillStyle = color || "black"
    this.context.fillRect(x, y, width, height)
    this.context.fillStyle = "black"
    this.context.font = "10px Arial"
    this.context.fillText(text, x, y + height / 2)
  }

  addText(text, x, y, size = 20) {
    this.context.fillStyle = "white"
    this.context.font = `${size}px Arial`
    this.context.fillText(text, x, y)
  }

  draw(func) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = "black"
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.save()
    func(this)
    this.context.restore()
  }
}

class Timer {
  constructor() {
    this.tps = 1000 / 60
    this.lastTime = 0
    this.elapsed = 0
    this.tickCount = 0
  }

  elapse(time) {
    this.elapsed += time - this.lastTime
    this.lastTime = time
  }

  tick(func) {
    while (this.elapsed >= this.tps) {
      func()
      this.elapsed -= this.tps
      this.tickCount++
    }
  }
}

class World {
  constructor({
    canvas,
    entity1 = {
      mass: 1,
    },
    entity2 = {
      mass: 1,
    },
  }) {
    this.canvas = canvas
    this.entities = []
    this.count = 0
    this.resetHandler = undefined
    this.entity1 = entity1
    this.entity2 = entity2
  }

  run() {
    const that = this
    const timer = new Timer()
    this.#reset()

    requestAnimationFrame(function tick(time) {
      timer.elapse(time)
      timer.tick(() => {
        that.#update()
      })
      that.#render()
      requestAnimationFrame(tick)
    })
  }

  resize(width, height) {
    this.canvas.resize(width, height)
  }

  startReset() {
    this.resetTimer = setTimeout(() => {
      this.#reset()
    }, 1000)
  }

  clearReset() {
    clearTimeout(this.resetTimer)
  }

  #reset() {
    this.entities = [
      { x: 150, y: 200, w: 50, h: 50, m: this.entity1.mass, v: 0, cl: "red" },
      { x: 300, y: 200, w: 50, h: 50, m: this.entity2.mass, v: -1, cl: "green" },
    ]
    this.count = 0
  }

  #update() {
    this.#retriveEntities((a, b) => {
      if (this.#checkCollision(a, b)) {
        this.#increaseCollisionCount()
        const [v1, v2] = this.#calculateNewVelocities(a, b)
        a.v = v1
        b.v = v2
      }

      // check borders
      if (a.x < 0) {
        this.#increaseCollisionCount()
        a.x = 0
        a.v *= -1
      }
    })
    this.entities.forEach((entity) => {
      entity.x += entity.v
    })
  }

  #retriveEntities(func) {
    const size = this.entities.length
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        func(this.entities[i], this.entities[j])
      }
    }
  }

  #checkCollision(a, b) {
    if (a.x > b.x + b.w || a.x + a.w < b.x) return false
    if (a.y > b.y + b.h || a.y + a.h < b.y) return false
    return true
  }

  #calculateNewVelocities(a, b) {
    // https://en.wikipedia.org/wiki/Elastic_collision#One-dimensional_Newtonian
    return [
      (a.m - b.m) / (a.m + b.m) * a.v + (2 * b.m) / (a.m + b.m) * b.v,
      (2 * a.m) / (a.m + b.m) * a.v + (b.m - a.m) / (a.m + b.m) * b.v
    ]
  }


  #render() {
    this.canvas.draw((canvas) => {
      canvas.addText(`Count: ${this.count}`, 10, 20)
      this.entities.forEach((entity) => {
        canvas.addRect(
          entity.x,
          entity.y,
          entity.w,
          entity.h,
          entity.cl,
          `${entity.m}m  ${entity.v.toFixed(2)}v`
        )
      })
    })
  }

  #increaseCollisionCount() {
    this.count++
  }
}

function main() {
  const canvasEle = document.createElement("canvas")
  const canvas = new Canvas(document, document.body, canvasEle, window.innerWidth, window.innerHeight)
  const params = new URLSearchParams(window.location.search)
  const world = new World({
    canvas,
    entity1: {
      mass: params.get("m1") ?? 1,
    },
    entity2: {
      mass: params.get("m2") ?? 64,
    },
  })
  world.run()

  window.addEventListener("resize", () => {
    world.resize(window.innerWidth, window.innerHeight)
  })

  window.addEventListener("mousedown", () => {
    world.startReset()
  })

  window.addEventListener("mouseup", () => {
    world.clearReset()
  })

  window.addEventListener("touchstart", () => {
    world.startReset()
  })

  window.addEventListener("touchend", (e) => {
    world.clearReset()
    e.preventDefault()
  })
}

main()
