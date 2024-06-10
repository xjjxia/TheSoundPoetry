let mic, fft, loudness;
let bands = 512;
let spectrum;
let sum = new Array(bands).fill(0);
let scale = 1;
let barWidth;
let division = 1;
let sensity = 0.015;
let curveH = 0;
let rectH = 1;
let stepp = 0;
let resol = 2160;
let smoothingFactor = 0.2;
let pg;
let click=false;
let myCanvas;
function setup() {
  myCanvas=createCanvas(windowWidth, windowHeight);
  background(255);
  pg = createGraphics(width/4, height);  
  //userStartAudio;
  // 设置音频输入
  // Create an Audio input
  mic = new p5.AudioIn();

  mic.start();

//   // 设置音量分析
//   loudness = new p5.Amplitude();
//   loudness.setInput(mic);

  //bands = 16;
  fft = new p5.FFT(0.8, bands);

  // set the input source to the mic
  fft.setInput(mic);

  barWidth = 400 * division / bands;

  click=true;
  
}
function mouseReleased(){
  //userStartAudio;
  // 设置音频输入
  // Create an Audio input
  mic = new p5.AudioIn();

  mic.start();

//   // 设置音量分析
//   loudness = new p5.Amplitude();
//   loudness.setInput(mic);

  //bands = 16;
  fft = new p5.FFT(0.8, bands);

  // set the input source to the mic
  fft.setInput(mic);

  barWidth = 400 * division / bands;

  click=true;
}
let baseInt=1.6;
function draw() {
    if(click){
    let volume1 = mic.getLevel();
    let thresh = 0.01;
    spectrum = fft.analyze(bands);
    console.log(volume1);
    noStroke();
    
    pg.background(255);
    pg.beginShape();
    pg.stroke(0);
    pg.strokeWeight(2);
    pg.noFill();
    
    for (let i = 0; i < bands; i++) {
      sum[i] += (spectrum[i] - sum[i]) * smoothingFactor;
      if (i <= bands / division) {
        pg.vertex(
          map(i, 0, bands, 0, pg.width),
          constrain(map(sum[i], 0, 255, 100, pg.height / 2 - 100), 100, pg.height / 2 - 100)
        );
      }
    }
    pg.endShape();
  
    pg.fill(0);
    for (let i = 0; i < bands / division; i++) {
      pg.rect(50 + i * barWidth, pg.height - 100, barWidth, -sum[i]/255 * (pg.height / 2 - 200) * scale * rectH);
    }
    image(pg, 0, 0);
    
    sensity=255;
    if (volume1 > thresh) {
      for (let i = 0; i < bands / division; i++) {
        //sum[i] += (spectrum[i] - sum[i]) * smoothingFactor;
        let alpha = map(sum[i], 0, sensity, 255, 0);
        //console.log(spectrum[i],alpha);
        fill(alpha);
        arc(width / 2+width/10, height / 2, bands * baseInt - i * baseInt * division, bands * baseInt - i * baseInt * division, (stepp / resol) * TWO_PI, ((stepp + 1) / resol) * TWO_PI);
      }
      stepp++;
      if (stepp + 1 == resol) {
        stepp = 0;
        resetSketch();
      }
    }
    }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    resetSketch();
  }
}

function resetSketch() {
  let timestamp = `${year()}.${month()}.${day()}_${hour()}.${minute()}.${second()}`;
  let savedImg = myCanvas.get(width / 2+width/10-bands * baseInt/2, height / 2-bands * baseInt/2,width / 2+width/10+bands * baseInt/2,height / 2+bands * baseInt/2);
  savedImg.save('screenshot_' + timestamp+'.png');
}