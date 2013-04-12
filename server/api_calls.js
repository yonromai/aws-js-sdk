aws_api = {
	handle : require('aws-sdk'),
	akid : process.env.SWS_AKID,
	secret : process.env.SWS_SECRET,
	token: null,
	region : 'us-west-2',

	update : function(params) {
		this.akid = params.AKID ? params.AKID : this.akid;
 		this.secret = params.Secret ? params.Secret : this.secret;
		this.region = params.Region ? params.Region : this.region;
		this.token = params.Token ? params.Token : this.token;

		this.handle.config.update({
			accessKeyId: this.akid,
			secretAccessKey: this.secret,
			sessionToken: this.token,
			region: this.region
		});
	},

	addUserToGroup : function (params, callback) {
		this.update({Region : 'us-east-1'});
		var svc = new this.handle.IAM();
		
		svc.client.createGroup({GroupName: params.GroupName}, function(err, data) {
  		if (err) { 
    		console.log('Failed to create group ' + params.GroupName + ' : ' + err);
  		} else {
    		console.log('Created group ' + params.GroupName);
		  }
			
			if (err && err.statusCode != 409) {
				callback(err, data);
				return;
			}
			
			svc.client.createUser({UserName: params.UserName}, function(err, data) {
				if (err) {
						console.log('Failed to create user ' + params.UserName + ' : ' + err);
				} else {
					console.log('Created user ' + params.UserName);
				}
				
				if (err && err.statusCode != 409) {
					callback(err, data);
					return;
				}
				
				svc.client.addUserToGroup(params, function(err, data) {
					if (err) {
						console.log('Failed to add user ' + params.UserName + ' to group ' + params.GroupName + ' : ' + err);
					} else {
						console.log('Successfuly added user ' + params.UserName + ' to group ' + params.GroupName);
					}
					
					callback(err, data);
				});
			});
		});
	},
	
	getObject : function (params, callback) {
		this.update({Region : 'us-east-1'});
		var s3 = new this.handle.S3({
			accessKeyId: this.akid,
			secretAccessKey: this.secret,
			sessionToken: this.token
		});
		
		console.log("AKID: " + this.akid);
    console.log("Secret: " + this.secret);
    console.log("SessionToken: " + this.token);
		
		console.log(s3.accessKeyId);
		console.log(s3.client.secretAccessKey);
		console.log(s3.client.sessionToken);
		
		s3.client.getObject(params, function(err, data) {
			callback(err, data);
		});
	},
	
	getClientToken : function (params, callback) {
		this.update({Region: 'us-east-1'});
    var svc = new this.handle.STS();
		var fs = require('fs');

		fs.readFile(params.Policy, 'utf8', function(err, data) {
			if (err) {
				console.log('Error while reading the policy file: ' + err);
			} else {
				params.Policy = data;
				
				svc.client.getFederationToken(params, function(err, data) {
					callback(err, data);
				});
			}
		});
	}
}

