exports.aws_api = {
	handle : require('aws-sdk'),
	akid : process.env.SWS_AKID,
	secret : process.env.SWS_SECRET,
	token : "",
	region : 'us-west-2',
	policyFiles : { AllS3: "./allS3.json", ClientFolder: "./clientFolder.json", CallbackQueue: "./callback.json", JobQueue: "./jobs.json"},
	queueURL : { JobQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Job", CallbackQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Callback" },
	bucket : 'hpc.bucket.demo',

	// Needed params: None
	// Accepted params: AccessKeyId, SecretAccessKey, region, SessionToken
	update : function(params) {
		this.akid = params['AccessKeyId']? params['AccessKeyId'] : this.akid;
 		this.secret = params['SecretAccessKey']? params['SecretAccessKey'] : this.secret;
		this.region = params['region']? params['region'] : this.region;
		this.token = params['SessionToken']? params['SessionToken'] : this.token;
		this.handle.config.update({ accessKeyId: this.akid , secretAccessKey: this.secret, sessionToken: this.token, region: this.region });
	},

	// Needed Params: Key
	// Accepted Params: Bucket, Range
	getObject : function (params, callback) {
		this.update({region : 'us-east-1'});
		var s3 = new this.handle.S3();

		if (!('Bucket' in params)) {
			params['Bucket'] = this.bucket;
		}
		s3.client.getObject(params, function(err, data) {
			callback(err, data);
		});
	},

	// Needed Params: Key
	// Accepted Params: Bucket, Body, Table
	putObject : function(params, callback) {
		this.update({region : 'us-east-1'});
		var s3 = new this.handle.S3();

		if ('Table' in params) {
			var str = JSON.stringify(params['Table']);
			params['Body'] = new Buffer(str, 'utf8');
			delete params['Table'];
		}

		if (!('Bucket' in params)) {
			params['Bucket'] = this.bucket;
		}
		s3.client.putObject(params, callback);
	},

	// Needed Params: QueueUrl
	// Accepted Params: MessageBody, MessageTable
	pushMessage : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = new this.handle.SQS();
		
		if ('MessageTable' in params) {
			params['MessageBody'] = JSON.stringify(params['MessageTable']);
			delete params['MessageTable'];
		}

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.sendMessage(params, callback);
	},

	pushMessageBatch : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = new this.handle.SQS();

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.sendMessageBatch(params, callback);
	},
	
	// Needed Params: QueueUrl, MaxNumberOfMessages
	// Accepted Params: None
	peekMessage : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = new this.handle.SQS();

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.receiveMessage(params, callback);
	},

	// Needed Params: QueueUrl
	// Accepted Params: Data, ReceiptHandle
	removeMessage : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = new this.handle.SQS();

		if ('Data' in params) {
			params['ReceiptHandle'] = params['Data']['Messages'][0]['ReceiptHandle'];
			delete params['Data'];
		}

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.deleteMessage(params, callback);
	},
	
	getClientToken : function (params, callback) {
		this.update({region: 'us-east-1'});
    	var svc = new this.handle.STS();
		
		svc.client.getFederationToken(params, callback);
	},

	getPolicy : function(params, callback) {
		var fs = require('fs');
		
		fs.readFile(this.policyFiles[params['Policy']], 'utf8', function(err, data) {
			if (err) {
				console.log('Error while reading the policy file: ' + err);
			} else {
				var policy = data;
				if (params['Policy'] == 'ClientFolder') {
					var json = JSON.parse(policy);
					json['Statement'][0]['Resource'] = "arn:aws:s3:::" + this.bucket + "/" + params['Folder'];
					policy = JSON.stringify(json);
				}
				if ('Folder' in params) {
					delete params['Folder'];
				}

				params['Policy'] = policy;
				callback(err, params);
			}
		});
	},
}

