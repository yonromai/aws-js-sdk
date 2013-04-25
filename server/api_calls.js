aws_api = {
	handle : require('aws-sdk'),
	akid : process.env.SWS_AKID,
	secret : process.env.SWS_SECRET,
	token : "",
	region : 'us-west-2',
	policyFiles : { AllS3: "./allS3.json", ClientFolder: "./clientFolder.json", CallbackQueue: "./callback.json", JobQueue: "./jobs.json"},
	queueURL : { JobQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Job", CallbackQueue: "https://sqs.us-west-2.amazonaws.com/313384926431/Callback" },

	update : function(params) {
		this.akid = params['AccessKeyId']? params['akid'] : this.akid;
 		this.secret = params['SecretAccessKey']? params['secret'] : this.secret;
		this.region = params['region']? params['region'] : this.region;
		this.token = params['SessionToken']? params['SessionToken'] : this.token;
		this.handle.config.update({ accessKeyId: this.akid , secretAccessKey: this.secret, sessionToken: this.token, region: this.region });
	},
	
	getObject : function (params, callback) {
		this.update({region : 'us-east-1'});
		var s3 = new this.handle.S3();
		
		s3.client.getObject(params, function(err, data) {
			callback(err, data);
		});
	},

	putObject : function(params, callback) {
		this.update({region : 'us-east-1'});
		var s3 = new this.handle.S3();

		s3.client.putObject(params, function(err, data) {
			callback(err, data);
		});
	},

	pushMessage : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = this.handle.SQS();

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.sendMessage(params, function(err, data) {
			callback(err, data);
		});
	},

	pushMessageBatch : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = this.handle.SQS();

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.sendMessageBatch(params, function(err, data) {
			callback(err, data);
		});
	},
	
	popMessage : function(params, callback) {
		this.update({region: 'us-east-1'});
		var sqs = this.handle.SQS();

		params['QueueUrl'] = this.queueURL[params['QueueUrl']];
		sqs.client.receiveMessage(params, function(err, data) {
			callback(err, data);
		});
	},
	
	getClientToken : function (params, callback) {
		this.update({region: 'us-east-1'});
    	var svc = new this.handle.STS();
		
		svc.client.getFederationToken(params, function(err, data) {
			callback(err, data);
		});
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
					json['Statement'][0]['Resource'] = params['Folder'];
					policy = JSON.stringify(json);
				}
				if ('Folder' in params) {
					delete params['Folder'];
				}

				params['Policy'] = policy;
				callback(params);
			}
		});
	},


	addUserToGroup : function (groupName, userName, callback) {
		this.update({region : 'us-east-1'});
		var svc = new this.handle.IAM();
		
		svc.client.createGroup({GroupName: groupName}, function(err, data) {
  		if (err) { 
    		console.log('Failed to create group ' + groupName + ' : ' + err);
  		} else {
    		console.log('Created group ' + groupName);
		  }
			
			if (err && err['statusCode'] != 409) {
				callback(err, data);
				return;
			}
			
			svc.client.createUser({UserName: userName}, function(err, data) {
				if (err) {
						console.log('Failed to create user ' + userName + ' : ' + err);
				} else {
					console.log('Created user ' + userName);
				}
				
				if (err && err['statusCode'] != 409) {
					callback(err, data);
					return;
				}
				
				svc.client.addUserToGroup({GroupName: groupName, UserName: userName}, function(err, data) {
					if (err) {
						console.log('Failed to add user ' + userName + ' to group ' + groupName + ' : ' + err);
					} else {
						console.log('Successfuly added user ' + userName + ' to group ' + groupName);
					}
					
					callback(err, data);
				});
			});
		});
	}
}

