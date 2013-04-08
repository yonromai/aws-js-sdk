var AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE", 
    YourSecretAccessKeyID = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", 
    query_params = {
      http_verb: "GET",
      date:"Tue, 27 Mar 2007 19:36:42 +0000",
      bucket:"johnsmithéé",
      ressource_path:"/photos/puppy.jpg"
    };

aws_js_sdk.s3(AWSAccessKeyId, YourSecretAccessKeyID, query_params);

AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE";
YourSecretAccessKeyID = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
query_params = {
  http_verb: "GET",
  date:"Tue, 27 Mar 2007 19:42:41 +0000",
  bucket:"johnsmith",
  ressource_path:"/"
};

aws_js_sdk.s3(AWSAccessKeyId, YourSecretAccessKeyID, query_params);

