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

function crawlRoot(params) {
	console.log('crawling root');
}

var tasks = {
	crawlRoot,
};

function doATask() {
	var taskToDo = tasks.shift();
	
	tasks[task.name](taskToDo.params);

	tasks = tasks.filter(function(task) { return task.id !== taskToDo.id; });
	
	if (tasks.length > 0 && Date.now() < timeout) {
		doATask();
	}
	
}

writeFileSync(tasksFile, JSON.stringify(tasks));
writeFileSync(userListFile, JSON.stringify(userList));

execFileSync('git', [ 'add', tasksFile ], { cwd: dataDir, stdio: 'inherit'});
execFileSync('git', [ 'commit', '-m', 'Update-'+startTime ], { cwd: dataDir, stdio: 'inherit'});
execFileSync('git', [ 'push' ], { cwd: dataDir, stdio: 'inherit' });