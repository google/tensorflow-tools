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


/**
 * @constructor
 */
let ShapeTool = function() {};


/**
 * @param {Array} data
 * @param {Array} shape
 * @return {Array}
 */
ShapeTool.shape = (data, shape = []) => {
  let dataLength = data.length;
  let shapeDimension = shape.length;
  let output;
  if (shapeDimension == 1) {
    // One dimensional array (x)
    if (data.length > shape[0]) {
      console.warn('Shape size is not matching data size!');
      output = data.slice(0, shape[0]);
    } else {
      output = data;
    }
  } else if (shapeDimension == 2) {
    // Two dimensional array (x, y)
    output = [];
    let subOutput = [];
    let xLength = shape[0] === -1 ? dataLength / (
      shape[1] === -1 ? 1 : shape[1]) : shape[0];
    let yLength = shape[1] === -1 ? dataLength / xLength : shape[1];
    for (let dataEntry of data) {
      subOutput.push(dataEntry);
      if (subOutput.length == yLength) {
        if (output.length < xLength) {
          output.push(subOutput);
          subOutput = [];
        } else {
          console.warn('Shape size is not matching data size!');
          break;
        }
      }
    }
  } else {
    // Multi dimensional array (n, ...)
    console.warn('Multidimensional arrays are not supported yet!');
  }
  return output;
};

/**
 * @param {Array} data
 * @param {Array} shape
 * @return {Array}
 */
ShapeTool.reshape = (data, shape = []) => {
  return ShapeTool.shape(ShapeTool.unshape(data), shape);
};

/**
 * @param {Array} data
 * @return {Array}
 */
ShapeTool.unshape = (data) => {
  return data.reduce((accumulator, currentValue) => accumulator.concat(
    [].concat(currentValue).some(Array.isArray) ?
      ShapeTool.unshape(currentValue) : currentValue
  ), []);
};

module.exports = ShapeTool;
