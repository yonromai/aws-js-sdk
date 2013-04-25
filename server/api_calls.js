aws_api = {
	policyFile : "./policy.json"
	handle : require('aws-sdk'),
	akid : process.env.SWS_AKID,
	secret : process.env.SWS_SECRET,
	token : "",
	region : 'us-west-2',

	update : function(params) {
		this.akid = params['AccessKeyId']? params['akid'] : this.akid;
 		this.secret = params['SecretAccessKey']? params['secret'] : this.secret;
		this.region = params['region']? params['region'] : this.region;
		this.token = params['SessionToken']? params['SessionToken'] : this.token;
		this.handle.config.update({ accessKeyId: this.akid , secretAccessKey: this.secret, sessionToken: this.token, region: this.region });
	},
	
	getCredentials : function() {
		return this.handle.credentials();
	},
	
	getObject : function (params, callback) {
		this.update({region : 'us-west-1'});
		var s3 = new this.handle.S3();
		
		s3.client.getObject(params, function(err, data) {
			callback(err, data);
		});
	},
	
	getClientToken : function (params, callback) {
		this.update({region: 'us-east-1'});
    	var svc = new this.handle.STS();
		var fs = require('fs');

		fs.readFile(this.policyFile, 'utf8', function(err, data) {
			if (err) {
				console.log('Error while reading the policy file: ' + err);
			} else {
				params['Policy'] = data[params['Policy']];
				console.log(params);
				
				svc.client.getFederationToken(params, function(err, data) {
					callback(err, data);
				});
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

