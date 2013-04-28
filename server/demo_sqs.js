
if (process.argv.length < 4) {
	// console.log('Usage: node demo_credentials.js [akid] [secret] [bucket] [file_key]');
	console.log('Usage: node demo_sqs.js [user] [queue]');
	process.exit();
}

var aws_api = require('./api_calls.js').aws_api;

var userName = process.argv[2];
aws_api.queue = process.argv[3];

var rmCallback = function(err, data) {
	if (err) {
		console.log('Fail Rm')
		console.log(err);
	} else {
		console.log('Success Rm!');
		console.log(data);
	}
}

var peekCallback = function(err, data) {
	if (err) {
		console.log('Fail Peek')
		console.log(err);
	} else {
		console.log('Success Peek!');
		console.log(data);
		// aws_api.removeMessage({ QueueUrl: aws_api.queue, Data: data}, rmCallback);
	}
}

var pushCallback = function(err, data) {
	if (err) {
		console.log('Fail Push')
		console.log(err);
	} else {
		console.log('Success Push!');
		console.log(data);
		aws_api.peekMessage({ QueueUrl: aws_api.queue, MaxNumberOfMessages: 1 }, peekCallback);
	}
}

var tokenCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success Policy!');
		aws_api.update(data['Credentials']);

		aws_api.pushMessage({ QueueUrl: aws_api.queue, MessageTable: {'test':'message'} }, pushCallback);
	}
}

aws_api.getPolicy({Policy: aws_api.queue}, function(err, params) {
	// console.log(params);
	aws_api.getClientToken({Name: userName, DurationSeconds: 3600, Policy: params['Policy']}, tokenCallback);
});
