var math = require('mathjs');
var n_chunk_size = 50, m_chunk_size = 20 

var split_matrix = function(){
  var mat = require("./create_matrix").createMatrix();
  var vec = require("./create_matrix").createVector();
  var n = mat._size[0],
      m = mat._size[1];

  // Uploading vect chunks into S3
  vec_chunks = [];
  vec_cnt = m;
  for (var i = 0;; ++i){
    vec_chunks.push({});
    vec_chunks[i].size = math.min(vec_cnt, m_chunk_size);
    vec_cnt -= vec_chunks[i].size
    var buf = new Buffer(8 * vec_chunks[i].size);
    for (var j = 0; j < vec_chunks[i].size; ++j)
      buf.writeDoubleLE(vec.get([i*m_chunk_size + j + 1,1]), j*8);
    // TODO: put the buffer in s3
    if (vec_cnt <= 0) break; // all the vec has been buffered
  }

  // Uploading mat chunks into S3
  mat_chunks = [];
  for (var i = 0; i < math.ceil(n/n_chunk_size); ++i){
    mat_chunks.push([]);
    for (var j = 0; j < math.ceil(m/m_chunk_size); ++j){
      mat_chunks[i].push({});
      mat_chunks[i][j].size_n = math.min(n_chunk_size, n - i*n_chunk_size);
      mat_chunks[i][j].size_m = math.min(m_chunk_size, m - j*m_chunk_size);
      mat_chunks[i][j].related_vec_chunk = j;
      var buf = new Buffer(8 * mat_chunks[i][j].size_n * mat_chunks[i][j].size_m);
      for (var k = 0; k < mat_chunks[i][j].size_n; ++k)
        for (var l = 0; l < mat_chunks[i][j].size_m; ++l){
          buf.writeDoubleLE(mat.get([i*n_chunk_size + k + 1, j*m_chunk_size + l + 1]), 
                            (k*mat_chunks[i][j].size_m+l)*8);
        }
      // TODO: put the buffer in s3
    }
  }
}

var main = function(){
  split_matrix();
}

main();
