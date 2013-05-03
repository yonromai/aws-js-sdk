
var api_object = {
	handle : require('aws-sdk'),
	akid : process.env.SWS_AKID,
	secret : process.env.SWS_SECRET,
	token : "",
	region : 'us-west-2',
	policies : {
		AllS3: {"Action":["s3:GetObject"],"Effect":"Allow","Resource":"*"}, 
		ClientFolder: {"Action":["s3:GetObject", "s3:PutObject"],"Effect":"Allow","Resource":""},
		CallbackQueue: {"Action":["sqs:sendMessage"],"Effect":"Allow","Resource":"arn:aws:sqs:us-west-2:313384926431:Callback"},
		JobQueue: {"Action":["sqs:receiveMessage","sqs:sendMessage","sqs:deleteMessage"],"Effect":"Allow","Resource":"arn:aws:sqs:us-west-2:313384926431:Job"}
	},
	queueURL : { JobQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Job", CallbackQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Callback" },
	bucket : 'hpc.bucket.demo',
	nb_clients : 0
};

// Needed params: None
// Accepted params: AccessKeyId, SecretAccessKey, region, SessionToken
exports.update = function(params) {
	api_object.akid = params['AccessKeyId']? params['AccessKeyId'] : api_object.akid;
	api_object.secret = params['SecretAccessKey']? params['SecretAccessKey'] : api_object.secret;
	api_object.region = params['region']? params['region'] : api_object.region;
	api_object.token = params['SessionToken']? params['SessionToken'] : api_object.token;
	api_object.handle.config.update({ accessKeyId: api_object.akid , secretAccessKey: api_object.secret, sessionToken: api_object.token, region: api_object.region });
};

// Needed Params: Key
// Accepted Params: Bucket, Range
exports.getObject = function (params, callback) {
	exports.update({region : 'us-east-1'});
	var s3 = new api_object.handle.S3();

	if (!('Bucket' in params)) {
		params['Bucket'] = api_object.bucket;
	}
	s3.client.getObject(params, function(err, data) {
		callback(err, data);
	});
};

// Needed Params: Key
// Accepted Params: Bucket, Body, Table
exports.putObject = function(params, callback) {
	exports.update({region : 'us-east-1'});
	var s3 = new api_object.handle.S3();

	if ('Table' in params) {
		var str = JSON.stringify(params['Table']);
		params['Body'] = new Buffer(str, 'utf8');
		delete params['Table'];
	}

	if (!('Bucket' in params)) {
		params['Bucket'] = api_object.bucket;
	}
	s3.client.putObject(params, callback);
};

// Needed Params: QueueUrl
// Accepted Params: MessageBody, MessageTable
exports.pushMessage = function(params, callback) {
	exports.update({region: 'us-east-1'});
	var sqs = new api_object.handle.SQS();
	
	if ('MessageTable' in params) {
		params['MessageBody'] = JSON.stringify(params['MessageTable']);
		delete params['MessageTable'];
	}

	params['QueueUrl'] = api_object.queueURL[params['QueueUrl']];
	sqs.client.sendMessage(params, callback);
};

exports.pushJobQueue = function(params, callback) {
	params['QueueUrl'] = 'JobQueue';
	exports.pushMessage(params, callback);
};

exports.pushCallbackQueue = function(params, callback) {
	params['QueueUrl'] = 'CallbackQueue';
	exports.pushMessage(params, callback);
};

exports.pushMessageBatch = function(params, callback) {
	update({region: 'us-east-1'});
	var sqs = new api_object.handle.SQS();

	params['QueueUrl'] = api_object.queueURL[params['QueueUrl']];
	sqs.client.sendMessageBatch(params, callback);
};

// Needed Params: QueueUrl, MaxNumberOfMessages
// Accepted Params: None
// the returned data contains "ReceiptHandle" and "Body" that are useful
exports.peekMessage = function(params, callback) {
	exports.update({region: 'us-east-1'});
	var sqs = new api_object.handle.SQS();

	params['QueueUrl'] = api_object.queueURL[params['QueueUrl']];
	sqs.client.receiveMessage(params, callback);
};

exports.peekJobQueue = function(callback) {
	exports.peekMessage({QueueUrl: 'JobQueue'}, callback);
};

exports.peekCallbackQueue = function(callback) {
	exports.peekMessage({QueueUrl: 'CallbackQueue'}, callback);
};

// Needed Params: QueueUrl
// Accepted Params: Data, ReceiptHandle
exports.removeMessage = function(params, callback) {
	exports.update({region: 'us-east-1'});
	var sqs = new api_object.handle.SQS();

	if ('Data' in params) {
		params['ReceiptHandle'] = params['Data']['Messages'][0]['ReceiptHandle'];
		delete params['Data'];
	}

	params['QueueUrl'] = api_object.queueURL[params['QueueUrl']];
	sqs.client.deleteMessage(params, callback);
};

exports.removeJobQueue = function(msgHandle, callback) {
	var params = new Array();
	params['ReceiptHandle'] = msgHandle;
	params['QueueUrl'] = 'JobQueue';
	exports.removeMessage(params, callback);
};

exports.removeCallbackQueue = function(msgHandle, callback) {
	var params = new Array();
	params['ReceiptHandle'] = msgHandle;
	params['QueueUrl'] = 'CallbackQueue';
	exports.removeMessage(params, callback);
};

exports.getClientCredentials = function(callback) {
	var clientName = 'client' + api_object.nb_clients;
	api_object.nb_clients++;

	var finalCallback = function(err, data) {
		callback(err, {Credentials: data['Credentials'], Folder: 'demo/clients/' + clientName + '/'});
	}

	var getCallback = function(err, data) {
		if (err) {
			callback(err,data);
		} else {
			exports.getClientToken({Name: clientName, DurationSeconds: 3600, Policy: data['Policy']}, finalCallback);
		}
	}

	var putCallback = function(err, data) {
		if (err) {
			callback(err,data);
		} else {
			exports.getPolicy({
				PolicyS3: ['ClientFolder','AllS3'],
				PolicySQS: ['JobQueue','CallbackQueue'],
				Folder: 'demo/clients/' + clientName + '/*'
			}, getCallback);
		}
	}

	exports.putObject({ Key: 'demo/clients/' + clientName + '/' }, putCallback);
};

exports.getClientToken = function (params, callback) {
	exports.update({region: 'us-east-1'});
	var sts = new api_object.handle.STS();
	
	sts.client.getFederationToken(params, callback);
};

exports.getPolicy = function(params, callback) {
	var policy = {'Statement' : []};
	if ('PolicyS3' in params) {
		for (var i = 0; i < params['PolicyS3'].length; i++) {
			var to_add = api_object.policies[params['PolicyS3'][i]];
			if (params['PolicyS3'][i] == 'ClientFolder') {
				to_add['Resource'] = "arn:aws:s3:::" + api_object.bucket + "/" + params['Folder'];
			}
			policy['Statement'].push(to_add);
		}
		delete params['PolicyS3'];
	}

	if ('PolicySQS' in params) {
		for (var i = 0; i < params['PolicySQS'].length; i++) {
			var to_add = api_object.policies[params['PolicySQS'][i]];
			policy['Statement'].push(to_add);
		}
		delete params['PolicySQS'];
	}

	if ('Folder' in params) {
		delete params['Folder'];
	}
	params['Policy'] = JSON.stringify(policy);
	
	console.log(params);
	callback(null, params);
};

exports.flushBucket = function(callback) {
	exports.update({region: 'us-east-1'});
	var s3 = new api_object.handle.S3();

	var listCallback = function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var keyArray = [];
			for (var i = 0; i < data['Contents'].length; i++) {
				keyArray.push({Key: data['Contents'][i]['Key']});
			}

			if (data['IsTruncated']) {
				s3.client.deleteObjects({Bucket: api_object.bucket, Delete: {Objects: keyArray}}, function(err, data) {
					if (err) {
						callback(err, data);
					} else {
						s3.client.listObjects({Bucket: api_object.bucket}, listCallback);
					}
				});
			} else {
				s3.client.deleteObjects({Bucket: api_object.bucket, Delete: {Objects: keyArray}}, callback);
			}
		}
	}
	s3.client.listObjects({Bucket: api_object.bucket}, listCallback);
}

exports.flushQueue = function(queue, callback) {
	exports.update({region: 'us-east-1'});
	var sqs = new api_object.handle.SQS();

	var flush = function(err, data) {
		if (err) {
			console.log(err);
		} else {
			sqs.client.receiveMessage({QueueUrl: api_object.queueURL[queue], MaxNumberOfMessages: 10}, function(err, data) {
				if (err) {
					console.log(err);
				} else {
					if ('Messages' in data) {
						var msgArray = [];
						for (var i = 0; i < data['Messages'].length; i++) {
							msgArray.push({Id: data['Messages'][i]['MessageId'], ReceiptHandle: data['Messages'][i]['ReceiptHandle']});
						}

						var params = new Array();
						params['Entries'] = msgArray;
						params['QueueUrl'] = api_object.queueURL[queue];
						sqs.client.deleteMessageBatch(params, flush);
					} else {
						callback(err, data);
					}
				}
			});
		}
	}

	flush(null, null);
};

exports.flushAll = function(callback) {
	exports.flushQueue('JobQueue', function(err, data) {
		exports.flushQueue('CallbackQueue', function(err, data) {
			exports.flushBucket(callback);
		});
	});
}

exports.deleteObject = function(params, callback) {
	exports.update({region: 'us-east-1'});
	var s3 = new api_object.handle.S3();
	
	if (!('Bucket' in params)) {
		params['Bucket'] = api_object.bucket;
	}
	s3.client.deleteObject(params, callback);
}

