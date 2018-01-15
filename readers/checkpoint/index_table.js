/**
 * @fileoverview TensorFlow tools - Collection of manipulation tools.
 *
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */
const Protobuf = require('protobufjs/light');
const TensorBundle = require('./../../protobuf/tensor_bundle.json');


/**
 * @constructor
 */
let IndexTableReader = function() {
  this.header = {};

  this.dataMap = {};

  this.shapeMap = {};
};

/**
 * @param {!ArrayBuffer} data
 * @param {Array?} variables
 * @return {Promise}
 */
IndexTableReader.prototype.decode = function(data, variables) {
  return new Promise((resolve) => {
    if (!data) {
      console.warn('Nothing to decode!');
      return resolve();
    }
    console.log('Decoding index table with', data.length, 'bytes ...');
    let hashTable = decodeHashTable(data, variables);
    let hashData = getHashData(data, hashTable);
    for (let key in hashData) {
      if (hashData.hasOwnProperty(key)) {
        let data_ = hashData[key];
        if (data_.type == 'BundleHeader') {
          this.header = {
            numShards: data_.numShards,
            endianness: data_.endianness,
          };
        } else if (data_.type == 'BundleEntry') {
          // Storing Data map
          this.dataMap[data_.name] = {
            'crc32c': data_.crc32c,
            'dtype': data_.dtype,
            'offset': data_.offset,
            'size': data_.size,
            'shape': data_.shape,
          };
          if (data_.shard_id) {
            this.dataMap[data_.name]['shard_id'] = data_.shard_id;
          }

          // Storing Shape data
          this.shapeMap[data_.name] = data_.shape;
        }
      }
    }
    return resolve();
  });
};


IndexTableReader.prototype.getDataMap = function() {
  return this.dataMap;
};


IndexTableReader.prototype.getShapeMap = function() {
  return this.shapeMap;
};

/**
 * @param {!ArrayBuffer} data
 * @param {Object} dataMap
 * @return {Object}
 */
let getHashData = function(data, dataMap) {
  let root = Protobuf.Root.fromJSON(TensorBundle);
  let bundleHeader = root.lookupType('tensorflow.BundleHeaderProto');
  let bundleEntry = root.lookupType('tensorflow.BundleEntryProto');

  // Decoding relevant index data.
  for (let key in dataMap) {
     if (dataMap.hasOwnProperty(key)) {
      let data_ = dataMap[key];
      if (data_.type == 'BundleHeader') {
        let dataEntry = bundleHeader.decode(data.slice(data_.start, data_.end));
        let dataObject = bundleHeader.toObject(dataEntry, {
          longs: Number,
          enums: String,
          bytes: String,
        });
        dataMap[key].numShards = dataObject.numShards;
        dataMap[key].endianness = dataObject.endianness;
      } else if (data_.type == 'BundleEntry') {
        let dataEntry = bundleEntry.decode(data.slice(data_.start, data_.end));
        let dataObject = bundleEntry.toObject(dataEntry, {
          longs: Number,
          enums: String,
          bytes: String,
        });
        dataMap[key].dtype = dataObject.dtype;
        dataMap[key].offset = dataObject.offset || 0;
        dataMap[key].size = dataObject.size;
        dataMap[key].crc32c = dataObject.crc32c;

        // Parsing shape data
        let shapeData = [];
        for (let shape in dataObject.shape.dim) {
          if (dataObject.shape.dim.hasOwnProperty(shape)) {
            shapeData.push(dataObject.shape.dim[shape].size);
          }
        }
        dataMap[key].shape = shapeData;
      }
    }
  }
  return dataMap;
};

/**
 * @param {!ArrayBuffer} data
 * @param {Array?} variables
 * @return {Object}
 */
let decodeHashTable = function(data, variables=false) {
  if (data.length < 10) {
    console.error('Size to small ...');
    return;
  }
  let dataMapping = {};
  let formerDataKey = '';
  let firstEntry = true;
  let keyPosition = 0;
  for (let pos = 8; pos < data.length; pos++) {
    let dataType = getType(data, pos);


    // Ignore BundleHeader in later data
    if (dataType == 'BundleHeader' && !firstEntry) {
      dataType = '';
    }

    // Handle dataTypes
    if (dataType) {
      firstEntry = false;
      let hashKeyText = [];
      for (let subpos = pos-1; subpos > 0; subpos--) {
        let _char = String.fromCharCode(data[subpos]);
        if (/[\x00-\x1F]/.test(_char)) { // eslint-disable-line no-control-regex
          if (formerDataKey) {
            dataMapping[formerDataKey]['end'] = subpos - 2;
          }
          break;
        }
        hashKeyText.unshift(_char);
      }
      let hashKey = hashKeyText.join('') || dataType;
      if (variables) {
        hashKey = getFullKey(hashKey, variables, keyPosition);
      }
      dataMapping[pos] = {
        'start': pos,
        'end': -1,
        'type': dataType,
        'name': hashKey,
      };
      formerDataKey = pos;
      keyPosition++;
      console.log('Found', dataType, 'with name', hashKey, 'at pos', pos);
    } else if (data[pos] == '00' && data[pos+1] == '00' &&
               data[pos+2] == '00' && data[pos+3] == '00' &&
               data[pos+4] == '01' && data[pos+5] == '00' &&
               data[pos+6] == '00' && data[pos+7] == '00' &&
               formerDataKey) {
        console.log('Found end pos at', pos);
        dataMapping[formerDataKey]['end'] = pos;
        formerDataKey = '';
    }
  }
  return dataMapping;
};

/**
 * @param {string} name
 * @param {!Array} variables
 * @param {number} position
 * @return {string}
 */
let getFullKey = function(name, variables, position) {
  if (name == variables[position]) {
    return name;
  }
  if (variables.indexOf(name) !== -1) {
    return name;
  }
  if (variables[position].includes(name)) {
    return variables[position];
  }
  return name;
};

/**
 * @param {!ArrayBuffer} data
 * @param {number} pos
 * @return {string}
 */
let getType = function(data, pos) {
  if (data[pos] == '08' && data[pos+1] == '03') {
    return 'BundleHeader';
  } else if (data[pos] == '08' && data[pos+1] == '01') {
    return 'BundleEntry';
  }
  return '';
};


module.exports = IndexTableReader;
