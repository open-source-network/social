var child_process = require('child_process');
var join = require('path').join;
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var dataDir = join(home, 'datacheckout');
var tasksFile = join(dataDir, 'tasks.json');
var userListFile = join(dataDir, 'users.json');
var execFileSync = child_process.execFileSync;
var readFileSync = require('fs').readFileSync;
var writeFileSync = require('fs').writeFileSync;
var readdirSync = require('fs').readdirSync;
var sha3_224 = require('js-sha3').sha3_224;
var fetch = require('node-fetch');

var startTime = Date.now();
var timeout = startTime + (1000 * 60 * 10); // 10 minutes

execFileSync('git', [
'clone', 
'-b', 'data',
'git@github.com:open-source-network/social.git',
'datacheckout'
], { cwd: home, stdio: 'inherit' });

var tasks = [];
try {
	var file = readFileSync(tasksFile, {encoding: 'utf8'});
	tasks = JSON.parse(file);
} catch(e) {
	console.log('could not read previous tasks', e);
}

var userList = [];
try {
	var file = readFileSync(userListFile, {encoding: 'utf8'});
	userList = JSON.parse(file);
} catch(e) {
	console.log('could not read previous userList', e);
}

function enqueueTask(name, params) {
	var id = sha3_224(name+JSON.stringify(params));
	tasks.push({ name: name, params: params, id: id});
}

function crawlRoot(params, cb) {
	console.log('crawling root');
	fetch('https://api.github.com/repos/open-source-network/social/issues/1').then(function(resp) {
		return resp.json();
	}).then(function(issueData) {
		console.log('resp', issueData);
		cb();
	}).catch(function() {
		cb();
	});
}

var taskHandlers = {
	crawlRoot,
};

function doTasks() {
	var taskToDo = tasks.shift();
	
	taskHandlers[taskToDo.name](taskToDo.params, function() {

		tasks = tasks.filter(function(task) { return task.id !== taskToDo.id; });
		
		if (tasks.length > 0 && Date.now() < timeout) {
			doTasks();
		}

		
	});
}

doTasks();

writeFileSync(tasksFile, JSON.stringify(tasks));
writeFileSync(userListFile, JSON.stringify(userList));

execFileSync('git', [ 'add', tasksFile ], { cwd: dataDir, stdio: 'inherit'});
execFileSync('git', [ 'commit', '-m', 'Update-'+startTime ], { cwd: dataDir, stdio: 'inherit'});
execFileSync('git', [ 'push' ], { cwd: dataDir, stdio: 'inherit' });