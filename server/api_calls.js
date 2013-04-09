aws_api = {
	handle: require('aws-sdk'),

	addUserToGroup : function (groupName, userName, callback) {
		this.handle.config.update({region: 'us-east-1'});
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
	},

	getClientToken: function (clientName, duration, callback) {
		this.handle.config.update({region: 'us-east-1'});
    var svc = new this.handle.STS();

		svc.client.getFederationToken({ Name: clientName, DurationSeconds: duration }, function(err, data) {
			callback(err, data);
		});
	}
}

aws_api.handle.config.update({ accessKeyId: process.env.SWS_AKID , secretAccessKey: process.env.SWS_SECRET });
