// source: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/105074#105074
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

module.exports.guid = function() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}