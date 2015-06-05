ProgressClass = inherit([EventEmitter, {
    reset: function(){
        Progress.secProgress(0);
        Progress.paused = false;
    },
    speed: 90,
    paused: false,
    pause: function() {
        Progress.paused = true;
    },
    secProgress: function(value) {
        if(typeof value != 'undefined') {
            Session.set('secProgress', ~~value);
        }

        return ~~Session.get('secProgress');
    }
}]);

Progress = new ProgressClass();

Meteor.setInterval(function () {
    if(Progress.paused) {
        return;
    }

    var progress = Progress.secProgress();
    if(progress == 30) {
        Progress.pause();
        return Progress.emit('drain');
    }

    Progress.secProgress(++progress);

}, Progress.speed);

Template.progress.helpers({
    getSecProgress: function () {
        return Progress.secProgress();
    }
});
