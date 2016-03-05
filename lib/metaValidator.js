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

var objectPath = require('./objectPath');
var request = require('./apiRequest');
var fs = require('fs');
var _ = require('underscore');

function getMeta(conn, apicall, cb) {
	var options = {
		requestDesc: 'Meta.' + apicall.methodName,
		httpMethod: 'GET',
		url: conn.connType.apiUrl + apicall.metaPath,
		headers: {
			Authorization: 'Bearer ' + conn.accessToken
		},
		agentOptions: {
			ca: [fs.readFileSync(conn.connType.sslCertPath)],
			key: fs.readFileSync(conn.connType.sslKeyPath),
			cert: fs.readFileSync(conn.connType.sslCertPath)
		}
	};
	//console.log(options);
	request(options, cb);
}

function validateAgainstMeta(meta, path, data) {
	var metaRoot = 'events/0';
	var metaPaths = [];
	var watchedObjects = ['codeList'];
	var watchedProps = ['readOnly', 'optional', 'hidden', 'minItems', 'maxItems', 'minLength', 'maxLength', 'shortLabelName'];

	function cleanPath(path) {
		var cleaned = path.replace('transforms/0/', 'transform/');
		return cleaned;
	}

	function addToMetaPathArray(path, key, obj) {
		var cleanedPath = cleanPath(path);
		var pathObj = _.where(metaPaths, {path: cleanedPath})[0];
		if(pathObj) {
			pathObj
		} else {
			pathObj = {
				path: cleanedPath, 
				meta: {}
			};
			pathObj.meta[key] = obj[key];
			metaPaths.push(pathObj);
		}
	}

	function getMetaPaths(obj, paths) {

		Object.keys(obj).forEach(function keysForEach(key) {
			var appendedPath = '';
			if(~key.indexOf('/')) {
				appendedPath = paths + key;
				if(obj[key]) getMetaPaths(obj[key], appendedPath);
			} else if(typeof obj[key] !== 'object') {
				if(~watchedProps.indexOf(key)) {
					addToMetaPathArray(paths, key, obj);	
				}
			} else {
				if(~watchedObjects.indexOf(key)) {
					addToMetaPathArray(paths, key, obj);	
				} else {
					appendedPath = paths + '/' + key;
					if(obj[key]) getMetaPaths(obj[key], appendedPath);
				}
			}
		});
	}

	function validatePayload() {
		
		metaPaths.forEach(function metaPathsForEachCb(metaPath) {

			var dataObj = objectPath(data, metaPath.path);
			var p = metaPath.path;
			var lastKey = p.substring(p.lastIndexOf('/'), p.length);
			if(dataObj) {
				console.log(lastKey, dataObj, metaPath.meta);
			} else {
				console.log('Error finding data object');
			}

		});

	}


	console.time('parse meta');
	getMetaPaths(meta.meta, metaRoot);
	validatePayload();
	console.timeEnd('parse meta');
	console.log(path);
	console.log('metaPaths', JSON.stringify(metaPaths));
};

function MetaValidator() {
	var allMeta = [];
	this.validate = function validate(opts, cb) {
		var meta = _.where(allMeta, {metaPath: opts.apiInfo.metaPath})[0];
		if(meta) {
			validateAgainstMeta(meta, opts.dataPath, opts.data);
			cb();
		} else {
			getMeta(opts.conn, opts.apiInfo, function getMetaCb(err, newMeta) {
				//console.log(newMeta);
				allMeta.push(newMeta);
				validateAgainstMeta(newMeta, opts.dataPath, opts.data);
				cb();
			});
		}
	};
}

module.exports = new MetaValidator();

