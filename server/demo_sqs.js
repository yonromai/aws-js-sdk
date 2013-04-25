
if (process.argv.length < 4) {
	// console.log('Usage: node demo_credentials.js [akid] [secret] [bucket] [file_key]');
	console.log('Usage: node demo_sqs.js [user] [queue]');
	process.exit();
}

require('./api_calls.js');

var userName = process.argv[2];
queue = process.argv[3];

var popCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success Pop!');
		console.log(data);
	}
}

var pushCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success Push!');
		console.log(data);
		aws_api.popMessage({ QueueUrl: queue, MaxNumberOfMessages: 1 }, popCallback);
	}
}

var tokenCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success Policy!');
		// console.log(data);
	
		aws_api.update(data['Credentials']);
		aws_api.pushMessage({ QueueUrl: queue, MessageBody: "Test Message" }, pushCallback);
	}
}

aws_api.getPolicy({Policy: queue}, function(params) {
	// console.log(params);
	aws_api.getClientToken({Name: userName, DurationSeconds: 3600, Policy: params['Policy']}, tokenCallback);
});
