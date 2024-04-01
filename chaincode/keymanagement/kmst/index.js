/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const KeyManagement = require('./lib/keymanagement');

module.exports.KeyManagement = KeyManagement;
module.exports.contracts = [ KeyManagement ];
