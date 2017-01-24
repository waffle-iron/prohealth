import ReportScrapper from './reportScrapper.js';
import VisitReport from './visitReport.js';
import ProhealthConnection from './prohealthConnection.js';
import VisitsValidator from './visitsValidator.js';

let loginParams = {
                    username: "mohamed.b",
                    password: "123456789",
                    site: "prohealth",
                    action: "login",
                  };
let myConnection = new ProhealthConnection(loginParams);

Meteor.methods({
  'checkVisit'(activityID){
    myConnection.start();
    let visit = new VisitReport(activityID, myConnection);
    let res = visit.data();
    console.log(res);
    res.content = visit.content;
    return res;
  },
  'checkAllVisits'(startDate, endDate, maxResults, formStatus){
    let visitsStatus = new VisitsValidator(startDate, endDate, formStatus, false, 1, myConnection);
    let res = visitsStatus.getVisits(maxResults);
    console.log("scrapper check "+res);
    return res;
  },
  'updateVisitsTest'(maxResults){
    let myVisits = new VisitsValidator("12/09/2016", "12/10/2016", "any", true, 1, myConnection);
    console.log("Getting Things");
    let res = myVisits.getVisits(100);
    console.log(res);
    if(maxResults > 100){
      let interval = parseInt(maxResults/100);
      for(let i = 0; i < interval; i++){
        while(myVisits.busy){
          console.log("busy!");
        }
        if(!myVisits.busy){
          Meteor.setTimeout(function(){ myVisits.getVisits(maxResults-(maxResults-100)); }, 2000)
        }
      }
    }
  }
});
