if (Meteor.isClient){
  Template.tablesControl.viewmodel({
    startDate: null,
    endDate: null,

    autorun(){
      if(this.startDate())
        ViewModel.findOne(this.parentTemplate())[this.start()](this.startDate().format("MM/DD/YYYY"));
      if(this.endDate())
        ViewModel.findOne(this.parentTemplate())[this.end()](this.endDate().format("MM/DD/YYYY"));
    },

    events: {
      "click #this-week": function(){
        this.startDate(moment().startOf('week'));
        this.endDate(moment().endOf('week'));
      },
      "click #last-week": function(){
        this.startDate(moment().subtract(1, 'week').startOf('week'));
        this.endDate(moment().subtract(1, 'week').endOf('week'));
      },
      "click #this-month": function(){
        this.startDate(moment().startOf('month'));
        this.endDate(moment().endOf('month'));
      },
      "click #last-month": function(){
        this.startDate(moment().subtract(1, 'month').startOf('month'));
        this.endDate(moment().subtract(1, 'month').endOf('month'));
      },
      "click #this-year": function(){
        this.startDate(moment().startOf('year'));
        this.endDate(moment().endOf('year'));
      },
      "click #last-year": function(){
        this.startDate(moment().subtract(1, 'year').startOf('year'));
        this.endDate(moment().subtract(1, 'year').endOf('year'));
      },
    },
  });
}
