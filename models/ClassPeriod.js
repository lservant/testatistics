function ClassPeriod() {
    var that = this;
    that.Name = ko.observable("New Hour");
    that.NumberOfStudents = ko.observable(1);
    that.MissedQuestions = ko.observableArray();
    that.Tallies = ko.observable();

    that.RemoveQuestion = function (question) {
        var removed = that.MissedQuestions.remove(question); // remove all who match the number
        removed.forEach(function (r) { that.MissedQuestions.unshift(r); }); // put them in front
        that.MissedQuestions.shift(); // knock one off
    }
    that.tallyScores = function () {
        var rtn = [];

        that.MissedQuestions().forEach(function (q) {
            if (rtn[q] == undefined) {
                rtn[q] = 1;
            } else {
                rtn[q] += 1;
            }
        }, this);

        return rtn;
    }
}
