class SilenceDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.silenceThreshold = 0.01; // Example threshold
    this.silentSamples = 0;
    this.sampleRate = 44100; // Default value, can adjust
    this.silenceDuration = this.sampleRate * 2; // 2 seconds of silence
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < input.length; channel++) {
      const inputData = input[channel];
      const outputData = output[channel];

      for (let sample = 0; sample < inputData.length; sample++) {
        if (Math.abs(inputData[sample]) < this.silenceThreshold) {
          this.silentSamples++;
          if (this.silentSamples >= this.silenceDuration) {
            // Detected prolonged silence. You can send a message to the main thread if needed.
            this.port.postMessage("silence");
            this.silentSamples = 0;
          }
        } else {
          this.silentSamples = 0;
        }
        outputData[sample] = inputData[sample];
      }
    }
    return true;
  }
}

registerProcessor("silence-detector-processor", SilenceDetectorProcessor);
