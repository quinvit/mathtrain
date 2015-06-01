Meteor.startup(function () {
    Questions.remove({});
    nextQuestion();
});

var Questions = new Mongo.Collection("questions");
Questions._ensureIndex({ "question": 1});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function nextQuestion() {
    var x = getRandomInt(0, 100);
    var y = getRandomInt(0, 100);

    var z = x + y;
    var d = x + y + getRandomInt(-5, 5) * 10;
    var a = (d % 2) ? z : d;
    var b = (d % 2) ? d : z;

    var q = {
        question: [x, ' + ', y, ' = ?'].join(''),
        answers: {
            answerA: a,
            answerB: b
        },
        correct_answer: z
    };

    var existingQuestion = Questions.find({question: q.question});

    if(!existingQuestion.question) {
        Questions.insert(q);
    }
    else {
        q = existingQuestion;
    }

    return {
        question: q.question,
        answers: q.answers
    };
}

Meteor.methods({
    next: function(){
        var q = nextQuestion();
        return q;
    },
    answer: function(q, a) {

        if(!q || !a) {
            return null;
        }

        var question = Questions.findOne({question: q});

        if(!question) {
            return null;
        }

        return (a == question.correct_answer);
    }
});