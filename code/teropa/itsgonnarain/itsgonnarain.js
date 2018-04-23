console.log("It's gonna rain");

// then defines 'callback' function that runs when fetch response comes in
// catch is a rejection handler to log errors
fetch("se-ela-clip.mp3")
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => console.log('Received',arrayBuffer))
  .catch(e => console.error(e));

// decode audio
/*let audioContext = new AudioContext();

fetch("se-ela-clip.mp3")
.then(response => response.arrayBuffer())
.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
.then(audioBuffer => console.log('Decoded',audioBuffer))
.catch(e => console.error(e));*/

// create 'buffer source': object that knows how to play back an AudioBuffer
// repeats some of the code from above but left for completeness
/*
let audioContext = new AudioContext();
// source node reads audio buffer and sends it to other nodes
// destination node plays it through speakers
fetch('se-ela-clip.mp3')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    let sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.loopStart = 0;
    sourceNode.loopEnd = 5;
    sourceNode.connect(audioContext.destination);
    sourceNode.start(0, 0); // second argument is where to begin playback
})
.catch(e => console.error(e))*/

// phasing, two separate channels
let audioContext = new AudioContext();

function startLoop(audioBuffer, pan = 0, rate = 1) {
  let sourceNode = audioContext.createBufferSource();
  let pannerNode = audioContext.createStereoPanner();

  sourceNode.buffer = audioBuffer;
  sourceNode.loop = true;
  sourceNode.loopStart = 0;
  sourceNode.loopEnd = 5;
  sourceNode.playbackRate.value = rate;
  pannerNode.pan.value = pan;

  sourceNode.connect(pannerNode);
  pannerNode.connect(audioContext.destination)

  sourceNode.start(0, 0);
}

fetch('se-ela-clip.mp3')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    // play audio twice at same time
    startLoop(audioBuffer,-1);
    startLoop(audioBuffer,1,1.002);
  })
  .catch(e => console.error(e));
