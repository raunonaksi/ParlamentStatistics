var express = require('express');
var app = express();
var path    = require("path");

var fs = require("fs");
var file = "riigi.sqlite";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

app.use(express.static(__dirname + '/View'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/Script'));
//Store all JS and CSS in Scripts folder.

/*
db.serialize(function() {
	  db.each("SELECT rowid AS id, name FROM member", function(err, row) {
	    console.log(row.id + ": " + row.name);
	  });
});
*/

app.get('/overatt', function (req, res) {
	var response = [];
	var map = new Object();
	db.each("SELECT votingresults.id AS id, member.fraction AS fraction, result , count (result) AS whole FROM votingresults LEFT JOIN member ON votingresults.member_id=member.id GROUP BY fraction, result ", function(err, row) {
		var newvalue = [];
		if (!map[row.fraction]){
			newvalue.push(row.whole);
			if (row.result === "Puudub"){
				newvalue.push(row.whole);
			} else {
				newvalue.push(0);
			}			
		} else {
			var oldValue = map[row.fraction];
			var present = oldValue[0];
			var missing = oldValue[1];
			newvalue.push(present+row.whole);
			if (row.result === "Puudub"){
				newvalue.push(missing+row.whole);
			} else {
				newvalue.push(missing);
			}
		}
		map[row.fraction] = newvalue;
	},
  function(){
  	var top = []
	for (var i = 0, keys = Object.keys(map), ii = keys.length; i < ii; i++) {
	  	var protsent = map[keys[i]][1]/map[keys[i]][0]*100;
	  	top.push({id : keys[i], value : protsent});
	} 
	res.json(top);
  });
});

app.get('/test', function (req, res) {
	var response = [];
	db.each("SELECT rowid AS id, name FROM member", function(err, row) {
		response.push({id: row.id, name: row.name});
	},
  function(){
  	res.json(response);
  });
});

app.get('/gettopmis', function (req, res) {
	var response = [];
	var map = new Object();
	db.each("SELECT votingresults.id AS id, member.name AS member_id, result FROM votingresults LEFT JOIN member ON votingresults.member_id=member.id", function(err, row) {
		var newvalue = [];
		if (!map[row.member_id]){
			newvalue.push(1);
			if (row.result === "Puudub"){
				newvalue.push(1);
			} else {
				newvalue.push(0);
			}
		} else {
			var oldValue = map[row.member_id];
			var present = oldValue[0];
			var missing = oldValue[1];
			newvalue.push(present+1);
			if (row.result === "Puudub"){
				newvalue.push(missing+1);
			} else {
				newvalue.push(missing);
			}
		}
		map[row.member_id] = newvalue;
	},
  function(){
  	var top = []
	for (var i = 0, keys = Object.keys(map), ii = keys.length; i < ii; i++) {
	  if (map[keys[i]][0] >= 400) {
	  	var protsent = (map[keys[i]][1]/map[keys[i]][0])*100;
	  	if (top.length < 5) {
	  		top.push({id : keys[i], value : protsent})
	  	} else {
	  		var tester = 0;
	  		top.forEach(function(elem, index) {
	  			if (protsent > elem.value && (tester == 0)) {
	  				top[index] = {id : keys[i], value : protsent};
	  				tester = 1;
	  			}
	  		});  
	  	  }
	  	} 
	}	
	res.json(top);
  });
});

app.get('/gettopatt', function (req, res) {
	var response = [];
	var map = new Object();
	db.each("SELECT votingresults.id AS id, member.name AS member_id, result FROM votingresults LEFT JOIN member ON votingresults.member_id=member.id", function(err, row) {
		var newvalue = [];
		if (!map[row.member_id]){
			newvalue.push(1);
			if (row.result === "Puudub"){
				newvalue.push(1);
			} else {
				newvalue.push(0);
			}
		} else {
			var oldValue = map[row.member_id];
			var all = oldValue[0];
			var missing = oldValue[1];
			newvalue.push(all+1);
			if (row.result === "Puudub"){
				newvalue.push(missing+1);
			} else {
				newvalue.push(missing);
			}
		}
		map[row.member_id] = newvalue;
	},
  function(){
  	var top = []
	for (var i = 0, keys = Object.keys(map), ii = keys.length; i < ii; i++) {
	  if (map[keys[i]][0] >= 400) {
	  	var protsent = (map[keys[i]][1]/map[keys[i]][0])*100;
	  	if (top.length < 5) {
	  		top.push({id : keys[i], value : protsent})
	  	} else {
	  		var tester = 0;
	  		top.forEach(function(elem, index) {
	  			if ((protsent < elem.value) && (tester == 0)) {
	  				top[index] = {id : keys[i], value : protsent};
	  				tester = 1;
	  			}
	  		});
	  	  }
	  	} 
	}	
	res.json(top);
  });
});

app.get('/getatt', function (req, res) {
	var pre = 0;
	var notpre = 0;
	var response = [];
	db.each("SELECT votings.id AS id, present, notpresent FROM votings", function(err, row) {
		pre = pre + parseInt(row.present, 10);
		notpre = notpre + parseInt(row.notpresent, 10);
	},
  function(){
  		response.push({status: "Present", value: pre})
  		response.push({status: "Not Present", value: notpre})
		res.json(response);
  });
});

app.get('/getTimelineAtt', function (req, res) {
	var response = [];
	db.each("SELECT votings.id AS id, present, date FROM votings", function(err, row) {
		var dateInt = row.date.slice(0,2) + row.date.slice(3,5) + row.date.slice(6,8);
		response.push({date: dateInt, value: row.present})
	},
  function(){
		res.json(response);
  });
});

app.get('/', function (req, res) {
	res.sendFile('/index.html');
});

app.get('/parlament', function (req, res) {
	res.sendFile(path.join(__dirname+'/View/parlament.html'));
});

app.get('/members', function (req, res) {
	res.sendFile(path.join(__dirname+'/View/members.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});