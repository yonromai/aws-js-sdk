
if (process.argv.length < 3) {
	console.log('Usage: node demo_credentials.js [user_name]');
	process.exit();
}

require('./api_calls.js');

var userName = process.argv[2];

// aws_api.addUserToGroup(groupName, userName);

var tokenCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log(data);
	}
}

aws_api.getClientToken(userName, 900, tokenCallback);

/* var AWS = require('aws-sdk');
var groupName = process.argv[2];
var userName = process.argv[3];

console.log(groupName);
console.log(userName);

AWS.config.update({accessKeyId: process.env.SWS_AKID, secretAccessKey: process.env.SWS_SECRET});
AWS.config.update({region: 'us-east-1'});

var svc = new AWS.IAM();
svc.client.createGroup({GroupName: groupName}, function(err, data) {
	if (err) {
		console.log('Failed to create group ' + groupName + ' : ' + err);
		if (err['statusCode'] != 404) process.exit(err['statusCode']);
	} else {
		console.log('Created group ' + groupName);
	}

	svc.client.createUser({UserName: userName}, function(err, data) {
		if (err) {
			console.log('Failed to create user ' + userName + ' : ' + err);
			if (err['statusCode'] != 404) process.exit(err['statusCode']);
		} else {
			console.log('Created user ' + userName);
			return 0;
		}
	});
});

if (res == 404) {
	res = svc.client.createUser({UserName: userName}, function(err, data) {
		if (err) {
			console.log('Failed to create user ' + userName + ' : ' + err);
			return err['statusCode'];
		} else {
			console.log('Created user ' + userName);
			return 0;
		}
	});
}

if (res != 0) process.exit(res);

res = svc.client.addUserToGroup({GroupName: groupName, UserName: userName}, function(err, data) {
	if (err) {
		console.log('Failed to add user ' + userName + ' to group ' + groupName + ' : ' + err);
		return err['statusCode'];
	} else {
		console.log('Successfuly added user ' + userName + ' to group ' + groupName);
		return 0;
	}
});

process.exit(res); */

/* AWS.config.update({region: 'us-west-2'});

var s3 = new AWS.S3();
s3.client.deleteBucket({Bucket: 'hpc.bucket.test'}, function(err, data) {
	console.log('S3:');
	if (err) {
		console.log(err);
	} else {
		console.log(data);
	}
}); */
