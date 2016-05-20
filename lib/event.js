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

var payloadHelper = require('./payloadHelper');
var objectPath = require('simple-object-path');
var metaHelper = require('./metaHelper');
var schemaHelper = require('./schemaHelper');
var async = require('async');

/**
@class Event
@description Represents a single event.
*/
function Event(opts) {

	var payload;
	var schema;
	var meta;

	this.apiProductInstance = opts.apiProductInstance;
	this.dataPath = opts.apiInfo.dataPath;
	this.eventContextPath = 'events/0/data/eventContext';
	this.eventNameCodePath = 'events/0/eventNameCode/codeValue';
	this.serviceCategoryCodePath = 'events/0/serviceCategoryCode/shortName';
	this.schemaLocation = opts.schemaLocation;

	this.appendData = function appendData(data) {
		var dataObj = objectPath(payload, this.dataPath);
		Object.keys(data).forEach(function keysForEachCb(key) {
			if(dataObj[key]) dataObj[key] = data[key];
		});
	};

	this.buildPayload = function buildPayload(cb) {
		payload = payloadHelper.removeUnusedProperties(payloadHelper.defaultPayload(schema));
		cb();
	};

	this.buildFinalPayload = function buildFinalPayload() {
		var finalPayload = payloadHelper.removeUnusedDefaultedProperties(this.getPayload());
		console.log('Final Payload', JSON.stringify(finalPayload));
		payload = finalPayload;
	};

	this.getAPIInfo = function getAPIInfo() {
		return opts.apiInfo;
	};

	this.getPayload = function getPayload() {
		return payload;
	};

	this.getEventContext = function getEventContext() {
		return objectPath(payload, this.eventContextPath);
	};

	this.init = function init(initObj, cb) {
		this.cb = cb;
		this.initObj = initObj;
		async.series([this.retrieveSchema.bind(this), this.buildPayload.bind(this), this.retrieveMeta.bind(this)], this.initFinish.bind(this));
	};

	this.initFinish = function initFinish(err) {
		if(err) {
			// handle error scenario.
		}
		if(typeof this.dataPath !== 'undefined' && !this.dataPath === '') this.appendData(this.initObj);
		if(typeof this.cb === 'function') {
			this.cb();
			delete this.cb;
		}
	};

	this.retrieveMeta = function retrieveMeta(cb) {
		metaHelper.getMeta({conn: opts.conn, apiInfo: opts.apiInfo, payload: payload}, function getMetaCb(err, metaObj) {
			if(metaObj) {
				meta = metaObj;
			}
			cb(err);
		});
	};

	this.retrieveSchema = function retrieveSchema(cb) {
		schemaHelper.getSchema(this.schemaLocation, opts.apiInfo.schemaName, function getSchemaCb(err, schemaObj) {
			if(schemaObj) {
				schema = schemaObj;
			}
			cb(err);
		});
	};

	this.setServiceCategoryCode = function setServiceCategoryCode(code) {
		this.serviceCategoryCode = code;
		var pathProps = this.serviceCategoryCodePath.split('/');
		var pathProp = pathProps.pop();
		var serviceCategoryCode = objectPath(payload, pathProps.join('/'));
		serviceCategoryCode[pathProp] = this.serviceCategoryCode;
	};

	this.setEventNameCode = function setEventNameCode(code) {
		this.eventNameCode = code;
		var pathProps = this.eventNameCodePath.split('/');
		var pathProp = pathProps.pop();
		var eventNameCode = objectPath(payload, pathProps.join('/'));
		eventNameCode[pathProp] = this.eventNameCode;
	};

	this.validate = function validate(partialPath, cb) {
		var data = payload;
		var fullPath = '';
		if(partialPath) {
			fullPath = this.dataPath + partialPath;
			data = objectPath(payload, this.dataPath + partialPath);
		}
		var conn = this.apiProductInstance.getConnection();
		var failures = metaHelper.validate(conn, data, payload, meta, fullPath, cb);
		return failures;
	};
}

module.exports = Event;
