// $.ajax({
//        url: 'https://s3.amazonaws.com/hpc.bucket.demo/demo/demo_file',
//        datatype: 'json',
//        success: function (data) {
//                body.html = data.toString();
//        }
// });

var AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE", 
    YourSecretAccessKeyID = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", 
    query_params = {
      http_verb: "GET",
      date:"Tue, 27 Mar 2007 19:36:42 +0000",
      bucket:"johnsmith",
      ressource_path:"/photos/puppy.jpg"
    };

var my_s3 = new aws_js_sdk.s3(AWSAccessKeyId, YourSecretAccessKeyID);

console.log(my_s3.get_authorization_header(query_params));

AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE";
YourSecretAccessKeyID = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
query_params = {
  http_verb: "GET",
  date:"Tue, 27 Mar 2007 19:42:41 +0000",
  bucket:"johnsmith",
  ressource_path:"/"
};

console.log(my_s3.get_http_headers(bucket, path));

var tmpAWSAccessKeyId = "fooid";
var tmpYourSecretAccessKeyID = "fooSecret";
var bucket = "hpc.bucket.demo";
var path = "/demo/demo_file";

my_s3 = new aws_js_sdk.s3(tmpAWSAccessKeyId, tmpYourSecretAccessKeyID);
my_s3.get(bucket, path, function(data, textStatus, jqXHR) { 
  console.log(data);
});