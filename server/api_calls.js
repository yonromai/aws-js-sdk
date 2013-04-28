exports.aws_api = {
	handle : require('aws-sdk'),
	akid : process.env.SWS_AKID,
	secret : process.env.SWS_SECRET,
	token : "",
	region : 'us-west-2',
	policies : {
		AllS3: {"Action":["s3:GetObject"],"Effect":"Allow","Resource":"*"}, 
		ClientFolder: {"Action":["s3:GetObject", "s3:PutObject"],"Effect":"Allow","Resource":""},
		CallbackQueue: {"Action":["sqs:sendMessage","sqs:deleteMessage"],"Effect":"Allow","Resource":"arn:aws:sqs:us-west-2:313384926431:Callback"},
		JobQueue: {"Action":["sqs:receiveMessage","sqs:sendMessage","sqs:deleteMessage"],"Effect":"Allow","Resource":"arn:aws:sqs:us-west-2:313384926431:Job"}
	},
	queueURL : { JobQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Job", CallbackQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Callback" },
	bucket : 'hpc.bucket.demo',
	nb_clients : 0,

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

	getClientCredentials : function(callback) {
		var clientName = 'client' + this.nb_clients;
		this.nb_clients++;
		obj = this;

		var getCallback = function(err, data) {
			if (err) {
				callback(err,data);
			} else {
				obj.getClientToken({Name: clientName, DurationSeconds: 3600, Policy: data['Policy']}, callback);
			}
		}

		var putCallback = function(err, data) {
			if (err) {
				callback(err,data);
			} else {
				obj.getPolicy({
					PolicyS3: ['ClientFolder','AllS3'],
					PolicySQS: ['JobQueue','CallbackQueue'],
					Folder: 'demo/clients/' + clientName + '/*'
				}, getCallback);
			}
		}

		this.putObject({ Key: 'demo/clients/' + clientName + '/' }, putCallback);
	},
	
	getClientToken : function (params, callback) {
		this.update({region: 'us-east-1'});
    	var sts = new this.handle.STS();
		
		sts.client.getFederationToken(params, callback);
	},

	getPolicy : function(params, callback) {
		var policy = {'Statement' : []};
		if ('PolicyS3' in params) {
			for (var i = 0; i < params['PolicyS3'].length; i++) {
				var to_add = this.policies[params['PolicyS3'][i]];
				if (params['PolicyS3'][i] == 'ClientFolder') {
					to_add['Resource'] = "arn:aws:s3:::" + this.bucket + "/" + params['Folder'];
				}
				policy['Statement'].push(to_add);
			}
			delete params['PolicyS3'];
		}

		if ('PolicySQS' in params) {
			for (var i = 0; i < params['PolicySQS'].length; i++) {
				var to_add = this.policies[params['PolicySQS'][i]];
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
	}
}

