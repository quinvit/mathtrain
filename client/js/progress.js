ProgressClass = inherit([EventEmitter, {
    reset: function(){
        this.createCircle();
        this.secProgress(0);
        this.paused = false;
    },
    max: 4000,
    speed: 100,
    paused: false,
    pause: function() {
        this.paused = true;
    },
    stop: function() {
        delete this.circle;
        this.circle = null;
        this.paused = true;
    },
    createCircle: function() {
        if($('#progress-bar-container').length) {
            var max = this.max;
            this.circle = this.circle || new ProgressBar.Circle('#progress-bar-container', {
                    color: '#ffaa44', duration: 50,
                    trailColor: '#4499ee',
                    strokeWidth: 3,
                    trailWidth: 1,
                    step: function(state, bar) {
                        bar.setText((~~(max/1000) - ~~(bar.value() * max / 1000)).toFixed(0));
                    }
                });
        }
    },
    secProgress: function(value) {
        if(typeof value != 'undefined') {
            Session.set('secProgress', ~~value);
        }

        this.circle && this.circle.animate(value / this.max);

        return ~~Session.get('secProgress');
    },
    circle: null
}]);

Progress = new ProgressClass();

Meteor.setInterval(function () {
    if(Progress.paused) {
        return;
    }

    var progress = Progress.secProgress();
    if(progress >= Progress.max) {
        Progress.pause();
        return Progress.emit('drain');
    }

    progress += Progress.speed;
    Progress.secProgress(progress);

}, Progress.speed);

Template.progress.helpers({
    getSecProgress: function () {
        return Progress.secProgress();
    }
});
