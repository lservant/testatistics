ko.bindingHandlers.enterkey = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

var MainViewModel = function(){
    var self = this;

    function ClassPeriod(){
        var that = this;
        that.Name = ko.observable("New Hour");
        that.NumberOfStudents = ko.observable(1);
        that.MissedQuestions = ko.observableArray();
        that.Tallies = ko.observable();

        that.RemoveQuestion = function(question){
            var removed = that.MissedQuestions.remove(question); // remove all who match the number
            removed.forEach(function(r){ that.MissedQuestions.unshift(r); }); // put them in front
            that.MissedQuestions.shift(); // knock one off
        }
    }

    function TallyScores(missedQs){
        var rtn = [];
        
        missedQs.forEach(function(q) {
            if(rtn[q] == undefined){
                rtn[q] = 1;
            }else{
                rtn[q] += 1;
            }
        }, this);

        console.log(rtn);
        return rtn;
    }

    self.Questions = ko.observable(10);
    self.ClassPeriods = ko.observableArray();
    self.SelectedClassPeriod = ko.observable();
    self.SelectedClassPeriod.subscribe(function (classPeriod){
        classPeriod.Tallies(TallyScores(classPeriod.MissedQuestions()));
    })
    self.MissedQuestion = ko.observable();

    self.NumberOfClassPeriods = ko.pureComputed(function(){
        return self.ClassPeriods().length;
    });
    self.IsMissedQuestionValid = ko.pureComputed(function(){
        var q = self.MissedQuestion();
        if(parseInt(q) == NaN){
            return "Only numbers allowed"
        }else if(q <= 0 || q > self.Questions()){
            return "Question is out of bounds";
        }else{
            return true;
        }
    });

    self.addClassPeriod = function () {
        var newClass = new ClassPeriod();
        self.ClassPeriods.push(newClass);
        self.selectClassPeriod(newClass);
    }
    self.selectClassPeriod = function (classPeriod) {
        self.SelectedClassPeriod(classPeriod);
    }
    self.SubmitMissedQuestion = function(){
        var c = self.SelectedClassPeriod(),
            qs = c.MissedQuestions;
        if(self.IsMissedQuestionValid() === true){
            qs.push(self.MissedQuestion());
            self.MissedQuestion(undefined);
        }
    }
    self.TallyScores = function(){
        var current = self.SelectedClassPeriod();
        if(current){
            current.Tallies(TallyScores(current.MissedQuestions()));
        }
    };

    self.addClassPeriod();
}
ko.applyBindings(MainViewModel);