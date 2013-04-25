
if (process.argv.length < 4) {
	// console.log('Usage: node demo_credentials.js [akid] [secret] [bucket] [file_key]');
	console.log('Usage: node demo_s3.js [user] [policy] [folder]');
	process.exit();
}

require('./api_calls.js');

var userName = process.argv[2];
var policy = process.argv[3];
var folder = (policy == 'ClientFolder') ? process.argv[4] : "";

var getCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success!');
		console.log(data['Body'].toString());
	}
}

var putCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success!');
		console.log(data);
	}
}

var tokenCallback = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log('Success!');
		console.log(data);
	
		aws_api.update(data['Credentials']);
		
		var buff = new Buffer("BIM ALLER", 'utf8');
		aws_api.putObject({ Bucket: 'hpc.bucket.demo', Key: 'demo/demo_last', Body: buff}, putCallback);

		aws_api.getObject({ Bucket: 'hpc.bucket.demo', Key: 'demo/demo_test' }, getCallback);
		aws_api.getObject({ Bucket: 'hpc.bucket.demo', Key: 'demo/demo_file', Range: 'bytes=3-6' }, getCallback);
	}
}

aws_api.getPolicy({Policy: policy, Folder: folder}, function(params) {
	console.log(params);
	aws_api.getClientToken({Name: userName, DurationSeconds: 3600, Policy: params['Policy']}, tokenCallback);
});
