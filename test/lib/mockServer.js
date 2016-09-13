
'use strict';

var express = require('express');
var app = express();
var mockMeta = require('./mockMeta');
var mockMetaTwo = require('./mockMetaTwo');

app.post('/testevent', function testeventCb(req, res) {
	res.status(200).send({value: 1});
});

app.post('/testeventtwo', function testeventCb(req, res) {
	res.status(200).send({value: 1});
});

app.get('/testget', function testeventCb(req, res) {
	res.status(200).send({value: 1});
});

app.get('/testrequestfailone', function testeventCb(req, res) {
	res.status(500).send({err: 1});
});

app.get('/testrequestfailtwo', function testeventCb(req, res) {
	res.status(200).send('invalid json');
});

app.delete('/testdelete', function testeventCb(req, res) {
	res.status(200).send({value: 1});
});

app.post('/testsuccess', function testsuccessCb(req, res) {
	res.status(200).send({value: 1});
});

app.post('/testfailone', function testsuccessCb(req, res) {
	res.status(500).send({err: 1});
});

app.post('/testfailtwo', function testsuccessCb(req, res) {
	res.status(200).send('invalid json');
});

app.get('/testmeta', function metaGetCb(req, res) {
	res.status(200).send(mockMeta());
});
app.get('/testmetatwo', function metaGetCb(req, res) {
	res.status(200).send(mockMetaTwo());
});

app.get('/testmetathree', function metaGetCb(req, res) {
	res.status(500).send({});
});

app.get('/codelist', function codelistCb(req, res) {

	var codeList = {
		codeLists: [
			{
				listItems: [
					{
						codeValue: 'AA',
						shortName: 'AyeAye'
					},
					{
						codeValue: 'BB',
						shortName: 'BeeBee'
					}
				]
			}
		]
	};
	res.status(200).send(codeList);
});

app.get('/dynamicCodelist', function codelistCb(req, res) {
	var codeList = {
		codeLists: [
			{
				listItems: [
					{
						codeValue: 'CC',
						shortName: 'SeeSee'
					},
					{
						codeValue: 'DD',
						shortName: 'Deed'
					}
				]
			}
		]
	};
	res.status(200).send(codeList);
});

app.get('/core/v1/event-notification-messages', function codelistCb(req, res) {
	res.setHeader('adp-msg-msgid', '12345');
	res.status(200).send({events: [{}]});
});

app.delete('/core/v1/event-notification-messages/{event-id}', function codelistCb(req, res) {
	res.status(200).send({});
});

var server;

function start(cb) {
	server = app.listen(55555, cb);
}

function stop(cb) {
	if(typeof server.close === 'function') server.close(cb);
}


module.exports = {
	start: start,
	stop: stop
};
