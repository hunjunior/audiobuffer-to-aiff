(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.audioBufferToAiff = factory();
  }
}(this, function () {
  'use strict';
  function audioBufferToAiff(buffer) {
    var numChannels = buffer.numberOfChannels
    var sampleRate = buffer.sampleRate

    var result
    if (numChannels === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    } else {
      result = buffer.getChannelData(0)
    }

    return encodeAIFF(result, sampleRate, numChannels)
  }

  function encodeAIFF(samples, sampleRate, numChannels) {
    var numBytesPerSample = 2;
    var totalNumAudioSampleBytes = samples.length * numBytesPerSample;
    var soundDataChunkSize = totalNumAudioSampleBytes + 8;
    var fileSizeInBytes = 4 + 26 + 16 + totalNumAudioSampleBytes;

    var buffer = new ArrayBuffer(54 + samples.length * numBytesPerSample)
    var view = new DataView(buffer)

    // -----------------------------------------------------------
    // HEADER CHUNK
    writeString(view, 0, 'FORM')

    // The file size in bytes is the header chunk size (4, not counting FORM and AIFF) + the COMM
    // chunk size (26) + the metadata part of the SSND chunk plus the actual data chunk size
    view.setInt32(4, fileSizeInBytes)

    writeString(view, 8, 'AIFF')

    // -----------------------------------------------------------
    // COMM CHUNK
    writeString(view, 12, 'COMM');
    view.setInt32(16, 18);
    view.setInt16(20, numChannels);
    view.setInt32(22, samples.length / numChannels); // num samples per channel
    view.setInt16(26, 16); // bit depth
    addSampleRateToAiffData(view, 28, sampleRate);

    // -----------------------------------------------------------
    // SSND CHUNK
    writeString(view, 38, 'SSND');
    view.setInt32(42, soundDataChunkSize);
    view.setInt32(46, 0); // offset 
    view.setInt32(50, 0); // block size

    var offset = 54;

    for (var i = 0; i < samples.length; i++) {
      var byte = Math.round(samples[i] * 32767)
      view.setInt16(offset, byte);
      offset += 2;
    }

    return buffer;
  }

  function addSampleRateToAiffData(view, offset, sampleRate) {
    var aiffSampleRateTable = {
      8000: [64, 11, 250, 0, 0, 0, 0, 0, 0, 0],
      11025: [64, 12, 172, 68, 0, 0, 0, 0, 0, 0],
      16000: [64, 12, 250, 0, 0, 0, 0, 0, 0, 0],
      22050: [64, 13, 172, 68, 0, 0, 0, 0, 0, 0],
      32000: [64, 13, 250, 0, 0, 0, 0, 0, 0, 0],
      37800: [64, 14, 147, 168, 0, 0, 0, 0, 0, 0],
      44056: [64, 14, 172, 24, 0, 0, 0, 0, 0, 0],
      44100: [64, 14, 172, 68, 0, 0, 0, 0, 0, 0],
      47250: [64, 14, 184, 146, 0, 0, 0, 0, 0, 0],
      48000: [64, 14, 187, 128, 0, 0, 0, 0, 0, 0],
      50000: [64, 14, 195, 80, 0, 0, 0, 0, 0, 0],
      50400: [64, 14, 196, 224, 0, 0, 0, 0, 0, 0],
      88200: [64, 15, 172, 68, 0, 0, 0, 0, 0, 0],
      96000: [64, 15, 187, 128, 0, 0, 0, 0, 0, 0],
      176400: [64, 16, 172, 68, 0, 0, 0, 0, 0, 0],
      192000: [64, 16, 187, 128, 0, 0, 0, 0, 0, 0],
      352800: [64, 17, 172, 68, 0, 0, 0, 0, 0, 0],
      2822400: [64, 20, 172, 68, 0, 0, 0, 0, 0, 0],
      5644800: [64, 21, 172, 68, 0, 0, 0, 0, 0, 0]
    };

    if (aiffSampleRateTable[sampleRate]) {
      for (var i = 0; i < 10; i++)
        view.setUint8(offset + i, aiffSampleRateTable[sampleRate][i])
    }
  }

  function interleave(inputL, inputR) {
    var length = inputL.length + inputR.length
    var result = new Float32Array(length)

    var index = 0
    var inputIndex = 0

    while (index < length) {
      result[index++] = inputL[inputIndex]
      result[index++] = inputR[inputIndex]
      inputIndex++
    }
    return result
  }

  function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  return audioBufferToAiff;
}));

