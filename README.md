TensorFlow Tools
================
A collection of manipulation tools for TensorFlow data.

* [Installation](#installation)
* [Requirements](#requirements)
* [Basic Usage](#basic-usage)
	* [Decode data](#decode-data)
	* [Decode local files](#decode-local-files)
	* [Decode remote files](#decode-local-files)
* [Disclaimer](#disclaimer)
* [Author](#author)
* [License](#license)

Installation
------------
Use NPM using `npm install tensorflow-tools` or fork, clone, download the source
on GitHub to get the latest version.


Basic Usage
-----------

#### Decode data ####
```javascript
const TensorFlowReaders = require('tensorflow-tools').readers;
let metaData = ...;
let indexData = ...;
let dataData = ...;

let checkpointReader = readers.getCheckpointReader();
checkpointReader.decode(
  metaData, indexData, dataData
).then(() => {
  console.log('Happy checkpoint data', checkpointReader);
});
```

#### Decode local files ####
```javascript
const TensorFlowReaders = require('tensorflow-tools').readers;

let checkpointReader = readers.getCheckpointReader();
checkpointReader.decodeLocalFiles(
  '...model.ckpt'
).then(() => {
  console.log('Happy checkpoint data', checkpointReader);
});
```

#### Decode remote files ####
```javascript
const TensorFlowReaders = require('tensorflow-tools').readers;

let checkpointReader = readers.getCheckpointReader();
checkpointReader.decodeRemoteFiles(
  'http://...model.ckpt'
).then(() => {
  console.log('Happy checkpoint data', checkpointReader);
});
```


Disclaimer
----------
This is not an official Google product.


Author
------
[Markus Bordihn](https://github.com/MarkusBordihn)


License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0
