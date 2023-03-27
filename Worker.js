"use static"

// The whole worker's code is wrapped in StartWorker function.
function StartWorker(){

  class Matrix{

    constructor(width, height) {
      this.width = width;
      this.height = height;
      // Each entry stores RGB(first 3 positions) and a counter(how many times a pixel was hit).
      this.entries = Array.from({length: width*height*4}, () => 0);
    }
      
    get(x, y) {return this.entries[y*this.width*4 + x*4+3];}	

    // Set RGB. There can be different ways. This one just sums up the color values.
    set(x, y, value){
      this.entries[y*this.width*4 + x*4]   += value[0];
      this.entries[y*this.width*4 + x*4+1] += value[1];
      this.entries[y*this.width*4 + x*4+2] += value[2];
    }

    // Increases the counter.
      inc(x, y) {this.entries[y*this.width*4 + x*4+3]++;}
  }

  
  /* The set of functions with some parameters.
     "scaleX/scaleY" tells how to scale the images.
     "setExtraPars" decides whether to assign extra parameters. This is done below in worker"s onmessage.
     
     This script has 2 types of extra paremeters(static and dynamic), which influence the final image result.
     Static ones are called dependent variations in the paper. They depend on the affine transform. 
     Dynamic ones are called parametric variations. They are independent of the affine transform.

     To extend the capabilities of the script some other types of parameters can be added to the functions.
  */
  let Functions = {
    
  "Linear": {"func": function(x, y){
    return [x, y];
  }, "scaleX": 6, "scaleY": 6, "setExtraPars": false},
  
  "Square": {"func": function(x, y){
    let weight=Math.random()
    return [(x+weight)*Math.random(),(y+weight)*Math.random()];
  }, "scaleX": 5, "scaleY": 5, "setExtraPars": false},
/*
  "Flux": {"func": function(x, y){
    let weight=1
    let xpw = x + weight;
    let xmw = x - weight;

    let avgr = weight*8* Math.sqrt( Math.sqrt(y*y + xpw*xpw) / Math.sqrt(y*y + xmw*xmw));
    let avga = ( Math.atan2(y, xmw) - Math.atan2(y,xpw) ) * 0.5;
    return [avgr*Math.cos(avga), avgr * Math.sin(avga)];
  }, "scaleX": 18, "scaleY": 18, "setExtraPars": false},
  
  "Ngon": {"func": function(x, y){
    let r_factor,theta,phi,b, amp;

    r_factor = Math.pow(x*x+y*y, 1.567654/2.0);

    theta = Math.atan2(x,y);
    b = 2*Math.PI/5//26.4;//ngon_sides

    phi = theta - (b*Math.floor(theta/b));
    if (phi > b/2)
    phi -= b;

    amp=10 * (1.0 / (Math.cos(phi)) - 1.0) +2;//first n is ngoncorners the last is circle
    amp = amp/r_factor ;
    return [x*amp, y*amp];
  }, "scaleX": 10, "scaleY": 10, "setExtraPars": false},
*/
  "Sinusoidal": {"func": function(x, y){
    return [Math.sin(x), Math.sin(y)];
  }, "scaleX": 2.5, "scaleY": 2.5, "setExtraPars": false},

  "Spherical": {"func": function(x, y){
    let rSquare = x*x + y*y;
    return [x/rSquare, y/rSquare];
  }, "scaleX": 10, "scaleY": 10, "setExtraPars": false},

  "Swirl": {"func": function(x, y){
    let rSquare = x*x + y*y;
    return [x*Math.sin(rSquare) - y*Math.cos(rSquare), x*Math.cos(rSquare) + y*Math.sin(rSquare)];
  }, "scaleX": 9, "scaleY": 6, "setExtraPars": false},

  "Horseshoe": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    return [(x-y)*(x+y)/r, 2*x*y/r];
  }, "scaleX": 9, "scaleY": 6, "setExtraPars": false},

  "Polar": {"func": function(x, y){
    return [Math.atan2(x,y)/Math.PI, Math.sqrt(x*x + y*y)-1];
  }, "scaleX": 2.3, "scaleY": 2.5, "setExtraPars": false},

  "Handkerchief": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    return [r*Math.sin(Teta+r), r*Math.cos(Teta-r)];
  }, "scaleX": 6, "scaleY": 7, "setExtraPars": false},

  "Heart": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y)*r;
    return [r*Math.sin(Teta), -r*Math.cos(Teta)];
  }, "scaleX": 9, "scaleY": 7, "setExtraPars": false},

  "Heart2": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan(x/y)*r;
    return [r*Math.sin(Teta), -r*Math.cos(Teta)];
  }, "scaleX": 9, "scaleY": 7, "setExtraPars": false},

  "Disc": {"func": function(x, y){
    let r = Math.PI * Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    return [Teta * Math.sin(r), Teta * Math.cos(r)];
  }, "scaleX": 8, "scaleY": 8, "setExtraPars": false},

  "Spiral": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    return [(Math.cos(Teta) + Math.sin(r))/r, (Math.sin(Teta) - Math.cos(r))/r];
  }, "scaleX": 12, "scaleY": 12, "setExtraPars": false},

  "Hyperbolic": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    return [Math.sin(Teta)/r, r*Math.cos(Teta)];
  }, "scaleX": 10, "scaleY": 10, "setExtraPars": false},

  "Diamond": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);    
    let Teta = Math.atan2(x,y);
    let a = Math.sin(Teta+r);
    let b = Math.sin(Teta-r);
    return [(a+b)/2, (a-b)/2];
  }, "scaleX": 2.1, "scaleY": 2.1, "setExtraPars": false},

  "Ex": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    let p0 = Math.sin(Teta+r); p0 = p0*p0*p0;
    let p1 = Math.cos(Teta-r); p1 = p1*p1*p1;
    return [r*(p0 + p1), r*(p0 - p1)];
  }, "scaleX": 6, "scaleY": 10, "setExtraPars": false},

  "Bent": {"func": function(x, y){
    if (x >= 0 && y >= 0) return [x,y];
    else if (x < 0 && y >= 0) return [2*x,y];
    else if (x >= 0 && y < 0) return [x,y/2];
    else return [2*x,y/2];
   }, "scaleX": 12, "scaleY": 6, "setExtraPars": false},

  "Waves": {"func": function(x, y, extraPars){
    return [x + extraPars.b*Math.sin(y/(extraPars.c*extraPars.c)), y + extraPars.e*Math.sin(x/(extraPars.f*extraPars.f))];
  }, "scaleX": 6, "scaleY": 6, "setExtraPars": true},

  "Fisheye": {"func": function(x, y){
    let r = 2/(Math.sqrt(x*x + y*y)+1);
    return [y*r, x*r];
  }, "scaleX": 4, "scaleY": 4, "setExtraPars": false},

  "Popcorn": {"func": function(x, y, extraPars){
    return [x + extraPars.c*Math.sin(Math.tan(3*y)), y + extraPars.f*Math.sin(Math.tan(3*x))];
  }, "scaleX": 7, "scaleY": 7, "setExtraPars": true},

  "Exponential": {"func": function(x, y){
    let Exp = Math.exp(x-1); y = Math.PI*y;
    return [Exp * Math.cos(y), Exp * Math.sin(y)];
  }, "scaleX": 3, "scaleY": 3, "setExtraPars": false},

  "Power": {"func": function(x, y){
    let Teta = Math.atan2(x, y);
    let r = Math.pow(Math.sqrt(x*x + y*y), Math.sin(Teta));
    return [r * Math.cos(Teta), r * Math.sin(Teta)];
  }, "scaleX": 5, "scaleY": 7, "setExtraPars": false},

  "Cosine": {"func": function(x, y){
    return [Math.cos(Math.PI*x)*Math.cosh(y), -Math.sin(Math.PI*x)*Math.sinh(y)];
  }, "scaleX": 5, "scaleY": 4, "setExtraPars": false},

  "Rings": {"func": function(x, y, extraPars){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    let c = extraPars.c*extraPars.c;
    let par = ((r+c) % (2*c)) - c + r*(1-c);
    return [par*Math.cos(Teta), par*Math.sin(Teta)];
  }, "scaleX": 4, "scaleY": 4, "setExtraPars": true},

  "Rings2": {"func": function(x, y, extraPars){
    let r = Math.sqrt(x*x + y*y);
    let p = extraPars.p1*extraPars.p1;
    let t = r - 2*p*Math.trunc((r+p)/(2*p)) + r*(1-p);
    return [t*(x/r), t*(y/r)];
  }, "scaleX": 5, "scaleY": 5, "setExtraPars": false},

  "Fan": {"func": function(x, y, extraPars){
    let r = Math.sqrt(x*x + y*y);
    let t = Math.PI*extraPars.c*extraPars.c;
    let Teta = Math.atan2(x,y);
    if (((Teta+extraPars.f)%t) > t/2){
      return [r*Math.cos(Teta-t/2), r*Math.sin(Teta-t/2)];
    }
    else{
      return [r*Math.cos(Teta+t/2), r*Math.sin(Teta+t/2)];
    }
  }, "scaleX": 7, "scaleY": 7, "setExtraPars": true},

  "Fan2": {"func": function(x, y, extraPars){
    let p1 = extraPars.p1*extraPars.p1*Math.PI;
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x,y);

    if (Teta+extraPars.p2-p1*Math.trunc((Teta+extraPars.p2)/p1) > p1*0.5){
      Teta = Teta-p1*0.5;
    }
    else{
      Teta = Teta+p1*0.5;
    }
    return [r*Math.sin(Teta), r*Math.cos(Teta)];
  }, "scaleX": 7, "scaleY": 7, "setExtraPars": false},

  "Blob": {"func": function(x, y, extraPars){
    let Teta = Math.atan2(x, y);
    let par = Math.sqrt(x*x + y*y)*(0.5 + 0.5*(Math.sin(extraPars.p3*Teta)+1));
    return[par*Math.sin(Teta), par*Math.cos(Teta)];
  }, "scaleX": 5, "scaleY": 5, "setExtraPars": false},

  "PDJ": {"func": function(x, y, extraPars){
    return[Math.sin(extraPars.p1*y) - Math.cos(extraPars.p2*x), Math.sin(extraPars.p3*x) - Math.cos(extraPars.p4*y)];
  }, "scaleX": 6, "scaleY": 6, "setExtraPars": false},

  "Pipe": {"func": function(x, y){
    let r = Math.sqrt(x*x + y*y);
    let Teta = Math.atan2(x, y);
    let p1 = Math.PI*x*x;
    //let t = Teta + y - p1*Math.trunc((2*Teta*y)/p1);
    if((Teta + y - p1*Math.trunc((2*Teta*y)/p1)) > p1/2) return[r*Math.sin(Teta-p1/2), r*Math.cos(Teta-p1/2)];
    else return[r*Math.sin(Teta+p1/2), r*Math.cos(Teta+p1/2)];
  }, "scaleX": 6, "scaleY": 6, "setExtraPars": false},

  "Eyefish": {"func": function(x, y){
    let r = 2/(Math.sqrt(x*x + y*y) + 1);
    return[r*x, r*y];
  }, "scaleX": 8, "scaleY": 4, "setExtraPars": false},

  "Bubble": {"func": function(x, y){
    let r = 1/(0.25*(x*x + y*y) + 1);
    return[r*x, r*y];
  }, "scaleX": 8, "scaleY": 4, "setExtraPars": false},

  "Cylinder": {"func": function(x, y){
    return[Math.sin(x), y];
  }, "scaleX": 8, "scaleY": 6, "setExtraPars": false},

  "Tangent": {"func": function(x, y){
    return[Math.sin(x)/Math.cos(y), Math.tan(y)];
  }, "scaleX": 12, "scaleY": 12, "setExtraPars": false},

  "Cross": {"func": function(x, y){
    let par = Math.sqrt(1/(x*x-y*y)**2);
    return[par*x, par*y];
  }, "scaleX": 12, "scaleY": 12, "setExtraPars": false},
  
  "JuliaN": {"func": function(x, y, extraPars){
    let r = Math.pow(Math.sqrt(x*x + y*y),extraPars.p2 / extraPars.p1 / 2);     
    let tmpr = (Math.atan2(y,x)+2*Math.PI*Math.trunc(Math.abs(extraPars.p1)*Math.random()))/extraPars.p1;
    return[r*Math.cos(tmpr), r*Math.sin(tmpr)];
  }, "scaleX": 5, "scaleY": 5, "setExtraPars": false},
/*
  "JuliaScope": {"func": function(x, y, extraPars){
    let randomN = 1 + Math.round(Math.random()*100);
    let t_rnd = Math.trunc(extraPars.randomN * Math.random());

    let tmpr, r,juliascope_power=0.1+Number((2*Math.random()).toFixed(1));
    let teta=Math.atan2(x,y);

    if ((t_rnd & 1) == 0)
      tmpr = (2 * Math.PI * t_rnd + teta) / extraPars.juliascope_power;
    else
      tmpr = (2 * Math.PI * t_rnd - teta) / extraPars.juliascope_power;

let juliascope_cn=1
    r = Math.pow(x*x+y*y, extraPars.juliascope_cn);

    return[r * Math.sin(tmpr), r * Math.cos(tmpr)];
  }, "scaleX": 8, "scaleY": 8, "setExtraPars": false},
*/
  "Butterfly": {"func": function(x, y){  
    let y2 = 2*y;
    let r = 1.3029400317411197908970256609023 * Math.sqrt(Math.abs(x*y)/(x*x+y2*y2));
    return[x*r, r*y2];
  }, "scaleX": 4.5, "scaleY": 4.5, "setExtraPars": false},
  
  "Foci": {"func": function(x, y){  
    let expx = Math.exp(x)*0.5;
    let expnx = 0.25/expx;
    let tmp = 1/(expx + expnx - Math.cos(y));
    return[ tmp * (expx - expnx),tmp * Math.sin(y)];
  }, "scaleX": 12.5, "scaleY": 12.5, "setExtraPars": false},
  
  "Loonie": {"func": function(x, y){  
    let r = x*x + y*y;
    if (r < 1){
      r = Math.sqrt(1/r - 1);
      x = r*x;
      y = r*y;
    }
    return[x, y];
  }, "scaleX": 5, "scaleY": 5, "setExtraPars": false},
  
  }
  
  // This is the part where the main job is done. All the algorithms from the Scott Drave's paper are here.
  self.onmessage = function(message){

    /* All the necessary for the calculations variables are defined here. */ 
    let width  = message.data[0];
    let height = message.data[1];

    // The set of affine coefficients.
    let coefs  = message.data[2][0];

    // This object will hold extra parameters for functions.
    let extraPars = message.data[4];

    let setExtraPars = Functions[message.data[3]].setExtraPars;
    
    // Used to choose a random int.
    let len = coefs.length-1;

    // The set of RGB values, associated with affine coeffs.
    let rgb = message.data[2][1];

    // The histogram for storing results from the chaos game.
    let fractalFlame = new Matrix(width, height);

    // Used to filtering the "fractalFlame".
    let fractalFlameSpare = new Matrix(width, height);

    // X/Y are the temporary values, cur_dot is the final coordinate. chosenF is the function chosen by the user. 
    // ranCoef is a variable which stores the index of the randomly chosen coefficient.
    let X, Y, cur_dot, chosenF = Functions[message.data[3]].func, ranCoef;        

    let scaleX = Functions[message.data[3]].scaleX;
    let scaleY = Functions[message.data[3]].scaleY;
    let offsetX, offsetY;
    
    // The histogram(fractalFlame) is a matrix which uses standard JS numbers, each such number takes 8 bytes of memory.
    // It can slow down the script if this matrix would be sent to the main thread from the FractalFlame.js.
    // So an instance of the ImageData is created, which uses Uint8ClampedArray, so each number uses only 1 byte of memory.
    let bitMap = new ImageData(width, height);
    
    // These 3 variables are used later for the Gamma correction. 
    // "Gamma" var can be adjusted or even be set by the user, but it basically effects the brightness of an image.
    let max = 0, GammaMod, Gamma = 2.2;

    // Some results must be shifted to make pictures more attractive.
    // Besides some functions need extra parameters. Static dependent parameters are defined here.
    switch (message.data[3]){

      case "Spiral": 
        offsetX = -Math.floor(width/7);
        offsetY = Math.floor(height/3);
        break;

      default:
        offsetX = 0;//-width/2;
        offsetY = 0;
    }

    // Since the calculation process is very slow, the web worker sends stepwise an actualized frame to the main script.
    for (let frame = 0; frame < 1000; frame++){
      for (let point = 0; point < 50000; point++){

        // Create a random point in the bi-unit square.
        X = Math.random()*2-1;
        Y = Math.random()*2-1;

        // Iterate 5 times without plotting to get closer to the solution. 
        // Larger number of iterations brings the points closer to the final solution, but it also slows down the creation significantly.
        // In theory it can be a distinct user-defined parameter, because low values change the image"s appearence. So the user could choose between 1 and 20 for instance.
        for (let j = -10; j < 0; j++){

          ranCoef = Math.round(Math.random()*len);
          
          // Extra parameters are set here. For now its just one mode, but other modes can be added.
          // Though these parameters could be user-defined and give users the whole control over the image"s appearence, 
          // it also would make user experiance worse, because (probably) most combinations would result in awful result. 
          // Besides there are billion combinations. So let the script handle this part.
          if (setExtraPars){
            extraPars.a = coefs[ranCoef][0];
            extraPars.b = coefs[ranCoef][1];
            extraPars.c = coefs[ranCoef][2];
            extraPars.d = coefs[ranCoef][3];
            extraPars.e = coefs[ranCoef][4];
            extraPars.f = coefs[ranCoef][5];
          }

          [X,Y] = chosenF(coefs[ranCoef][0]*X + coefs[ranCoef][1]*Y + coefs[ranCoef][2], 
                             coefs[ranCoef][3]*X + coefs[ranCoef][4]*Y + coefs[ranCoef][5],
                             extraPars);
        }

        cur_dot = [width-Math.floor((scaleX/2-X)/scaleX*width) + offsetX, height-Math.floor((scaleY/2-Y)/scaleY*height) + offsetY];


        /* This block works with the histogram(fractalFlame), so if symmetry is needed it can be introduced here.
           Some code for symmetry variation can be injected within this "if" block.
           As example extra helper functions can be defined, which take care of different symmetry methods.
           Each fractal function could have some parameter which references one of those symmetry-functions.
        */   
        if (cur_dot[0] >= 0 && cur_dot[0] < width && cur_dot[1] >= 0 && cur_dot[1] < height){ 
          fractalFlame.set(cur_dot[0],cur_dot[1], rgb[ranCoef]);
          fractalFlame.inc(cur_dot[0],cur_dot[1]);
        }
      }


      /* Filtering is done here. Since there are at least several filtering methods, some filter variation can be programmed here.
         The filtering mode can also be user-defined.
      */
      max = 0;

      for (let i = width*height*4-1; i > 2; i -= 4){
        // Scale the colors by counter and take logarithm of it.
        if (fractalFlame.entries[i]){
          fractalFlameSpare.entries[i-3] = fractalFlame.entries[i-3]/fractalFlame.entries[i];
          fractalFlameSpare.entries[i-2] = fractalFlame.entries[i-2]/fractalFlame.entries[i];
          fractalFlameSpare.entries[i-1] = fractalFlame.entries[i-1]/fractalFlame.entries[i];
          fractalFlameSpare.entries[i] = Math.log10(fractalFlame.entries[i]);
        }
        max = Math.max(fractalFlameSpare.entries[i], max);
      }

      for (let i = width*height*4-1; i > 2; i -= 4){
        if (fractalFlameSpare.entries[i]){
          GammaMod = Math.pow(fractalFlameSpare.entries[i]/max,1/Gamma);
          bitMap.data[i]   = 255*fractalFlameSpare.entries[i]/max;
          bitMap.data[i-3] = fractalFlameSpare.entries[i-3]*GammaMod;
          bitMap.data[i-2] = fractalFlameSpare.entries[i-2]*GammaMod;
          bitMap.data[i-1] = fractalFlameSpare.entries[i-1]*GammaMod;
        }
      }
      
      self.postMessage(bitMap);
    }
    
    self.postMessage(true);
  }
}
