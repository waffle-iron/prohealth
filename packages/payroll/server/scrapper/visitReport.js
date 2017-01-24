import ReportScrapper from './reportScrapper.js';

class VisitReport extends ReportScrapper{

  constructor(activityID, connection){
    super();
    this.activityID = activityID;
    this.connection = connection;
    this.content = this.getActivityContent();
    this.result = this.scrap();
  }

  //this function checks validity of the form
  //@return: true if it is valid, false if not, undefined otherwise.
  valid(){
    if(this.connection.status){
      let valid = true;
      if(!this.result){
        return undefined;
      }

      if(this.result.valid == "not supported"){
        return "not supported";
      }

      for(let key in this.result){

        if(!this.result[key]){
          valid = false;
          break;
        }


      }
      return valid;
    }
    else {
      return "Not Connected!!";
    }
  }

  //this function returns the main data scrapped from the form.
  //@return: scrapped data, undefined otherwise
  data(){
    if(this.connection.status){
      if(!this.result){
        return undefined;
      }
      this.result.valid = this.valid();
      return this.result;
    }
    else {
      return "Not Connected!!";
    }
  }

}//VisitReport

export default VisitReport;
