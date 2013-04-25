
var math = require('mathjs');
var N = 200, M = 200;

module.exports.createMatrix = function(){
  var mat = math.zeros(N, M);
  for (var i = 1; i <= N; ++i)
    for (var j = 1; j <= M; ++j)
      mat.set([i,j], i*2 + j*3);
  return mat;
}

module.exports.createVector = function(){
  var vec = math.zeros(M,1);
  for (var j = 1; j <= M; ++j)
    vec.set([j,1], 7*j);
  return vec;
}



// Retrieve matrix from string
// var s = "" + mat;
// var m = math.matrix(eval(s));
// console.log("" + m);

// require("./create_matrix").createMatrix();