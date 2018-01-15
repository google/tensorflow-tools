#
# Copyright 2017 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Reference: https://www.tensorflow.org/programmers_guide/saved_model
#

__author__ = 'mbordihn@google.com (Markus Bordihn)'

import os
import tensorflow as tf
from tensorflow.python.tools.inspect_checkpoint import print_tensors_in_checkpoint_file

SIMPLE_PATH = os.path.join('tensorflow', 'simple')


def main():
  print('Create simple checkpoint files ...')
  simple_two_variables();
  simple_three_variables();
  os.remove(os.path.join(SIMPLE_PATH, 'checkpoint'))


def simple_two_variables():
  v1 = tf.get_variable('v1', shape=[3], initializer = tf.zeros_initializer)
  v2 = tf.get_variable('v2', shape=[5], initializer = tf.zeros_initializer)
  inc_v1 = v1.assign(v1+1)
  dec_v2 = v2.assign(v2-1)

  init_op = tf.global_variables_initializer()
  saver = tf.train.Saver()
  with tf.Session() as sess:
    sess.run(init_op)
    inc_v1.op.run()
    dec_v2.op.run()
    save_path = saver.save(sess, os.path.join(SIMPLE_PATH,
      'model-two-variables.ckpt'))
  dump_checkpoint_file(save_path)


def simple_three_variables():
  v1 = tf.get_variable('var1', shape=[5], initializer = tf.zeros_initializer)
  v2 = tf.get_variable('var2', shape=[5], initializer = tf.zeros_initializer)
  v3 = tf.get_variable('var3', shape=[5], initializer = tf.zeros_initializer)
  inc_v1 = v1.assign(v1+2)
  dec_v2 = v2.assign(v2-2)
  mul_v3 = v3.assign(v1*v2)

  init_op = tf.global_variables_initializer()
  saver = tf.train.Saver()
  with tf.Session() as sess:
    sess.run(init_op)
    inc_v1.op.run()
    dec_v2.op.run()
    mul_v3.op.run()
    save_path = saver.save(sess, os.path.join(SIMPLE_PATH,
      'model-three-variables.ckpt'))
  dump_checkpoint_file(save_path)


def dump_checkpoint_file(file):
  reader = tf.train.NewCheckpointReader(file)
  var_to_shape_map = reader.get_variable_to_shape_map()
  print('file: %s' % file)
  print('shape_map: %s' % var_to_shape_map)
  print_tensors_in_checkpoint_file(
      file_name = file,
      tensor_name = '',
      all_tensors = True)
  print('\n')


if __name__ == '__main__':
    main()
