function nextQuestion() {
    Meteor.call('next', nextLevel(), function (err, data) {
        Session.set('question', data);
        Session.set('result', null);
    });
}

function nextLevel() {
    var right = ~~Session.get('right');
    var wrong = (~~Session.get('wrong') + 1);
    var currentLevel = ~~Session.get('level');

    // Best learning factor: 50%-85%
    // Min 10 answers and correct answer is higher than 85%
    if (right > 10 && ((right / wrong) * 100 > 85)) {
        // Improve one level
        currentLevel++;
        Session.set('level', currentLevel);

        // Reset counter
        Session.set('right', 0);
        Session.set('wrong', 0);
    }
    else if (currentLevel > 1 && right > 10 && ((right / wrong) * 100 < 50)) {
        // Down one level
        currentLevel--;
        Session.set('level', currentLevel);

        // Reset counter
        Session.set('right', 0);
        Session.set('wrong', 0);
    }

    return currentLevel;
}

nextQuestion();

var tmr = 0;

function answerText(right) {

    if (right === null) {
        return null;
    }

    // Auto jump to next question after 3 seconds
    if (right) {
        tmr = setTimeout(nextQuestion, 2000);
        Session.set('right', (~~Session.get('right') + 1));
    }
    else {
        Session.set('wrong', (~~Session.get('wrong') + 1));
    }

    return right ? 'correct' : 'incorrect';
}

Template.question.helpers({
    question: function () {
        return Session.get('question');
    },
    result: function () {
        return Session.get('result');
    }
});

Template.question.events({
    'click #answerA': function () {
        Meteor.call('answer', Session.get('question').question, $('#answerA').text(), function (err, data) {
            Session.set('result', answerText(data));
        });
    },
    'click #answerB': function () {
        Meteor.call('answer', Session.get('question').question, $('#answerB').text(), function (err, data) {
            Session.set('result', answerText(data));
        });
    },
    'click #next': function () {
        tmr && clearTimeout(tmr);
        nextQuestion();
    }
});

