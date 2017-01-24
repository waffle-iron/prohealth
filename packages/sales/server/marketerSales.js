//==================================================================================
// Marketer/Admit aggregation

Meteor.publish("marketer-sales", function (fromDate,toDate,groupBy,insurance,business,admitState) { // groupBy = day / month / year
    // var agencies = [];
    // if(type && type=="Hospice"){
    //   agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton'];
    // }else{
    //   agencies = ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];
    // }
    // var agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton', 'ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];

  var match = {
    chartStatus: { $ne: null },

    referalDate: { $gte : fromDate,
                   $lte : toDate },

    // $or: [
    //       { "chartStatus": 'Admitted' },
    //       { "chartStatus": 'Pre-Admit W/O Con' },
    //       { "chartStatus": 'Pre-Admit' },
    //       { "chartStatus": 'Pre-Recert' },
    //       { "chartStatus": 'Recert' },
    //       { "chartStatus": 'Transferred' },
    //       { "chartStatus": 'Resumption' },
    //       { "chartStatus": 'Discharge W/O CON' },
    //       { "chartStatus": 'D/C W/O PPW' },
    //       { "chartStatus": 'Discharge'},
    //     ]
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
  // match["primaryInsurance"] = {$nin: ["Medicare Home Health", "Hospice Medicare"]};
  // groupBy = "day";
  var key = "$referalDate";
  if(groupBy === "week"){
    key= "$week";
  }else if(groupBy === "month"){
    key = "$month";
  }else if(groupBy === "year"){
    key= "$year";
  }

  console.log(match)
  ReactiveAggregate(this, Patients, [
    { $match: match },
    { $project:
      {
        marketer: true,
        referalDate: true,
        chartStatus: true,
        primaryInsurance: true,
        week: { $week: "$referalDate" },
        month: { $month: "$referalDate" },
        year: { $year: "$referalDate" },
        totalAdmits: {
          $and: [
            { $gte: [ "$referalDate", fromDate ] },
            { $lte: [ "$referalDate", toDate ] },
          ]
        },
        medicareSales: {
          $or: [
            { $eq: [ "$primaryInsurance", "Medicare Home Health" ] },
            { $eq: [ "$primaryInsurance", "Hospice Medicare" ] }
          ]
        },
        nonMedicareSales: {
          $and: [
            { $ne: [ "$primaryInsurance",  "Medicare Home Health" ]},
            { $ne: [ "$primaryInsurance", "Hospice Medicare" ]}
          ]
        }
      }
    },
    { $group:
      {
        _id: {marketer:"$marketer",referalDate:key}, //either $referalDate or $month or $week
        totalAdmits: { $sum: { $cond: ["$totalAdmits", 1, 0] } },
        total: { $sum: 1 },
        medicareSales: { $sum: { $cond: ["$medicareSales", 1, 0] } },
        nonMedicareSales: { $sum: { $cond: ["$nonMedicareSales", 1, 0] } },
        referalDate: {$max: '$referalDate'},
        week: {$max:"$week"},
        month: {$max:"$month"},
        year: {$max:"$year"}
      }
    },
    { $sort : { referalDate : 1 } },
    { $group:
      {
        _id: "$_id.marketer",
        totalAdmitted: {$sum:"$totalAdmits"},
        totalMedicare: {$sum:"$medicareSales"},
        totalNonMedicare: {$sum:"$nonMedicareSales"},
        admits:
        {
          $push:
            {
              referalDate: "$_id.referalDate",
              week: "$week",
              month: "$month",
              year: "$year",
              medicare: "$medicareSales",
              nonMedicare: "$nonMedicareSales",
              total: "$total",
            }
        },
      }
    },

  ], { clientCollection: "marketer-sales" });

});
//==================================================================================


//==================================================================================
// Marketer/Admit aggregation

Meteor.publish("marketer-sales-totals", function (fromDate,toDate,groupBy,insurance,business,admitState) { // groupBy = day / month / year
    // var agencies = [];
    // if(type && type=="Hospice"){
    //   agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton'];
    // }else{
    //   agencies = ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];
    // }
  var match = {
    chartStatus: { $ne: null },
    referalDate: { $gte : fromDate,
                   $lte : toDate }
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
      match['chartStatus']= {$in: ['Admitted', 'Pre-Admit W/O Con', 'Pre-Admit', 'Pre-Recert', 'Recert', 'Transferred', 'Resumption', 'Discharge W/O CON', 'D/C W/O PPW', 'Discharge']}
    } else if(admitState=="NonAdmitted"){
      match['chartStatus']= {$nin: ['Admitted', 'Pre-Admit W/O Con', 'Pre-Admit', 'Pre-Recert', 'Recert', 'Transferred', 'Resumption', 'Discharge W/O CON', 'D/C W/O PPW', 'Discharge']}
    }
  }
  // groupBy = "day";
  var key = "$referalDate";
  var key = { $dateToString: { format: "%Y-%m-%d", date: "$referalDate" } }
  if(groupBy === "week"){
    key= "$week";
  }else if(groupBy === "month"){
    key = "$month";
  }else if(groupBy === "year"){
    key= "$year";
  }
  ReactiveAggregate(this, Patients, [
    { $match: match },
    { $project:
      {
        marketer: true,
        referalDate: true,
        chartStatus: true,
        primaryInsurance: true,
        week: { $week: "$referalDate" },
        month: { $month: "$referalDate" },
        year: { $year: "$referalDate" },
        totalAdmits: {
          $and: [
            { $gte: [ "$referalDate", fromDate ] },
            { $lte: [ "$referalDate", toDate ] },
          ]
        },
        medicareSales: {
          $or: [
            { $eq: [ "$primaryInsurance", "Medicare Home Health" ] },
            { $eq: [ "$primaryInsurance", "Hospice Medicare" ] }
          ]
        },
        nonMedicareSales: {
          $and: [
            { $ne: [ "$primaryInsurance",  "Medicare Home Health" ]},
            { $ne: [ "$primaryInsurance", "Hospice Medicare" ]}
          ]
        },
      }
    },
    { $group:
      {
        _id: key,
        referalDate:{$max: "$referalDate"},
        week: {$max: "$week"},
        month: {$max: "$month"},
        year: {$max: "$year"},
        total: { $sum: { $cond: ["$totalAdmits", 1, 0] } },
        medicare: { $sum: { $cond: ["$medicareSales", 1, 0] } },
        nonMedicare: { $sum: { $cond: ["$nonMedicareSales", 1, 0] } },
      }
    },
    { $sort : { referalDate : 1 } },

  ], { clientCollection: "marketer-sales-totals" });

});
//==================================================================================
