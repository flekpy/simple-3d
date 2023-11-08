function main() {
  const context = document.getElementById('canvas').getContext('2d')
  const imageData = context.createImageData(800, 600)

  const drawer = new Drawer(imageData.data, imageData.width, imageData.height)

  const vertices = [
    new Vector(-0.5, 1, 0.5),
    new Vector(-0.5, 1, -0.5),
    new Vector(0.5, 1, -0.5),
    new Vector(0.5, 1, 0.5),
    new Vector(-1, -1, 1),
    new Vector(-1, -1, -1),
    new Vector(1, -1, -1),
    new Vector(1, -1, 1),
  ]

  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],

    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
  ]


  let angle = 0
  setInterval(() => {
    let matrix = Matrix.getRotationX(0)

    matrix = Matrix.multiply(
      Matrix.getRotationY(angle += 1),
      matrix
    )

    matrix = Matrix.multiply(
      Matrix.getScale(100, 100, 100),
      matrix
    )

    matrix = Matrix.multiply(
      Matrix.getTranslation(0, 0, -300),
      matrix 
    )

    matrix = Matrix.multiply(
      Matrix.getLookAt(
        // new Vector(0, 0, 0),
        // new Vector(0, 0, -1),
        cameraPos,
        Vector.add(cameraPos, cameraDirection),
        new Vector(0, 1, 0),
      ),
      matrix
    )

    matrix = Matrix.multiply(
      Matrix.getPerspectiveProjection(
        90, 800 / 600,
        -1, -1000
      ),
      matrix
    )

    const sceneVertices = []
    for (let i = 0; i < vertices.length; i++) {
      let vertex = Matrix.multiplyVector(
        matrix,
        vertices[i]
      )

      vertex.x = (vertex.x / vertex.w * 400)
      vertex.y = (vertex.y / vertex.w * 300)
      sceneVertices.push(vertex)
    }

    drawer.clearSurface()

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]

      drawer.drawLine(
        sceneVertices[e[0]].x,
        sceneVertices[e[0]].y,
        sceneVertices[e[1]].x,
        sceneVertices[e[1]].y,
        255, 0, 0
      )
    }

    // const center = new Vector(400, -300, 0)
    // drawer.drawLine(
    //   center.x, center.y, 
    //   center.x, center.y + 200, 
    //   150, 150, 150
    // )
    // drawer.drawLine(
    //   center.x, center.y, 
    //   center.x + 200, center.y, 
    //   150, 150, 150
    // )
    //
    // const zVector = new Vector(-1, -1, 0)
    // const zCoords = Vector.add(center, zVector.normalize().multiplyByScalar(150))
    // drawer.drawLine(
    //   center.x, center.y, 
    //   zCoords.x, zCoords.y, 
    //   150, 150, 150
    // )

    context.putImageData(imageData, 0, 0)
  }, 100)
}

class Drawer {
  surface = null 
  width = 0 
  height = 0

  constructor(surface, width, height) {
    this.surface = surface
    this.width = width 
    this.height = height
  }

  drawPixel(x, y, r, g, b) {
    x += this.width / 2
    y = -(y - this.height / 2)
    const offset = (this.width * y + x) * 4

    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.surface[offset] = r
      this.surface[offset + 1] = g
      this.surface[offset + 2] = b
      this.surface[offset + 3] = 255
    }
  }

  clearSurface() {
    const surfaceSize = this.width * this.height * 4
    for (let i = 0; i < surfaceSize; i++) {
      this.surface[i] = 0
    }
  }

  drawLine(x1, y1, x2, y2, r = 0, g = 0, b = 0) {
    const round = Math.trunc;
    x1 = round(x1);
    y1 = round(y1);
    x2 = round(x2);
    y2 = round(y2);

    const c1 = y2 - y1;
    const c2 = x2 - x1;

    const length = Math.max(
      Math.abs(c1),
      Math.abs(c2)
    );

    const xStep = c2 / length;
    const yStep = c1 / length;

    for (let i = 0 ; i <= length ; i++) {
      this.drawPixel(
        Math.trunc(x1 + xStep * i),
        Math.trunc(y1 + yStep * i),
        r, g, b,
      );
    }
  }
}

class Vector {
  x = 0
  y = 0
  z = 0
  w = 0

  constructor(x, y, z, w = 1) {
    this.x = x 
    this.y = y 
    this.z = z 
    this.w = w 
  }

  static crossProduct(v1, v2) {
    return new Vector(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x,
    )
  }

  static substruct(v1, v2) {
    return new Vector(
      v1.x - v2.x,
      v1.y - v2.y,
      v1.z - v2.z,
    )
  }

  static add(v1, v2) {
    return new Vector(
      v1.x + v2.x,
      v1.y + v2.y,
      v1.z + v2.z,
    )
  }

  getLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  normalize() {
    const length = this.getLength()

    this.x /= length
    this.y /= length
    this.z /= length

    return this
  }

  multiplyByScalar(s) {
    this.x *= s
    this.y *= s
    this.z *= s

    return this
  }
}

class Matrix {
  static multiply(a, b) {
    const m = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        m[i][j] = a[i][0] * b[0][j] +
          a[i][1] * b[1][j] +
          a[i][2] * b[2][j] +
          a[i][3] * b[3][j]
      }
    }

    return m
  }

  static multiplyVector(m, v) {
    return new Vector(
      m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z + m[0][3] * v.w,
      m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z + m[1][3] * v.w,
      m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z + m[2][3] * v.w,
      m[3][0] * v.x + m[3][1] * v.y + m[3][2] * v.z + m[3][3] * v.w,
    )
  }

  static getTranslation(dx, dy, dz) {
    return [
      [1, 0, 0, dx],
      [0, 1, 0, dy],
      [0, 0, 1, dz],
      [0, 0, 0, 1],
    ]
  }

  static getScale(sx, sy, sz) {
    return [
      [sx, 0, 0, 0],
      [0, sy, 0, 0],
      [0, 0, sz, 0],
      [0, 0, 0, 1],
    ]
  }

  static getRotationX(angle) {
    const rad = Math.PI / 180 * angle
    return [
      [1, 0, 0, 0],
      [0, Math.cos(rad), -Math.sin(rad), 0],
      [0, Math.sin(rad), Math.cos(rad), 0],
      [0, 0, 0, 1],
    ]
  }

  static getRotationY(angle) {
    const rad = Math.PI / 180 * angle;

    return [
      [Math.cos(rad), 0, Math.sin(rad), 0],
      [0, 1, 0, 0],
      [-Math.sin(rad), 0, Math.cos(rad), 0],
      [0, 0, 0, 1],
    ];
  }

  static getRotationZ(angle) {
    const rad = Math.PI / 180 * angle;

    return [
      [Math.cos(rad), -Math.sin(rad), 0, 0],
      [Math.sin(rad), Math.cos(rad), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }

  static getLookAt(eye, target, up) {
    const vz = Vector.substruct(eye, target).normalize();
    const vx = Vector.crossProduct(up, vz).normalize();
    const vy = Vector.crossProduct(vz, vx).normalize();

    return Matrix.multiply(
      Matrix.getTranslation(-eye.x, -eye.y, -eye.z),
      [
        [vx.x, vx.y, vx.z, 0],
        [vy.x, vy.y, vy.z, 0],
        [vz.x, vz.y, vz.z, 0],
        [0, 0, 0, 1]
      ]);
  }

  static getPerspectiveProjection(fovy, aspect, n, f) {
    const radians = Math.PI / 180 * fovy
    const sx = (1 / Math.tan(radians / 2)) / aspect;
    const sy = (1 / Math.tan(radians / 2));
    const sz = (f + n) / (f - n);
    const dz = (-2 * f * n) / (f - n);
    return [
      [sx, 0, 0, 0],
      [0, sy, 0, 0],
      [0, 0, sz, dz],
      [0, 0, -1, 0],
    ]
  }
}

let cameraDirection = new Vector(0, 0, -1, 0)
let cameraPos = new Vector(0, 0, 0)

window.addEventListener('keypress', (e) => {
  const speed = 5;
  cameraDirection.normalize();
  if (e.code === 'KeyW') {
    cameraPos = Vector.add(cameraPos, cameraDirection.multiplyByScalar(speed))
  } else if (e.code === 'KeyS') {
    cameraPos = Vector.substruct(cameraPos, cameraDirection.multiplyByScalar(speed))
  } else if (e.code === 'KeyA') {
    const normal = Vector.crossProduct(
      new Vector(0, 1, 0),
      cameraDirection
    ).normalize();
    cameraPos = Vector.add(cameraPos, normal.multiplyByScalar(speed));
  } else if (e.code === 'KeyD') {
    const normal = Vector.crossProduct(
      new Vector(0, 1, 0),
      cameraDirection
    ).normalize();
    cameraPos = Vector.substruct(cameraPos, normal.multiplyByScalar(speed));
  }
});
