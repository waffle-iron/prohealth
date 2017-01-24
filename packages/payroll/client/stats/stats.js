Template.visitsStats.viewmodel({
  headerVariable:{title:"Visits Statistics",subtitle:"Chart of visits per day",hasBack:false},
  fromDate: moment("1970-01-01").format("YYYY-MM-DD"),
  toDate: moment().utc().startOf('day').format("YYYY-MM-DD"),
  VisitsStats: new Mongo.Collection('visits-stats'),
  stillLoading: true,
  // Template and subscription initialization
  onCreated: function(template) {

    let vm = this;
    Meteor.subscribe('visits-stats', this.fromDate(), this.toDate(), {
      onStop:  function(error) {
        console.log("sub stopped");
        if (!error) {
          vm.stillLoading(true);
        }
      },
      onReady: function() {
          console.log("sub ready");
        vm.stillLoading(false);
      }
    });


  },
  onRendered: function(){
    $("select").material_select();

  },
  autorun: function() {
    let vm = this;
    Meteor.subscribe('visits-stats', this.fromDate(), this.toDate(), {
      onStop:  function(error) {
        console.log("sub stopped");
        if (!error) {
          vm.stillLoading(true);
        }
      },
      onReady: function() {
          console.log("sub ready");
        vm.stillLoading(false);
      }
    });
  },

  visitsData(){
    var data = this.VisitsStats().find().fetch();

    for(var i in data){
      data[i].x = new Date(data[i]._id);
    }

    return data;
  },
  chartOpts(){
    return {

      chart: {
          zoomType: 'x'
      },
      title: {
          text: 'Number of Visits / Day'
      },
      subtitle: {
          text: document.ontouchstart === undefined ?
                  'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },
      xAxis: {
        type: "datetime"
      },
      yAxis: {
          title: {
              text: 'Visits'
          }
      },
      legend: {
          enabled: false
      },
      plotOptions: {
          area: {
              fillColor: {
                  linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                  },
                  stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                  ]
              },
              marker: {
                  radius: 2
              },
              lineWidth: 1,
              states: {
                  hover: {
                      lineWidth: 1
                  }
              },
              threshold: null
          }
      },

      series: [{
          type: 'area',
          name: 'Visits / Day',
          data: this.visitsData()
      }]
   };
  }
})
