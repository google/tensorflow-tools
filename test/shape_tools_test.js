/**
 * @fileoverview TensorFlow tools - MNIST test file
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
const assert = require('assert');

const ShapeTool = require('../tools/shape_tool.js');

const testArraySingle = [0, 1, 2, 3, 4, 5];
const testArrayTwo = [[0, 1], [2, 3], [4, 5]];
const testArrayThree = [[[0, 1], [2, 3]], [[4, 5]]];


describe('Shape Tools', function() {
  describe('.unshape', function() {
    it('[0, 1, 2, 3, 4, 5] => [0, 1, 2, 3, 4, 5]', function() {
      assert.deepEqual(ShapeTool.unshape(testArraySingle), testArraySingle);
    });
    it('[[0, 1], [2, 3], [4, 5]] => [0, 1, 2, 3, 4, 5]', function() {
      assert.deepEqual(ShapeTool.unshape(testArrayTwo), testArraySingle);
    });
    it('[[[0, 1], [2, 3]], [[4, 5]]] => [0, 1, 2, 3, 4, 5]', function() {
      assert.deepEqual(ShapeTool.unshape(testArrayThree), testArraySingle);
    });
  });

  describe('.reshape', function() {
    describe('with shape [6]', function() {
      it('[0, 1, 2, 3, 4, 5] => [0, 1, 2, 3, 4, 5]', function() {
        assert.deepEqual(ShapeTool.reshape(testArraySingle, [6]),
          testArraySingle);
      });
      it('[[0, 1], [2, 3], [4, 5]] => [0, 1, 2, 3, 4, 5]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayTwo, [6]),
          testArraySingle);
      });
      it('[[[0, 1], [2, 3]], [[4, 5]]] => [0, 1, 2, 3, 4, 5]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayThree, [6]),
          testArraySingle);
      });
    });
    describe('with shape [2, 3]', function() {
      let expectedResult = [[0, 1, 2], [3, 4, 5]];
      it('[0, 1, 2, 3, 4, 5] => [[0, 1, 2], [3, 4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArraySingle, [2, 3]),
          expectedResult);
      });
      it('[[0, 1], [2, 3], [4, 5]] => [[0, 1, 2], [3, 4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayTwo, [2, 3]),
          expectedResult);
      });
      it('[[[0, 1], [2, 3]], [[4, 5]]] => [[0, 1, 2], [3, 4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayThree, [2, 3]),
          expectedResult);
      });
    });
    describe('with shape [-1, 2]', function() {
      let expectedResult = [[0, 1], [2, 3], [4, 5]];
      it('[0, 1, 2, 3, 4, 5] => [[0, 1], [2, 3], [4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArraySingle, [-1, 2]),
          expectedResult);
      });
      it('[[0, 1], [2, 3], [4, 5]] => [[0, 1], [2, 3], [4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayTwo, [-1, 2]),
          expectedResult);
      });
      it('[[[0, 1], [2, 3]], [[4, 5]]] => [[0, 1], [2, 3], ...]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayThree, [-1, 2]),
          expectedResult);
      });
    });
    describe('with shape [3, -1]', function() {
      let expectedResult = [[0, 1], [2, 3], [4, 5]];
      it('[0, 1, 2, 3, 4, 5] => [[0, 1], [2, 3], [4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArraySingle, [3, -1]),
          expectedResult);
      });
      it('[[0, 1], [2, 3], [4, 5]] => [[0, 1], [2, 3], [4, 5]]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayTwo, [3, -1]),
          expectedResult);
      });
      it('[[[0, 1], [2, 3]], [[4, 5]]] => [[0, 1], [2, 3], ...]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayThree, [3, -1]),
          expectedResult);
      });
    });
    describe('with shape [-1, -1]', function() {
      let expectedResult = [[0], [1], [2], [3], [4], [5]];
      it('[0, 1, 2, 3, 4, 5] => [[0], [1], [2], ..]', function() {
        assert.deepEqual(ShapeTool.reshape(testArraySingle, [-1, -1]),
          expectedResult);
      });
      it('[[0, 1], [2, 3], [4, 5]] => [[0], [1], [2], ..]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayTwo, [-1, -1]),
          expectedResult);
      });
      it('[[[0, 1], [2, 3]], [[4, 5]]] => [[0], [1], [2], ..]', function() {
        assert.deepEqual(ShapeTool.reshape(testArrayThree, [-1, -1]),
          expectedResult);
      });
    });
  });
});
