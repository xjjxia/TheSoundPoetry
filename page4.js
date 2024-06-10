let input;
let fft;
let smoothingFactor = 0.25;
let sum = 0;
let particles = [];
let trail;
let dimSpeed = 10;
let blurSpeed = 2;
let samples = 256; // Updated to a power of two
let counter=0;
let maxNums = 50000;
let molds = [];
let num = 3000;
let d;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  d = pixelDensity();
  input = new p5.AudioIn();
  input.start();
  fft = new p5.FFT();
  fft.setInput(input);

    background(0);
  //   for (let i=0; i<num; i++) {
  //     molds[i] = new Mold();
  //   }
}

function draw() {
  sum += (input.getLevel() - sum) * smoothingFactor;
  let waveform1 = fft.analyze();
  // translate(-width/2,-height/2);
  let minH = height;
  let maxH = 0;
        // console.log(molds.length);
  if (sum > 0.05) {
      counter += 0.1;
      for (let i = 0; i < 50; i++) { // Reduce particle generation rate
        let fx = floor(random(width));
        let dx = floor(fx);
        let fy = height - counter * map(waveform1[floor(samples * dx / width)], 0, 255, 30, 15);
        if (fy < 0) {
          fy = 10;
        }
        if (fy >= height) {
          fy = height - 10;
        }
        if (fy < minH) {
          minH = fy;
        }
        if (fy > maxH) {
          maxH = fy;
        }
        molds.push(new Mold(fx, fy, map(waveform1[floor(samples * dx / width)], 0, 255, -20, -10),minH));
      }
    background(0, 5);
    loadPixels();

    for (let i = 0; i < molds.length; i++) {
      molds[i].setStop(minH);

      molds[i].update();
      molds[i].display();
    }
    // print(maxH);
    if (maxH<=80) {
      background(0);
      clear();
      molds=[];
      counter=0;
      touchClear=20;
    }
  }else{
    background(0, 5);
    
    loadPixels();

    for (let i = 0; i < molds.length; i++) {
        // molds[i].stop = true;

      molds[i].update();
      molds[i].display();
    }
  }
}
class Mold {
  constructor(x,y,vy,globalEdge) {
    // Mold variables
    this.x = x;
    this.y = y; 
    // this.x = random(width/2 - 20, width/2 + 20);
    // this.y = random(height/2 - 20, height/2 + 20); 
    this.r = 0.5;
    
    this.heading = random(180,360);
    this.vx = random(-1, 1);
    this.vy = vy;
    this.rotAngle = 45;
    this.stop = false // Boolean variable to stop molds from moving 
    
    // Sensor variables
    this.rSensorPos = createVector(0, 0);
    this.lSensorPos = createVector(0, 0);
    this.fSensorPos = createVector(0, 0);
    this.sensorAngle = 30;
    this.sensorDist = 8;
    this.globalEdge =globalEdge;
  }

  setStop(upEdge) {
    this.globalEdge = upEdge;
  }

  
  update() {   
    // Using this.stop to control when molds stop moving
    if (this.stop) {
      this.vx = 0;
      this.vy = 0;
    } else {
      this.vx = cos(this.heading);
      this.vy = sin(this.heading);
    }
    
    // Using % Modulo expression to wrap around the canvas
    this.x = (this.x + this.vx + width) % width;
    this.y = (this.y + this.vy + height) % height;
    // Get 3 sensor positions based on current position and heading
    this.getSensorPos(this.rSensorPos, this.heading + this.sensorAngle);
    this.getSensorPos(this.lSensorPos, this.heading - this.sensorAngle);
    this.getSensorPos(this.fSensorPos, this.heading);
  
    // Get indices of the 3 sensor positions and get the color values from those indices
    let index, l, r, f;
    index = 4*(d * floor(this.rSensorPos.y)) * (d * width) + 4*(d * floor(this.rSensorPos.x));
    r = pixels[index];
    
    index = 4*(d * floor(this.lSensorPos.y)) * (d * width) + 4*(d * floor(this.lSensorPos.x));
    l = pixels[index];
    
    index = 4*(d * floor(this.fSensorPos.y)) * (d * width) + 4*(d * floor(this.fSensorPos.x));
    f = pixels[index];
    
    // Compare values of f, l, and r to determine movement 
    if (f > l && f > r) {
      this.heading += 0;
    } else if (f < l && f < r) {
      if (random(1) < 0.5) {
        this.heading += this.rotAngle;
      } else {
        this.heading -= this.rotAngle;
      }
    } else if (l > r) {
      this.heading += -this.rotAngle;
    } else if (r > l) {
      this.heading += this.rotAngle;
    }
    this.edges();
    
    
  }
  

  edges() {
    if (this.x < 0) {
      this.x = 0;
      this.vx *= -1;
    } else if (this.x >= width) {
      this.x = width - 1;
      this.vx *= -1;
    }
    if (this.y < this.globalEdge) {
      this.y = this.globalEdge + 1;
      this.vy *= -1;
      this.vy+=1;
    } else if (this.y >= height) {
      this.y = height - 1;
      this.vy *= -1;
      this.vy-=1;
    }
  }
  display() {
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r*2, this.r*2);
    
    line(this.x, this.y, this.x + this.r*3*this.vx, this.y + this.r*3*this.vy);
    // fill(255, 0, 0);
     // ellipse(this.rSensorPos.x, this.rSensorPos.y, this.r*1, this.r*1);
     // ellipse(this.lSensorPos.x, this.lSensorPos.y, this.r*1, this.r*1);
     // ellipse(this.fSensorPos.x, this.fSensorPos.y, this.r*1, this.r*1);
    
  }
  
  getSensorPos(sensor, angle) {
    sensor.x = (this.x + this.sensorDist*cos(angle) + width) % width;
    sensor.y = (this.y + this.sensorDist*sin(angle) + height) % height;
  }

}