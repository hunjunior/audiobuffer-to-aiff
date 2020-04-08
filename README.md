# audiobuffer-to-aiff

Encodes the contents of an [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) from the WebAudio API as [AIFF](https://en.wikipedia.org/wiki/Audio_Interchange_File_Format). Only supports 16-bit PCM data.

  

## Install

  

```sh

npm install audiobuffer-to-aiff --save

```

  

## Examples
### Node.js example
**With** the [**Node Web Audio API**](https://www.npmjs.com/package/web-audio-api) library
```
npm install web-audio-api
```
Opens the *test.wav* file located in the *./demo* directory, then converts it to AIFF and saves it as *audio.aif* in the same directory.  

```js
const audioBufferToAiff =  require('audiobuffer-to-aiff');
const AudioContext =  require('web-audio-api').AudioContext;
const fs =  require('fs');

let audioContext =  new  AudioContext;

fs.readFile('./demo/test.wav',  (err, data)  =>  {
	if (err) throw  err;
	audioContext.decodeAudioData(data,  buffer  =>  {
		let  aif  =  audioBufferToAiff(buffer);
		let  chunk  =  new  Uint8Array(aif);
		let  outputDir  =  './demo/audio.aif';
		fs.writeFile(outputDir,  Buffer.from(chunk),  function  (err)  {
			if (err) throw  err;
			console.log("The AIFF file is ready. Location: "  +  outputDir);
		});
	})
});
```
### Client side JavaScript example
This example shows how to load an audio file (*./demo/test.wav*) with a GET request using *XMLHttpRequest*, then convert it to AIFF and download it.

**index.html**
```html
<!DOCTYPE  html>
<html  lang="en">
	<head>
		<meta  charset="UTF-8">
		<meta  name="viewport" content="width=device-width, initial-scale=1.0">
		<title>AudioBuffer to AIFF</title>
	</head>
	<body>
		<script  src="index.js"></script>
		<script  src="node_modules/audiobuffer-to-aiff/index.js"></script>
	</body>
</html>
```
**index.js**
```js
var audioContext =  new (window.AudioContext || window.webkitAudioContext)()

var xhr =  new  XMLHttpRequest();
xhr.open("GET",  "/demo/test.wav",  true);
xhr.responseType =  "arraybuffer";

xhr.onload  =  function  ()  {
	var  arrayBuffer  =  xhr.response;
	if (arrayBuffer) {
		var  anchor  =  document.createElement('a');
		document.body.appendChild(anchor);
		anchor.style  =  'display: none';
		audioContext.decodeAudioData(arrayBuffer,  function  (buffer)  {
			var  aiff  =  audioBufferToAiff(buffer)
			var  blob  =  new  window.Blob([new  DataView(aiff)],  {
				type:  'audio/aiff'
			})
			var  url  =  window.URL.createObjectURL(blob)
			anchor.href  =  url
			anchor.download  =  'audio.aiff'
			anchor.click()
			window.URL.revokeObjectURL(url)
		})
	}
};

xhr.send(null);
```

  
  

## Usage

#### `arrayBuffer = audioBufferToAiff(audioBuffer)`

Encodes the [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) instance as 16-bit PCM AIFF, returning a new array buffer. Interleaves multi-channel data, if necessary. 


## License

MIT, see [LICENSE.md](https://github.com/hunjunior/audiobuffer-to-aiff/blob/master/LICENSE)