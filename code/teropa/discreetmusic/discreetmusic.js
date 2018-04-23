/*
let synth = new Tone.MonoSynth();
synth.toMaster();
synth.triggerAttackRelease('C4', 1);
*/

/*
// sawtooth Monosynth
let synth = new Tone.MonoSynth({
  oscillator: {type: 'sawtooth'},
  envelope: {
    // ramp up a bit slower
    attack: 0.1,
    // slow fade out after it's released
    release: 4,
    releaseCurve: 'linear'
  },
  filterEnvelope: {
    baseFrequency: 200,
    octaves: 2,
    attack: 0,
    decay: 0,
    release: 1000
  }
});
*/
// EQUALIZER
let filter = Tone.context.createBiquadFilter(); // part of web audio API
filter.type = 'peaking';
filter.frequency.value = 1000;
filter.Q.value = 4.31;
filter.gain.value = 12;

// hertz frequencies, 1/3rd of an octave apart from each other
const EQUALIZER_CENTER_FREQUENCIES = [
  100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
  1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000
];

function initEqualizerUI(container, equalizer) {
  // creates div (slider) for each frequency band
  equalizer.forEach(equalizerBand => {
    let frequency = equalizerBand.frequency.value;

    let wrapper = document.createElement('div');
    let slider = document.createElement('div');
    let label = document.createElement('label');

    wrapper.classList.add('slider-wrapper');
    slider.classList.add('slider');
    label.textContent = frequency >= 1000 ? `${frequency / 1000}K` : frequency;

    noUiSlider.create(slider, {
      start: 0,                   // The initial gain, 0dB
      range: {min: -12, max: 12}, // The allowed gain range, -12dB..12dB
      step: 0.1,                  // Adjust the gain in 0.1dB increments
      orientation: 'vertical',    // Render a vertical slider
      direction: 'rtl'            // -12dB goes at the bottom, 12dB at the top
    });

    // listens for changes in slider and applies to equalizer
    slider.noUiSlider.on('update', ([value]) => {
      let gain = +value;
      equalizerBand.gain.value = gain;
    });

    wrapper.appendChild(slider);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

// duosynth: one sawtooth and one sine
function makeSynth() {
let envelope = {
  attack: 0.1,
  release: 4,
  releaseCurve: 'linear'
};
let filterEnvelope = {
  baseFrequency: 200,
  octaves: 2,
  attack: 0,
  decay: 0,
  release: 1000
};

return new Tone.DuoSynth({
  harmonicity: 1, //both voices have the same frequency
  volume: -20,
  voice0: {
    oscillator: {type: 'sawtooth'},
    envelope,
    filterEnvelope
  },
  voice1: {
    oscillator: {type: 'sine'},
    envelope,
    filterEnvelope
  },
  vibratoRate: 0.5,
  vibratoAmount: 0.1
});
synth.toMaster();
//synth.triggerAttackRelease('C4', 1);
new Tone.Loop(time => {
  synth.triggerAttackRelease('C4', '8n', '+4n');
}, '1m').start();
};

//Tone.Transport.start();
//Tone.Transport.bpm.value = 240;

let leftSynth = makeSynth();
let rightSynth = makeSynth();

let leftPanner = new Tone.Panner(-0.5);
let rightPanner = new Tone.Panner(0.5);

let equalizer = EQUALIZER_CENTER_FREQUENCIES.map(frequency => {
  let filter = Tone.context.createBiquadFilter();
  filter.type = 'peaking';
  filter.frequency.value = frequency;
  filter.Q.value = 4.31;
  filter.gain.value = 0;
  return filter;
});

let echo = new Tone.FeedbackDelay('16n',0.2)
let delay = Tone.context.createDelay(6.0)
let delayFade = Tone.context.createGain();

delay.delayTime.value = 6.0;
delayFade.gain.value = 0.75; //add gain loss to the delay so it doesn't persist

leftSynth.connect(leftPanner);
rightSynth.connect(rightPanner);

leftPanner.connect(equalizer[0]);
rightPanner.connect(equalizer[0]);

//equalizer bands connect in series
equalizer.forEach((equalizerBand, index) => {
  if (index < equalizer.length - 1) {
    // Connect to next equalizer band
    equalizerBand.connect(equalizer[index + 1]);
  } else {
    // This is the last band, connect it to the echo
    equalizerBand.connect(echo);
  }
});

echo.toMaster();
echo.connect(delay);
delay.connect(Tone.context.destination);
delay.connect(delayFade);
delayFade.connect(delay); //frippertronics - connect the delay back to itself

new Tone.Loop(time => {
  // leftSynth
  // Trigger C5, and hold for a full note (measure) + two 1/4 notes
 leftSynth.triggerAttackRelease('C5', '1:2', time);
 // Switch note to D5 after two 1/4 notes without retriggering
 leftSynth.setNote('D5', '+0:2');
 // Trigger E4 after 6 measures and hold for two 1/4 notes.
 leftSynth.triggerAttackRelease('E4', '0:2', '+6:0');

 // Trigger G4 after 11 measures + a two 1/4 notes, and hold for two 1/4 notes.
 leftSynth.triggerAttackRelease('G4', '0:2', '+11:2');

 // Trigger E5 after 19 measures and hold for 2 measures.
 // Switch to G5, A5, G5 after delay of a 1/4 note + two 1/16 notes each.
 leftSynth.triggerAttackRelease('E5', '2:0', '+19:0');
 leftSynth.setNote('G5', '+19:1:2');
 leftSynth.setNote('A5', '+19:3:0');
 leftSynth.setNote('G5', '+19:4:2');
}, '34m').start();

new Tone.Loop(time => {
  // rightSynth
  // Trigger D4 after 5 measures and hold for 1 full measure + two 1/4 notes
  rightSynth.triggerAttackRelease('D4', '1:2', '+5:0');
  // Switch to E4 after one more measure
  rightSynth.setNote('E4', '+6:0');

  // Trigger B3 after 11 measures + two 1/4 notes + two 1/16 notes. Hold for one measure
  rightSynth.triggerAttackRelease('B3', '1m', '+11:2:2');
  // Switch to G3 after a 1/2 note more
  rightSynth.setNote('G3', '+12:0:2');

  // Trigger G4 after 23 measures + two 1/4 notes. Hold for a half note.
  rightSynth.triggerAttackRelease('G4', '0:2', '+23:2');
}, '37m').start();

Tone.Transport.start();
initEqualizerUI(document.querySelector('.eq'),equalizer) // takes container div and equalizer array as arguments
