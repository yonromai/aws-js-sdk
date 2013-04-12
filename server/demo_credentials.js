
if (process.argv.length < 5) {
	// console.log('Usage: node demo_credentials.js [user] [policy_file] [bucket] [file_key]');
	console.log('Usage: node demo_credentials.js [user] [policy_file] [duration]');
	process.exit();
}

require('./api_calls.js');

var UserName = process.argv[2];
var PolicyFile = process.argv[3];
var Duration = process.argv[4];
//var bucket = process.argv[4];
//var key = process.argv[5];

simpleCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success!');
		console.log(data);
	}
}


// aws_api.addUserToGroup({GroupName: GroupName, UserName: UserName}, simpleCallback);

var tokenCallback = function(err, data) {
	if (err) {
		console.log('Error getting token:');
		console.log(err);
	} else {
		console.log("AKID: " + data.Credentials.AccessKeyId);
		console.log("Secret: " + data.Credentials.SecretAccessKey);
		console.log("SessionToken: " + data.Credentials.SessionToken);
		console.log("Expiration: " + data.Credentials.Expiration);
		
		/* aws_api.update({
			AKID: data.Credentials.AccessKeyId,
			Secret: data.Credentials.SecretAccessKey,
			Token: data.Credentials.SessionToken
		});

		aws_api.getObject({ Bucket: bucket, Key: key }, simpleCallback); */
	}
}

aws_api.getClientToken({Name: UserName, DurationSeconds: parseInt(Duration), Policy: PolicyFile}, tokenCallback);

