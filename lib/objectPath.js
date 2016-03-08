/*
Copyright © 2015-2016 ADP, LLC.

Licensed under the Apache License, Version 2.0 (the “License”);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an “AS IS” BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.  See the License for the specific language
governing permissions and limitations under the License.
*/

'use strict';

var log = require('winston');

module.exports = function objectPath(obj, path) {
	var result = obj;
	try{
		var props = path.split('/');
		props.forEach(function propsForEachCb(prop) {
			if(result[prop]) {
				result = result[prop];
			} else {
				// This results in error thrown indicating which property is missing.
				result = null;
			}
		});
	} catch(e) {
		log.error('Error finding event root object. Property path: ' + path + '. Error: ' + e);
	}
	return result;
};
