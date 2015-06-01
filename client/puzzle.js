function nextQuestion() {
    Meteor.call('next', function(err, data){
        Session.set('question', data);
        Session.set('result', null);
    });
}

nextQuestion();

function answerText(right) {

    if(right === null) {
        return null;
    }

    // Auto jump to next question after 3 seconds
    if (right) {
        setTimeout(nextQuestion, 2000);
    }

    return right ? 'correct' : 'incorrect';
}

Template.question.helpers({
    question: function(){
        return Session.get('question');
    },
    result: function(){
        return Session.get('result');
    }
});

Template.question.events({
    'click #answerA': function () {
        Meteor.call('answer', Session.get('question').question, $('#answerA').text(), function(err, data){
            Session.set('result', answerText(data));
        });
    },
    'click #answerB': function () {
        Meteor.call('answer', Session.get('question').question, $('#answerB').text(), function(err, data){
            Session.set('result', answerText(data));
        });
    },
    'click #next': function() {
        nextQuestion();
    }
});

