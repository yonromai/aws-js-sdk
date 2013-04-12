// Authorization = "AWS" + " " + AWSAccessKeyId + ":" + Signature;

// Signature = Base64( HMAC-SHA1( YourSecretAccessKeyID, UTF-8-Encoding-Of( StringToSign ) ) );

// StringToSign = HTTP-Verb + "\n" +
//   Content-MD5 + "\n" +
//   Content-Type + "\n" +
//   Date + "\n" +
//   CanonicalizedAmzHeaders +
//   CanonicalizedResource;

// CanonicalizedResource = [ "/" + Bucket ] +
//   <HTTP-Request-URI, from the protocol name up to the query string> +
//   [ sub-resource, if present. For example "?acl", "?location", "?logging", or "?torrent"];

// CanonicalizedAmzHeaders = <described below>

var get_http_headers = function(AWSAccessKeyId, YourSecretAccessKeyID, token, bucket, path){
  var headers = {};
  headers.Date = (new Date()).toUTCString();
  headers.Authorization = get_authorization_header(AWSAccessKeyId, YourSecretAccessKeyID, {
    http_verb: "GET",
    date: headers.Date,
		token: token,
    bucket: bucket,
    ressource_path: path
  });
  return headers;
};

var get_string_to_sign =  function(params){ // to refactor
  var str = params.http_verb + "\n\n\n" + "\nx-amz-date:" + params.date;
	if (params.token) {
		str += '\nx-amz-security-token:' + params.token;
	}
	return str + '\n' + (params.bucket ? "/" + params.bucket : "") + params.ressource_path;
};

var get_authorization_header = function(AWSAccessKeyId, YourSecretAccessKeyID, query_params){
  var string_to_sign = get_string_to_sign(query_params);
  console.log(string_to_sign);
  var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1( 
    CryptoJS.enc.Utf8.parse(string_to_sign),
    YourSecretAccessKeyID));
  return "AWS" + " " + AWSAccessKeyId + ":" + signature;
};

var get_file = function(AWSAccessKeyId, YourSecretAccessKeyID, token, bucket, path, callback){
  var headers = get_http_headers(AWSAccessKeyId, YourSecretAccessKeyID, token, bucket, path);
  $.ajax({
    url: "https://s3.amazonaws.com/" + bucket + path,
    beforeSend: function(xhr){
        xhr.setRequestHeader("x-amz-date", headers.Date);
        xhr.setRequestHeader("Authorization", headers.Authorization);
    }
  }).done(callback).fail(function(jqXHR, textStatus, errorThrown){
    console.log("FAIL:");
    console.log(jqXHR.responseText);
  });
};

aws_js_sdk = {
  s3: function(AWSAccessKeyId, YourSecretAccessKeyID, token){
    this.AWSAccessKeyId = AWSAccessKeyId;
    this.YourSecretAccessKeyID = YourSecretAccessKeyID;
		this.token = token
    //members
    this.get_http_headers = function(bucket, path){ return get_http_headers(this.AWSAccessKeyId, this.YourSecretAccessKeyID, this.token, bucket, path);};
    this.get_authorization_header = function(query_params) { return get_authorization_header(this.AWSAccessKeyId, this.YourSecretAccessKeyID, query_params);};
    this.get_string_to_sign = function(params) { return get_string_to_sign(params);};
    this.get = function(bucket, path, callback) {return get_file(this.AWSAccessKeyId, this.YourSecretAccessKeyID, this.token, bucket, path, callback)};
  }
};
