
var get_http_headers = function(AWSAccessKeyId, YourSecretAccessKeyID, tokenAmzHeader, bucket, path){
  var headers = {};
  headers.Date = (new Date()).toUTCString();
  headers.Authorization = get_authorization_header(AWSAccessKeyId, YourSecretAccessKeyID, {
    http_verb: "GET",
    date: headers.Date,
		amzHeaders: [(tokenAmzHeader ? "x-amz-security-token:" + tokenAmzHeader["x-amz-security-token"] : null)],
    bucket: bucket,
    ressource_path: path
  });
  return headers;
};

var get_string_to_sign =  function(params){ // to refactor
  // Building the CanonicalizedResource
  var CanonicalizedResource = "";
  if(params.bucket)
    CanonicalizedResource += "/" + params.bucket;
  if(params.ressource_path)
    CanonicalizedResource += params.ressource_path;
  // To be compoleted, especially with the url encoded queries

  // Building the CanonicalizedAmzHeaders
  var CanonicalizedAmzHeaders = "";
  // amzHeaders should be an array of header:value strings (or as a CSList)
  if(params.amzHeaders && params.amzHeaders.lenght > 0){
    params.amzHeaders.sort();
    for(var header in params.amzHeaders)
      CanonicalizedAmzHeaders += header + "\n";
  }

  // Building the man string to sign string
  var string_to_sign = "";
  string_to_sign += params.http_verb + "\n";
  string_to_sign += (params.content ? CryptoJS.MD5(params.content): "") + "\n";
  string_to_sign += params.content_type + "\n";
  string_to_sign += params.date + '\n';
  string_to_sign += CanonicalizedResource;
  string_to_sign += CanonicalizedAmzHeaders;

  return string_to_sign;
};

var get_authorization_header = function(AWSAccessKeyId, YourSecretAccessKeyID, query_params){
  var string_to_sign = get_string_to_sign(query_params);
  console.log(string_to_sign);
  var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1( 
    CryptoJS.enc.Utf8.parse(string_to_sign),
    YourSecretAccessKeyID));
  return "AWS" + " " + AWSAccessKeyId + ":" + signature;
};

var get_file = function(AWSAccessKeyId, YourSecretAccessKeyID, amzHeaders, bucket, path, callback){
  var headers = get_http_headers(AWSAccessKeyId, YourSecretAccessKeyID, amzHeaders, bucket, path);
  $.ajax({
    url: "https://s3.amazonaws.com/" + bucket + path,
    beforeSend: function(xhr){
        xhr.setRequestHeader("x-amz-date", headers.Date);
        xhr.setRequestHeader("Authorization", headers.Authorization);
        if(amzHeaders)
          xhr.setRequestHeader("x-amz-security-token", amzHeaders["x-amz-security-token"]);
    }
  }).done(callback).fail(function(jqXHR, textStatus, errorThrown){
    console.log("FAIL:");
    console.log(jqXHR.responseText);
  });
};

aws_js_sdk = {
  s3: function(AWSAccessKeyId, YourSecretAccessKeyID, tokenAmzHeader){
    this.AWSAccessKeyId = AWSAccessKeyId;
    this.YourSecretAccessKeyID = YourSecretAccessKeyID;
		this.tokenAmzHeader = tokenAmzHeader
    //members
    this.get_http_headers = function(bucket, path){ return get_http_headers(this.AWSAccessKeyId, this.YourSecretAccessKeyID, this.tokenAmzHeader, bucket, path);};
    this.get_authorization_header = function(query_params) { return get_authorization_header(this.AWSAccessKeyId, this.YourSecretAccessKeyID, query_params);};
    this.get_string_to_sign = function(params) { return get_string_to_sign(params);};
    this.get = function(bucket, path, callback) {return get_file(this.AWSAccessKeyId, this.YourSecretAccessKeyID, this.tokenAmzHeader, bucket, path, callback)};
  }
};
