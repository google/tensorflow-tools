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
const finalhandler = require('finalhandler');
const http = require('http');
const path = require('path');
const serveStatic = require('serve-static');

const Readers = require('../../readers/readers.js');


describe('CheckpointReader', () => {
  let checkpointReader = Readers.getCheckpointReader();

  describe('.decodeLocalFiles', () => {
    it('.getVariables', function(done) {
      checkpointReader.decodeLocalFiles(path.join(
        'examples', 'tensorflow', 'simple', 'model-three-variables.ckpt')
      ).then(() => {
        assert(checkpointReader.getVariables().includes('var1'));
        assert(checkpointReader.getVariables().includes('var2'));
        assert(checkpointReader.getVariables().includes('var3'));
        done();
      });
    });
  });

  describe('.decodeRemoteFiles', () => {
    let serve = serveStatic('examples', {
      'index': false,
    });
    let server = http.createServer(function onRequest(req, res) {
      serve(req, res, finalhandler(req, res));
    });

    before(function() {
      server.listen(3000);
    });

    it('.getVariables', function(done) {
      checkpointReader.decodeRemoteFiles(
        'http://localhost:3000/tensorflow/simple/model-three-variables.ckpt'
      ).then(() => {
        assert(checkpointReader.getVariables().includes('var1'));
        assert(checkpointReader.getVariables().includes('var2'));
        assert(checkpointReader.getVariables().includes('var3'));
        done();
      });
    }).timeout(5000);

    after(function() {
      server.close();
    });
  });
});
