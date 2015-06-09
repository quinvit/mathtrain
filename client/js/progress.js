Progress = {
    _progressDepend: new Tracker.Dependency,
    _drainDepend: new Tracker.Dependency,
    max: 4000,
    speed: 100,
    paused: true,
    reset: function () {
        this.circle();
        this.progress(0);
        this.drain(false);
        this.pause(false);
    },
    pause: function (value) {
        this.paused = (typeof value == 'undefined' || value === true);
    },
    stop: function () {
        this.pause();

        // Avoid memory leak, don't know how to react this
        delete this._circle;
        this._circle = null;
    },
    _progressValue: undefined,
    progress: function (value) {

        if (typeof value != 'undefined') {
            this._progressValue = ~~value;
            this._progressDepend.changed();
        }
        else {
            this._progressDepend.depend();
        }

        return this._progressValue;
    },
    _drainValue: undefined,
    drain: function (value) {
        if (typeof value != 'undefined') {
            this._drainValue = value;
            this._drainDepend.changed();
        }
        else {
            this._drainDepend.depend();
        }

        return this._drainValue;
    },
    _circle: null,
    circle: function () {
        if ($('#progress-bar-container').length) {
            var max = this.max;
            this._circle = this._circle || new ProgressBar.Circle('#progress-bar-container', {
                    color: '#ffaa44', duration: 50,
                    trailColor: '#4499ee',
                    strokeWidth: 3,
                    trailWidth: 1,
                    step: function (state, bar) {
                        bar.setText((~~(max / 1000) - ~~(bar.value() * max / 1000)).toFixed(0));
                    }
                });
        }

        return this._circle;
    }
};

/************
 Update circle when value changes
 *************/
Tracker.autorun(function () {
    // Get progress
    var value = Progress.progress();
    if (value > Progress.max) {
        return Progress.drain(true);
    }

    Progress.circle() && Progress.circle().animate(value / Progress.max);
});

/************
 Pause when drain
 *************/
Tracker.autorun(function () {
    // Get drain status
    var value = Progress.drain();
    if (value) {
        Progress.pause();
    }
});

Meteor.setInterval(function () {
    if (Progress.paused) {
        return;
    }

    Progress.progress(Progress.progress() + Progress.speed);

}, Progress.speed);

Template.progress.helpers({});