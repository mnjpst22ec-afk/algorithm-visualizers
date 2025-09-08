const viz = document.getElementById('viz');
const statusEl = document.getElementById('status');
const complexityEl = document.getElementById('complexity');
const algoEl = document.getElementById('algo');
const arrInput = document.getElementById('arrayInput');
const searchEl = document.getElementById('search');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const pseudocodeEl = document.getElementById('pseudocode');
const speedSlider = document.getElementById('speed');
const speedVal = document.getElementById('speedVal');
const orderEl = document.getElementById('order');
const iterationEl = document.getElementById('iterations');
const stepModeEl = document.getElementById('stepMode');
const nextStepBtn = document.getElementById('nextStep');

const compareSound = new Audio('https://freesound.org/data/previews/256/256113_3263906-lq.mp3'); 
const swapSound = new Audio('https://freesound.org/data/previews/131/131657_2398402-lq.mp3');    
const foundSound = new Audio('https://freesound.org/data/previews/341/341695_62430-lq.mp3');      

let ARR = [];
let delay = 600, iterations = 0;
let running = false, paused = false, stopNow = false;
let stepMode = false, stepResolve = null;

// ===== Speed Control =====
speedSlider.addEventListener('input', () => {
  delay = +speedSlider.value;
  speedVal.textContent = delay + "ms";
});

// ===== Step Mode =====
stepModeEl.addEventListener('change', () => {
  stepMode = stepModeEl.checked;
  nextStepBtn.disabled = !stepMode;
});

nextStepBtn.addEventListener('click', () => {
  if(stepResolve){ stepResolve(); stepResolve=null; }
});

// ===== Rendering Functions =====
function render(arr){
  viz.innerHTML='';
  const max = Math.max(...arr,1);
  arr.forEach((v,i) => {
    const bar = document.createElement('div');
    bar.className='bar state-default';
    bar.style.height=`${(v/max)*100+10}%`;
    bar.dataset.idx=i;
    bar.dataset.val=v;
    bar.innerHTML=`<div class="bar-label">${v}</div>`;
    viz.appendChild(bar);
  });
}

function cls(){document.querySelectorAll('.bar').forEach(b => b.className='bar state-default');}
function mark(i,clsName){const b = viz.querySelector(`.bar[data-idx="${i}"]`); if(b) b.className='bar '+clsName;}

function sleep(ms){
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if(stopNow){clearInterval(interval); resolve();}
      else if(!paused && !stepMode){clearInterval(interval); setTimeout(resolve, ms);}
    }, 50);
    if(stepMode) stepResolve=resolve;
  });
}

// ===== Iteration =====
function resetIterations(){iterations=0; iterationEl.textContent="Iterations: 0";}
function incIterations(){iterations++; iterationEl.textContent="Iterations: "+iterations;}

// ===== Pseudocode =====
const codeSnippets = {
  linear:["for i = 0 to n-1:","    if arr[i] == target:","        return i","return -1"],
  binary:["lo = 0, hi = n-1","while lo <= hi:","    mid = (lo+hi)//2","    if arr[mid] == target: return mid","    else if arr[mid] < target: lo = mid+1","    else: hi = mid-1","return -1"],
  bubble:["for i = 0 to n-1:","    swapped = false","    for j = 0 to n-i-2:","        if arr[j] > arr[j+1]:","            swap(arr[j], arr[j+1])","            swapped = true","    if !swapped: break"]
};
function showCode(algo, highlightLine=-1){
  pseudocodeEl.innerHTML = codeSnippets[algo].map((line,idx) => 
    idx===highlightLine? `<span class="highlight">${line}</span>`: line
  ).join("\n");
}

// ===== Algorithms =====
//Linear search
async function linearSearch(target){
  for(let i=0;i<ARR.length;i++){
    if(stopNow) return;
    cls(); mark(i,'state-active'); statusEl.textContent=`Checking index ${i}`;
    incIterations(); showCode("linear",0); compareSound.play();
    await sleep(delay);
    if(ARR[i]===target){showCode("linear",1); mark(i,'state-found'); statusEl.textContent=`The Element Found ✅ at index ${i}`; foundSound.play(); return true;}
  }
  showCode("linear",3); statusEl.textContent=" The Element Your Sesrching Not Found ❌"; return false;
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Binary Search
async function binarySearch(target, order){
  let arr = [...ARR].sort((a,b)=>order==="asc"?a-b:b-a); ARR=arr; render(arr);
  let lo=0, hi=arr.length-1;
  while(lo<=hi){
    if(stopNow) return;
    showCode("binary",2);
    let mid = Math.floor((lo+hi)/2);
    cls(); mark(mid,'state-active'); statusEl.textContent=`mid=${mid}`;
    incIterations(); compareSound.play(); await sleep(delay);
    if(arr[mid]===target){showCode("binary",3); mark(mid,'state-found'); statusEl.textContent=` The Element Found ✅ at index ${mid}`; foundSound.play(); return true;}
    else if(order==="asc" ? arr[mid]<target : arr[mid]>target){showCode("binary",4); lo=mid+1;}
    else{showCode("binary",5); hi=mid-1;}
  }
  showCode("binary",6); statusEl.textContent=" The Element Your Sesrching Not Found ❌"; return false;
}
//-------------------------------------------------------------------------------------------------------------------------------------
//Bubble Sorting
async function bubbleSort(order){
  let n=ARR.length;
  for(let i=0;i<n-1;i++){
    let swapped=false; showCode("bubble",2);
    for(let j=0;j<n-i-1;j++){
      if(stopNow) return;
      cls(); mark(j,'state-compare'); mark(j+1,'state-compare'); statusEl.textContent=`Compare ${ARR[j]} & ${ARR[j+1]}`;
      compareSound.play(); incIterations(); await sleep(delay);
      if(order==="asc" ? ARR[j]>ARR[j+1] : ARR[j]<ARR[j+1]){
        showCode("bubble",4);
        [ARR[j], ARR[j+1]] = [ARR[j+1], ARR[j]]; render(ARR);
        mark(j,'state-swap'); mark(j+1,'state-swap'); swapSound.play();
        await sleep(delay); swapped=true;
      }
    }
    if(!swapped){showCode("bubble",6); break;}
  }
  statusEl.textContent="Array Sorted ✅";
}

// ===== Complexity =====
function showComplexity(algo){
  if(algo==='linear') complexityEl.textContent="Time: O(n), Space: O(1)";
  if(algo==='binary') complexityEl.textContent="Time: O(log n), Space: O(1)";
  if(algo==='bubble') complexityEl.textContent="Time: O(n²), Space: O(1)";
}

// ===== Buttons =====
startBtn.addEventListener('click', async()=>{
  stopNow=false; paused=false; running=true;
  let input=arrInput.value.trim();
  if(!input){ARR=[36,9,38,11,28,19,33]; arrInput.value=ARR.join(",");}
  else ARR=input.split(',').map(x=>+x.trim()).filter(x=>!isNaN(x));
  render(ARR); cls(); statusEl.textContent="Running...";
  resetIterations(); showComplexity(algoEl.value); showCode(algoEl.value);
  let order=orderEl.value;
  if(algoEl.value==='linear') await linearSearch(+searchEl.value);
  if(algoEl.value==='binary') await binarySearch(+searchEl.value,order);
  if(algoEl.value==='bubble') await bubbleSort(order);
  running=false;
});

pauseBtn.addEventListener('click',()=>{if(!running) return; paused=!paused; pauseBtn.textContent=paused?"▶ Resume":"⏸ Pause";});
resetBtn.addEventListener('click',()=>{stopNow=true; running=false; paused=false; pauseBtn.textContent="⏸ Pause"; ARR=[36,9,38,11,28,19,33]; arrInput.value=ARR.join(","); render(ARR); resetIterations(); statusEl.textContent="Status: Reset"; complexityEl.textContent="Complexity: -"; pseudocodeEl.textContent="";});
