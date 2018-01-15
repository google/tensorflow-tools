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
const ShapeTool = require('../../tools/shape_tool.js');


/**
 * @constructor
 */
let DataReader = function() {
  this.data = {};
};

/**
 * @param {!ArrayBuffer} data
 * @param {Object} map
 * @return {Promise}
 */
DataReader.prototype.decode = function(data, map) {
  return new Promise((resolve) => {
    if (!data) {
      console.warn('No data to decode!');
      return resolve();
    }
    console.log('Decoding', data.length, 'bytes of data ...');

    // Storing data
    for (let key in map) {
      if (map.hasOwnProperty(key)) {
        let data_ = map[key];
        let start_ = data_.offset;
        let end_ = data_.offset + data_.size;
        let dataLength_ = data.length;
        if (start_ > dataLength_) {
          console.error('Invalid data offset', start_, '!');
        } else if (end_ > dataLength_) {
          console.error('Invalid data size', end_, '!');
        }
        let content = data.slice(start_, end_);
        console.log(key, data_.shape, content);
        this.data[key] = {
          'content': content,
          'type': data_.dtype,
          'shape': data_.shape,
        };
      }
    }

    return resolve();
  });
};

/**
 * @param {string?} key
 * @return {Object}
 */
DataReader.prototype.getData = function(key) {
  if (!(key in this.data)) {
    console.error('Unknown data key', key, '!');
    return;
  }
  if (key) {
    return this.data[key];
  }
  return this.data;
};

/**
 * @param {string} key
 * @return {Object}
 */
DataReader.prototype.getDataValues = function(key) {
  switch (this.getType(key)) {
    case 'DT_FLOAT':
      return decodeFloat32(this.data[key].content);
    default:
      console.warn('Data-type', this.getType(key), 'is unsupported!');
  }
  return this.data[key].content;
};

/**
 * @param {string} key
 * @return {Object}
 */
DataReader.prototype.getDataContentRaw = function(key) {
  return this.getData(key).content;
};

/**
 * @return {Object}
 */
DataReader.prototype.getValues = function() {
  let valueMap = {};
  for (let key in this.data) {
    if (this.data.hasOwnProperty(key)) {
      let values = this.getDataValues(key);
      let shape = this.data[key].shape;
      valueMap[key] = {
        values: values,
        shape: shape,
      };
    }
  }
  return valueMap;
};

/**
 * @param {string} key
 * @return {Object}
 */
DataReader.prototype.getShape = function(key) {
  return this.data[key].shape;
};

/**
 * @param {string} key
 * @return {Object}
 */
DataReader.prototype.getType = function(key) {
  return this.data[key].type;
};

/**
 * @param {string} key
 * @return {Array}
 */
DataReader.prototype.getTensor = function(key) {
  return ShapeTool.shape(this.getDataContent(key), this.getShape(key));
};

let decodeFloat32 = function(buffer) {
  let data = [];
  for (let i = 0; i + 4 <= buffer.length; i += 4) {
    let float32 = buffer.readFloatLE(i);
    data.push(float32);
  }
  return new Float32Array(data);
};


module.exports = DataReader;
