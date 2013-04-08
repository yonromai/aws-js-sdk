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

var get_string_to_sign =  function(params){ // to refactor
  return params.http_verb + "\n\n\n" + params.date + '\n' + (params.bucket ? "/" + params.bucket : "") + params.ressource_path + '\n';
};

var get_authorization_header = function(AWSAccessKeyId, YourSecretAccessKeyID, query_params){
  var string_to_sign = get_string_to_sign(query_params);
  console.log(string_to_sign);
  var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1( 
    CryptoJS.enc.Utf8.stringify(string_to_sign),
    YourSecretAccessKeyID));
  return "AWS" + " " + AWSAccessKeyId + ":" + signature;
};

aws_js_sdk = {
  s3: function(AWSAccessKeyId, YourSecretAccessKeyID, query_params){
    console.log(get_authorization_header(AWSAccessKeyId, YourSecretAccessKeyID, query_params));
  }
};
