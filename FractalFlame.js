/* This is the main script, which starts the creation of fractal flames.
   It uses the web worker, defined in FractalFlame.html for the calculations.
   The web worker gets some parameters from this script.
*/

"use strict";


/**************************************************************************************/
/* Here comes the definition of common parameters and references to the html elements */

let FuncNode = document.getElementById('selectFunc');
let CanvasNode = document.getElementById('Canvas');
let AffineNode = document.getElementById('selectAffine');

CanvasNode.width  = Math.round(window.innerWidth*0.85);
CanvasNode.height = window.innerHeight;

/* "refToExtraBlock" is a reference to a div block(which lies within the div with id=dependentParameters) with dependent parameters.
   "disabled" is for the "Create" button, which can be disabled under certain circumstances(a user is in the Info menu or the first frame is being created)
   "allowed" is associated with the "Info" button, check EventListeners.js for further details.
*/

let common = {'ctx':            CanvasNode.getContext('2d'),
              'width':          CanvasNode.width,
              'height':         CanvasNode.height,
              'blob':           new Blob([StartWorker.toString()+"StartWorker();"], { type: "javascript/worker" }),
              'worker':         null,
              'numberOfCoeffs': Number(AffineNode.value),
              'extraPars':      {'a':null, 'b':null, 'c':null, 'd':null, 'e':null, 'f':null, 'p1':null, 'p2':null, 'p3':null, 'p4':null},
              'refToExtraBlock':{'display': null},
              'disabled':       false,
              'allowed':        true,
              'workerDone':     false};
/**************************************************************************************/


/* Each function has a set of parameters - coefficients of an affine combination.

   (Xn+1) = (a b) * (Xn) + (c)
   (Yn+1)   (d e)   (Yn)   (f)

   These parameters will be randomly chosen each time a new Fi is produced.

   According to the original paper the affine transformation is better to be contractive, which means that the following conditions must be checked:

   1) a^2 + d^2 < 1
   2) b^2 + e^2 < 1
   3) a^2 + b^2 + d^2 + e^2 < 1 + (ae - bd)^2

   They will be chosen from the set [-1;1), 1 is not included because of the way Math.random() works.
   Some of these combinations will probably result in boring/ugly results.
*/

function assignCoeffs(size){
  let out1 = [];
  let out2 = [];
  let a,b,c,d,e,f,rgb;

  while(size > 0){
    do{
      do{
        a = Math.random()*2 - 1;
        d = Math.random()*2 - 1;
      }while((a**2+d**2) >= 1);

      do{
        b = Math.random()*2 - 1;
        e = Math.random()*2 - 1;
      }while((b**2 + e**2) >= 1);

    }while((a**2 + d**2 + b**2 + e**2) >= (1+(a*e - b*d)**2));

    c = Math.random()*2 - 1;
    f = Math.random()*2 - 1;
    out1.push([a,b,c,d,e,f]);

    do{
      rgb = [Math.round(Math.random()*255), Math.round(Math.random()*155), Math.round(Math.random()*155)];
    }while(Math.max(...rgb) < 100);

    out2.push(rgb);
    size--;
  }
  return [out1,out2];
}


// workIt defines how to handle the incoming message from the worker
function workIt(event){
  if (typeof event.data == 'boolean'){
    common.workerDone = true;
  }
  else{
    common.ctx.putImageData(event.data, 0, 0); // print the image on the canvas.
  }

  // This little part "turns on" the "Create" button if the image was already printed and a user is not in the info menu.
  if(common.disabled && common.allowed){
    ButtonCreateNode.disabled='';
    common.disabled = false;
    ButtonCreateNode.style.cursor = 'pointer';
  }
}


/* This function is executed on global object's resize event or when the "Create" button was clicked.
   If the current worker is not done yet it will be closed and a new one created.
   It also sends a message to the Worker, which includes the sizes of the matrix, affine coeefs and mode value.
*/
function modifyWorker(){
  if (!common.workerDone){
    common.worker.terminate();
    common.worker = new Worker(URL.createObjectURL(common.blob));
    common.worker.addEventListener('error', function(event){      
      if(confirm(event.message + '\n\nReload the page?')){
        location.reload();
      }
    });
    common.worker.onmessage = workIt;
  }

  common.workerDone = false;
  common.worker.postMessage([common.width, common.height, assignCoeffs(common.numberOfCoeffs), FuncNode.value, common.extraPars]);
}

// Worker's initialization
common.worker = new Worker(URL.createObjectURL(common.blob));
common.worker.onmessage = workIt;
common.worker.postMessage([common.width, common.height, assignCoeffs(common.numberOfCoeffs), FuncNode.value, common.extraPars]);
common.worker.addEventListener('error', function(event) {
  if(confirm(event.message + '\n\nReload the page?')){
    location.reload();
  }
});///////////////////////


/* Each function can use a user predefined number of affine transformations('numberOfCoeffs' in "common").
   This number will affect the resulting image */
let lookupCoeffs = {'Linear': [4,20],
                    'Sinusoidal': [5,30],
                    'Spherical': [5,20],
                    'Swirl': [5,20],
                    'Horseshoe': [5,20],
                    'Polar': [10,30],
                    'Handkerchief': [10,30],
                    'Heart': [5,25],
                    'Heart2': [5,25],
                    'Disc': [5,20],
                    'Spiral': [10,30],
                    'Hyperbolic': [10,30],
                    'Diamond': [10,30],
                    'Ex': [10,40],
                    'Bent': [5,30],
                    'Waves': [10,40],
                    'Fisheye': [15,40],
                    'Popcorn': [5,40],
                    'Exponential': [10,40],
                    'Power': [10,40],
                    'Cosine': [10,40],
                    'Rings': [10,40],
                    'Rings2': [10,40],
                    'Fan': [5,10],
                    'Fan2': [5,10],
                    'Blob': [10,40],
                    'PDJ': [10,20],
                    'Pipe': [10,40],
                    'Eyefish': [15,100],
                    'Bubble': [15,50],
                    'Cylinder': [15,50],
                    'Tangent': [15,50],
                    'Cross': [10,50],
                    'JuliaN': [10,30],
                    'Butterfly': [10,30],
                    'Foci': [10,20],
                    'Loonie': [10,20],
                    'Square': [10,20],
}
