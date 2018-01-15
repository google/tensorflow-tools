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
const fs = require('fs');
const http = require('http');

const DataReader = require('./data.js');
const IndexTableReader = require('./index_table.js');
const MetaDataReader = require('./meta_data.js');


/**
 * @constructor
 */
let CheckpointReader = function() {
  /** @type {DataReader} */
  this.data = new DataReader();

  /** @type {IndexTableReader} */
  this.index_table = new IndexTableReader();

  /** @type {MetaDataReader} */
  this.meta_data = new MetaDataReader();
};

/**
 * @param {!ArrayBuffer} meta_data
 * @param {!ArrayBuffer} index_table
 * @param {ArrayBuffer?} data
 * @return {Promise}
 */
CheckpointReader.prototype.decode = function(meta_data, index_table, data='') {
  return new Promise((resolve) => {
    this.meta_data.decode(meta_data).then(() => {
      return this.index_table.decode(
        index_table, this.meta_data.getVariables());
    }).then(() => {
      if (data) {
        return this.data.decode(data, this.index_table.getDataMap());
      }
    }).then(() => {
      return resolve();
    });
  });
};

/**
 * @param {string} base_path like ../model.ckpt
 * @return {Promise}
 */
CheckpointReader.prototype.decodeLocalFiles = function(base_path) {
  return new Promise((resolve, reject) => {
    let dataData = [];
    let indexData = [];
    let metaData = [];

    new Promise(function(resolve_, reject_) {
      console.log('Decode local file', base_path);
      let streamCounter = 0;
      fs.createReadStream(base_path + '.data-00000-of-00001')
        .on('data', function(chunk) {
          dataData.push(chunk);
        })
        .on('end', function() {
          dataData = Buffer.concat(dataData);
          if (++streamCounter == 3) {
            resolve_();
          }
        })
        .on('error', reject_);
      fs.createReadStream(base_path + '.index')
        .on('data', function(chunk) {
          indexData.push(chunk);
        })
        .on('end', function() {
          indexData = Buffer.concat(indexData);
          if (++streamCounter == 3) {
            resolve_();
          }
        })
        .on('error', reject_);
      fs.createReadStream(base_path + '.meta')
        .on('data', function(chunk) {
          metaData.push(chunk);
        })
        .on('end', function() {
          metaData = Buffer.concat(metaData);
          if (++streamCounter == 3) {
            resolve_();
          }
        })
        .on('error', reject_);
    }).then(() => {
      this.decode(metaData, indexData, dataData).then(() => {
        resolve();
      }, reject);
    }, reject);
  });
};

/**
 * @param {string} base_path like https://../model.ckpt
 * @return {Promise}
 */
CheckpointReader.prototype.decodeRemoteFiles = function(base_path) {
  return new Promise((resolve, reject) => {
    let dataData = [];
    let indexData = [];
    let metaData = [];

    new Promise(function(resolve_, reject_) {
      console.log('Decode remote file', base_path);
      let streamCounter = 0;
      http.get(base_path + '.data-00000-of-00001', function(request) {
        request.on('data', function(chunk) {
          dataData.push(chunk);
        });
        request.on('end', function() {
          dataData = Buffer.concat(dataData);
          if (++streamCounter == 3) {
            resolve_();
          }
        });
        request.on('error', reject_);
      });
      http.get(base_path + '.index', function(request) {
        request.on('data', function(chunk) {
          indexData.push(chunk);
        });
        request.on('end', function() {
          indexData = Buffer.concat(indexData);
          if (++streamCounter == 3) {
            resolve_();
          }
        });
        request.on('error', reject_);
      });
      http.get(base_path + '.meta', function(request) {
        request.on('data', function(chunk) {
          metaData.push(chunk);
        });
        request.on('end', function() {
          metaData = Buffer.concat(metaData);
          if (++streamCounter == 3) {
            resolve_();
          }
        });
        request.on('error', reject_);
      });
    }).then(() => {
      this.decode(metaData, indexData, dataData).then(() => {
        resolve();
      }, reject);
    }, reject);
  });
};

/**
 * @return {Object}
 */
CheckpointReader.prototype.getVariables = function() {
  return this.meta_data.getVariables();
};

/**
 * @return {Object}
 */
CheckpointReader.prototype.getVariableToShapeMap = function() {
  return this.index_table.getShapeMap();
};

/**
 * @param {string} key
 * @return {Object}
 */
CheckpointReader.prototype.getData = function(key) {
  return this.data.getData(key);
};

/**
 * @param {string} key
 * @return {Object}
 */
CheckpointReader.prototype.getDataValues = function(key) {
  return this.data.getDataValues(key);
};

/**
 * @param {string} key
 * @return {Object}
 */
CheckpointReader.prototype.getDataContentRaw = function(key) {
  return this.data.getDataContentRaw(key);
};

/**
 * @return {Object}
 */
CheckpointReader.prototype.getValues = function() {
  return this.data.getValues();
};

/**
 * @param {string} key
 * @return {Object}
 */
CheckpointReader.prototype.getTensor = function(key) {
  return this.data.getTensor(key);
};

/**
 * @param {string} key
 * @return {Object}
 */
CheckpointReader.prototype.getShape = function(key) {
  return this.data.getShape(key);
};


// Python command alias mapping
CheckpointReader.prototype.get_tensor = CheckpointReader.prototype.getTensor;
CheckpointReader.prototype.get_variable_to_shape_map =
  CheckpointReader.prototype.getVariableToShapeMap;


module.exports = CheckpointReader;
