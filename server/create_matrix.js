
var math = require('mathjs');

module.exports.createMatrix = function(){
  var N = 100, M = 100;
  var mat = math.zeros(N, M);
  for (var i = 1; i <= N; ++i)
    for (var j = 1; j <= M; ++j)
      mat.set([i,j], math.pow(i,2) + math.pow(j,3));
  console.log("" + mat);
  console.log( Object.keys(mat), mat._size);
  return mat;
}

// Retrieve matrix from string
// var s = "" + mat;
// var m = math.matrix(eval(s));
// console.log("" + m);

// require("./create_matrix").createMatrix();