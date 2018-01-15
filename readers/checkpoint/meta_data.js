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
const MetaGraph = require('./../../protobuf/meta_graph.json');
const Protobuf = require('protobufjs/light');


/**
 * @constructor
 */
let MetaDataReader = function() {
  this.variables = [];

  this.graphDev = {};
};

/**
 * @param {!ArrayBuffer} data
 * @return {Promise}
 */
MetaDataReader.prototype.decode = function(data) {
  return new Promise((resolve) => {
    if (!data) {
      console.warn('Nothing to decode!');
      return resolve();
    }
    console.log('Decoding meta data with', data.length, 'bytes ...');

    let root = Protobuf.Root.fromJSON(MetaGraph);
    let metaGraphDef = root.lookupType('tensorflow.MetaGraphDef');
    let dataSet = metaGraphDef.decode(data);
    let dataObject = metaGraphDef.toObject(dataSet, {
      longs: Number,
      enums: String,
      bytes: String,
    });

    // Decode GraphDev
    this.graphDev = dataObject.graphDef;

    // Decode variables
    let variables = dataSet.collectionDef.variables.bytesList.value;
    let variableNames = [];
    for (let variable in variables) {
      if (variables.hasOwnProperty(variable)) {
        variableNames.push(
          variables[variable].toString()
            .split(':0')[0]
            .replace(/[^0-9a-zA-Z_/]+/g, '')
        );
      }
    }
    this.variables = variableNames.sort();
    return resolve();
  });
};

/**
 * @return {Array}
 */
MetaDataReader.prototype.getVariables = function() {
  return this.variables;
};


module.exports = MetaDataReader;
