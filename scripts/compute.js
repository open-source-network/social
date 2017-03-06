var child_process = require('child_process');
var join = require('path').join;
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var dataDir = join(home, 'datacheckout');
var tasksFile = join(dataDir, 'tasks.json');
var execFileSync = child_process.execFileSync;
var readFileSync = require('fs').readFileSync;
var writeFileSync = require('fs').writeFileSync;

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

console.log('tasks length: ', tasks.length);
console.log('adding a task');

tasks.push('something');

writeFileSync(tasksFile, JSON.stringify(tasks));

execFileSync('git', [ 'add', '.' ], { cwd: dataDir, stdio: 'inherit'});
execFileSync('git', [ 'push' ], { cwd: dataDir, stdio: 'inherit' });