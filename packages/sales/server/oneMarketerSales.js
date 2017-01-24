function match(marketerName, fromDate, toDate, insurance, business, admitState){
  let match = {};
  match.chartStatus = { $ne: null };
  match.marketer = { $eq: marketerName };
  match.referalDate = {
    $gte : fromDate,
    $lte: toDate
  };

  if(insurance){
    if(insurance=="Medicare"){
      match["primaryInsurance"] = {$in: ["Medicare Home Health", "Hospice Medicare"]};
    } else if(insurance=="Private"){
      match["primaryInsurance"] = {$nin: ["Medicare Home Health", "Hospice Medicare"]};
    }
  }

  if(business){
    if(business=="Hospice"){
      match["agency"] = {$in: ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton']};
    } else if(business=="Homecare"){
      match["agency"] = {$in: ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton']};
    }
  }
  if(admitState){
    if(admitState=="Admitted"){
      match['chartStatus']= {"$in": ['Admitted', 'Pre-Admit W/O Con', 'Pre-Admit', 'Pre-Recert', 'Recert', 'Transferred', 'Resumption', 'Discharge W/O CON', 'D/C W/O PPW', 'Discharge']}
    } else if(admitState=="NonAdmitted"){
      match['chartStatus']= {"$nin": ['Admitted', 'Pre-Admit W/O Con', 'Pre-Admit', 'Pre-Recert', 'Recert', 'Transferred', 'Resumption', 'Discharge W/O CON', 'D/C W/O PPW', 'Discharge']}
    }
  }

  return { $match: match };
}

function level1_Projection(){
  let project = {
    referalDate: true,
    primaryInsurance: true,

    week: { $week: "$referalDate" },
    month: { $month: "$referalDate" },
    year: { $year: "$referalDate" },
  };

  project.medicareCondition = {
    $or: [
      { $eq: [ "$primaryInsurance", "Medicare Home Health" ] },
      { $eq: [ "$primaryInsurance", "Hospice Medicare" ] }
    ]
  };

  project.privateCondition = {
    $and: [
      { $ne: [ "$primaryInsurance",  "Medicare Home Health" ]},
      { $ne: [ "$primaryInsurance", "Hospice Medicare" ]}
    ]
  };

  return { $project: project };
}

function level1_Group(key){
  let group = {
    _id: {insurance: "$primaryInsurance", referalDate: key},
    totalMedicare: {$sum: {$cond: ["$medicareCondition", 1, 0]}},
    totalPrivate: {$sum: {$cond: ["$privateCondition", 1, 0]}},
    week: {$max:"$week"},
    month: {$max:"$month"},
    year: {$max:"$year"},
    total: {$sum: 1},
  };

  return { $group: group };
}

function level2_Group(){
  let group = {
    _id: "$_id.insurance",
    totalAdmitted: {$sum:"$total"},
    admits: {
      $push: {
        date: "$_id.referalDate",

        week: "$week",
        month: "$month",
        year: "$year",

        total: "$total",
        totalPrivate: {$sum: "$totalPrivate"},
        totalMedicare: {$sum: "$totalMedicare"},
      }
    },
  };

  return { $group: group };
}

Meteor.publish('oneMarketerSales', function(marketerName, fromDate, toDate, groupBy, insurance, business, admitState){
  let pipeline = [];
  let options = {};

  var key = "$referalDate";
  if(groupBy === "week"){
    key= "$week";
  }else if(groupBy === "month"){
    key = "$month";
  }else if(groupBy === "year"){
    key= "$year";
  }

  // console.log(marketerName);
  pipeline.push(match(marketerName, fromDate, toDate, insurance, business, admitState));
  pipeline.push(level1_Projection());
  pipeline.push(level1_Group(key));
  // pipeline.push({ $sort : { referalDate : 1 } });
  // pipeline.push(level2_Projection());

  pipeline.push(level2_Group());

  options.clientCollection = "oneMarketerSales";


  ReactiveAggregate(this, Patients, pipeline, options);
});
