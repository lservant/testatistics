var MainViewModel = function(){
    var self = this;

    function ClassPeriod(){
        var that = this;
        that.Name = ko.observable("New Hour");
        that.NumberOfStudents = ko.observable(1);
        that.MissedQuestions = ko.observableArray();
    }

    self.Questions = ko.observable(10);
    self.ClassPeriods = ko.observableArray();
    self.SelectedClassPeriod = ko.observable();
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
    self.selectClassPeriod = function (ClassPeriod) {
        self.SelectedClassPeriod(ClassPeriod);
    }
    self.SubmitMissedQuestion = function(){
        var c = self.SelectedClassPeriod(),
            qs = c.MissedQuestions;
        if(self.IsMissedQuestionValid() === true){
            qs.push(self.MissedQuestion());
            self.MissedQuestion(undefined);
        }
    }

    self.addClassPeriod();
}
ko.applyBindings(MainViewModel);