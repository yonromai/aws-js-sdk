//if(importScripts) {
	importScripts("http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha1.js",
				  "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/core-min.js",
				  "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-utf16-min.js",
				  "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js",
				  "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256.js");
//}


function print(str) {
	//if(typeof(console) == "undefined")
	//	console.log(str.toString());
	//else
		postMessage(str.toString());
}

function Client () {
}


Client.prototype.getCredentials = function(callback) {
	print("getting credentials");
	var uri = "http://divup.mooo.com/getcredentials";
	var xhr = new XMLHttpRequest();
	var self = this;
	xhr.open("GET",uri,true);
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			print("Status: " + xhr.status);
			print(typeof(xhr.response));
			if (xhr.status == 200) {
				self.credentials = JSON.parse(xhr.responseText);
				print("credentials received");
				if(callback) {
					callback(self.credentials);
				}
			}
		}
	}
	xhr.send();
}

Client.prototype.dequeue = function(callback) {
	print("dequeuing");
	var uri = "divupsqs.moo.com/Callback" +
	"?Action=ReceiveMessage" +
	//"&Attribute.Name=VisibilityTimeout" +
	//"&Attribute.Value=90" +
	"&Version=2008-01-01" +
	//"&Expires=" 2008-02-10T12%3A00%3A00Z" +
	"&SignatureVersion=2" +
	"&SignatureMethod=HmacSHA256" +
	"&AWSAccessKeyId=" + this.credentials.AccessKeyId;
	
	var signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256( 
    CryptoJS.enc.Utf8.parse(encodeURI(uri)), this.credentials.SecretAccessKey)));
	
	uri += "&Signature=" + signature;
	
	print(uri);
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);
	xhr.onreadystatechange = function () {
		if(xhr.readyState == 4 && xhr.status == 200) {
			if(callback) {
				var job = xhr.responseXML;
				//TODO: extract job from response
				callback(job);
				
			}
		}
	}
	xhr.send();
}