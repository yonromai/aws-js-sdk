importScripts("aws-sqs.js");

try {

	var client = new Client();

	function credentials_cb(job) {
		client.dequeue(dequeue_cb);
	}

	function dequeue_cb(job) {
		var inputs = [];
		var n = 0;

		for(var i = 0; i < job.inputs; i++) {
			(function () {
				var index = i;
				client.getFile(job.inputs[index],function (data) {
					inputs[index] = data;
					n++;
					if(n == job.files.length) {
						execute_job(job, inputs)
					}
				});
			})();
			importScripts(job.script);
			if(job.inputs.length == 0) {
				execute_job(job, inputs);
			}
		}
	}
	
	function execute_job(job, inputs) {
		var ret = run(inputs);
		for(var i = 0; i < ret.length; i++) {
			client.putFile(job.output[i], ret[i]);
		}
		client.reportCompelete(job);
		client.dequeue(dequeue_cb);
	}
	
	client.getCredentials(credentials_cb);

}
catch(err){
	print(err.stack);
}




