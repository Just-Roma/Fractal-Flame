"use strict";

/* --------------------------------------------------------- */
/*          References to the html elements                  */

let InfoPageNode = document.getElementById('InfoPage');
let ExtraParametersNode = document.getElementById('ExtraParametersDiv');

// Functions' div blocks, which hold the corresponding html elements associated with functions' parameters.
let Fan2DivNode = document.getElementById('Fan2Div');
let Rings2DivNode = document.getElementById('Rings2Div');
let BlobDivNode = document.getElementById('BlobDiv');
let PDJDivNode = document.getElementById('PDJDiv');
let JuliaNDivNode = document.getElementById('JuliaNDiv');

let ButtonCreateNode = document.getElementById('ButtonCreate');
let ButtonInfoNode = document.getElementById('ButtonInfo');

// Functions' parameters nodes(selects, textareas...).
let Fan2XParNode = document.getElementById('Fan2X');
let Fan2YParNode = document.getElementById('Fan2Y');

let Rings2ParNode = document.getElementById('Rings2val');

let BlobParNode = document.getElementById('BlobPar');

let PDJNodePar1 = document.getElementById('PDJ_Select_p1');
let PDJNodePar2 = document.getElementById('PDJ_Select_p2');
let PDJNodePar3 = document.getElementById('PDJ_Select_p3');
let PDJNodePar4 = document.getElementById('PDJ_Select_p4');

let JuliaNPowerParNode = document.getElementById('JuliaNPower');
let JuliaNDistanceParNode = document.getElementById('JuliaNDistance');


/* --------------------------------------------------------- */
/*              Miscellaneous event listeners                */

// Just an interesting fact: the "load" event is not fired sometimes on https://htmlpreview.github.io
// The DOMContentLoaded is used instead
window.addEventListener('DOMContentLoaded', 
  () => {
    document.getElementById('loadingPage').style.display = 'none';
    document.getElementById('MainPage').style.display = 'block';
  }
);

window.addEventListener('resize', 
() => {
  CanvasNode.width  = Math.round(window.innerWidth*0.85);
  CanvasNode.height = window.innerHeight;
  common.width  = CanvasNode.width;
  common.height = CanvasNode.height;
  modifyWorker();
});

// Modify the web worker on click.
ButtonCreateNode.addEventListener('click', modifyWorker);

// This changes the menu, which holds the number of affine transformtions('Magic number')
FuncNode.addEventListener('change',
  () => {
    
    let options = AffineNode.options;
    for(let i = options.length - 1; i >= 0; i--){
      options.remove(i);
    }

    let Func = FuncNode.value;
    let curOption;
    for(let i = lookupCoeffs[Func][0]; i <= lookupCoeffs[Func][1]; i++){
      curOption = document.createElement('option');
      curOption.value = String(i);
      curOption.text = String(i);
      AffineNode.appendChild(curOption);
    }
    AffineNode.value = lookupCoeffs[Func][1];
    common.numberOfCoeffs = lookupCoeffs[Func][1];
    
    // This part adds/hides the block with dependent parameters
    switch (FuncNode.value){

      case 'Fan2':
        common.refToExtraBlock.display = 'none';
        common.refToExtraBlock = Fan2DivNode.style;
        common.refToExtraBlock.display = 'block';
        ExtraParametersNode.style.display = 'block';
        common.extraPars.p1 = Number(Fan2XParNode.value);
        common.extraPars.p2 = Number(Fan2YParNode.value);
        break;

      case 'Rings2':
        common.refToExtraBlock.display = 'none';
        common.refToExtraBlock = Rings2DivNode.style;
        common.refToExtraBlock.display = 'block';
        ExtraParametersNode.style.display = 'block';
        common.extraPars.p1 = Number(Rings2ParNode.value);
        break;

      case 'Blob':
        common.refToExtraBlock.display = 'none';
        common.refToExtraBlock = BlobDivNode.style;
        common.refToExtraBlock.display = 'block';
        ExtraParametersNode.style.display = 'block';
        let randomDefault = 2+Math.round(10*Math.random());
        BlobParNode.value = randomDefault;
        common.extraPars.p3 = randomDefault;
        break;

      case 'PDJ':
        common.refToExtraBlock.display = 'none';
        common.refToExtraBlock = PDJDivNode.style;
        common.refToExtraBlock.display = 'block';
        ExtraParametersNode.style.display = 'block';
        common.extraPars.p1 = Number(PDJNodePar1.value);
        common.extraPars.p2 = Number(PDJNodePar2.value);
        common.extraPars.p3 = Number(PDJNodePar3.value);
        common.extraPars.p4 = Number(PDJNodePar4.value);
        break;

      case 'JuliaN':
        common.refToExtraBlock.display = 'none';
        common.refToExtraBlock = JuliaNDivNode.style;
        common.refToExtraBlock.display = 'block';
        ExtraParametersNode.style.display = 'block';
        common.extraPars.p1 = Number(JuliaNPowerParNode.value);
        common.extraPars.p2 = Number(JuliaNDistanceParNode.value);
        break;

      default:
        common.refToExtraBlock.display = 'none';
        common.refToExtraBlock = {'display': null};
        ExtraParametersNode.style.display = 'none';
    }
});


// Set the parameter 'numberOfCoeffs' from "common" to the chosen value.
AffineNode.addEventListener('change',
  () => {common.numberOfCoeffs = Number(AffineNode.value);
});



/* ------------------------------------------------------------------------------------- */
/* The event listeners for the blocks(divs) and input elements. ExtraParametersDiv html. */

// Fan2's x and y parameters.
Fan2XParNode.addEventListener('change',
  () => {
    let UserInput = Math.abs(Number(Fan2XParNode.value));
    if(UserInput && UserInput <= 0.5 && UserInput >= 0.1){
      Fan2XParNode.value = UserInput;
      common.extraPars.p1 = UserInput;
    }else{
      alert("Please enter a number from 0.1 to 0.5.");
      Fan2XParNode.value = common.extraPars.p1;
    }
});
Fan2YParNode.addEventListener('change',
  () => {
    let UserInput = Math.abs(Number(Fan2YParNode.value));
    if(UserInput && UserInput <= 0.5 && UserInput >= 0.1){
      Fan2YParNode.value = UserInput;
      common.extraPars.p2 = UserInput;
    }else{
      alert("Please enter a number from 0.1 to 0.5.");
      Fan2YParNode.value = common.extraPars.p2;
    }
});

// Rings2's parameter.
Rings2ParNode.addEventListener('change',
  () => {
    let UserInput = Math.abs(Number(Rings2ParNode.value));
    if(UserInput && UserInput <= 1 && UserInput >= 0.2){
      Rings2ParNode.value = UserInput;
      common.extraPars.p1 = UserInput;
    }else{
      alert("Please enter a number from 0.2 to 1.");
      Rings2ParNode.value = common.extraPars.p1;
    }
});

// Blob's waves(p3) parameter. p1=Blob.high and p2=Blob.low are set to constants 1.5 and 0.5, since they seem to affect only the size of images.
BlobParNode.addEventListener('change',
  () => {
    let UserInput = Math.abs(Number(BlobParNode.value));
    if(UserInput && UserInput <= 1000){
      BlobParNode.value = Math.ceil(UserInput);
      common.extraPars.p3 = Math.ceil(UserInput);
    }else{
      alert("Please enter a number from 1 to 1000. It will be rounded up.");
      BlobParNode.value = common.extraPars.p3;
    }
});

// PDJ's 4 parameters
PDJNodePar1.addEventListener('change',
  () => {
    common.extraPars.p1 = Number(PDJNodePar1.value);
});
PDJNodePar2.addEventListener('change',
  () => {
    common.extraPars.p2 = Number(PDJNodePar2.value);
});
PDJNodePar3.addEventListener('change',
  () => {
    common.extraPars.p3 = Number(PDJNodePar3.value);
});
PDJNodePar4.addEventListener('change',
  () => {
    common.extraPars.p4 = Number(PDJNodePar4.value);
});


// JuliaN's power and distance.
JuliaNPowerParNode.addEventListener('change',
  () => {
    common.extraPars.p1 = Number(JuliaNPowerParNode.value);
});
JuliaNDistanceParNode.addEventListener('change',
  () => {
    let UserInput = Number(JuliaNDistanceParNode.value);

    if(UserInput && UserInput <= 10 && UserInput >= -10){
      if(UserInput < 1 && UserInput > -1){UserInput = 1;}
      JuliaNDistanceParNode.value = UserInput;
      common.extraPars.p2 = UserInput;
    }else{
      if(UserInput === 0){
        JuliaNDistanceParNode.value = 1;
        common.extraPars.p2 = 1;
      }else{
        alert("Please enter a number from -10 to 10. The range (-1,1) will be converted to 1.");
        JuliaNDistanceParNode.value = common.extraPars.p2;
      }
    }
});


/* -------------------------------------------------------------------------------- */
/*         Event listeners for the main buttons("Create" and "Info")                */


/* There is a chance that the first frame will need several seconds to be printed. 
   In that time a user can click on the button and hence add extra job for the script. 
   So the button is shortly disabled.
*/
ButtonCreateNode.addEventListener('click', 
  () => {
    ButtonCreateNode.disabled = 'true';
    common.disabled = true;
    ButtonCreateNode.style.cursor = 'default';
  }
);

/* When the "Info" button is clicked the "Create" button will be disabled.
   It will be reactivated after a user closes the Info menu.
*/
ButtonInfoNode.addEventListener('click', 
  () => {
  if(common.allowed){
    InfoPageNode.style.display = 'inline-block';
    CanvasNode.style.display = 'none';
    ButtonCreateNode.disabled = 'true';
    ButtonCreateNode.style.cursor = 'default';
    ButtonInfoNode.innerText = 'Back';
    common.allowed = false;
  }
  else{
    InfoPageNode.style.display = 'none';
    CanvasNode.style.display = 'inline-block';
    ButtonCreateNode.disabled = '';
    ButtonCreateNode.style.cursor = 'pointer';
    ButtonInfoNode.innerText = 'Info';
    common.allowed = true;
  }
  }
);
