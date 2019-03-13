const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readFileAsync = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    items[id] = text;
    var filePath = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null, {id, text});
      }
    });
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('files not found');
    } else {
      var data = _.map(files, (file) => {
        var id = path.basename(file, '.txt');
        var filePath = path.join(exports.dataDir, file);
        return readFileAsync(filePath).then (fileData => {
          return {
            id: id,
            text: fileData.toString()
          };
        }); 
      });
      Promise.all(data).then(items => callback(null, items));
    }
  });
};

// _.each(files, (file) => {
//   file = file.slice(0, 5);
//   data.push({id: file, text});
// });
// callback(null, data);
  

//promise all only takes in an array
//we are interating through each file with readFile
//use promise with read file and then return the object set to the id and the text



exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err, text) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {id, text: text.toString()});
    }
  });
};

exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filePath, (err) => callback(err));
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
