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

var my_s3 = new aws_js_sdk.s3(AWSAccessKeyId, YourSecretAccessKeyID, null);

console.log(my_s3.get_authorization_header(query_params));

AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE";
YourSecretAccessKeyID = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
query_params = {
  http_verb: "GET",
  date:"Tue, 27 Mar 2007 19:42:41 +0000",
  bucket:"johnsmith",
  ressource_path:"/"
};

// console.log(my_s3.get_http_headers(bucket, path));

var tmpAWSAccessKeyId = "AKIAJQRF7XEWAQTLQ3LQ";
var tmpYourSecretAccessKeyID = "/GIL0+1FcmnKU6OtvKI4oYwUXLMwJ4sCknPmofEX";
var tokenAmzHeader = {"x-amz-security-token" : "AQoDYXdzEI///////////wEaoAJnM+J/s24XzZ8Lx4pjHbQaQQl+lXzYnWbkrjYu9Ty4kq9tRc4Ab4+GCAspJjKwmPu/bvgeZr0EQWrDUM5hhJd67ah5X32c9/qFbAd3smWJEA0dTajhrCBR/mYRknFr8qsvVy8W+BqmvZPFB/WGJy6rwDvtc/fEkduG7zC5mq5bZ9EbpxK7i+q03vBmgQw29ACSsYCSz7gEdZLbgYkbia0fqSND87vm0RPnQt+qo0/yeNZXDxhDTchnYMdh3gVUMCb82Cr/mdoArxm/ncpOcOweOrk23Zw02doJ/12S/s41zJqbrkHggXpIkSYccl0/h2BAANqUqw+f8R7N0R+kftjPGtWoX2wU4gZYap6biLrQuesRbfIoobEVg1O7LyvLIU4g052giwU="};
var bucket = "hpc.bucket.demo";
var path = "/demo/demo_file";

my_s3 = new aws_js_sdk.s3(tmpAWSAccessKeyId, tmpYourSecretAccessKeyID, tokenAmzHeader);
my_s3.get(bucket, path, function(data, textStatus, jqXHR) { 
  console.log(data);
});
