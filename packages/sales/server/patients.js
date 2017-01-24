Meteor.startup(function() {
    process.env.MAIL_URL = "smtp://prohealth:du07l4b5@smtp.sendgrid.net:587";
});

Meteor.publish("patients", function() {
    return Patients.find({}, {
        limit: 5
    });
});

Meteor.publish("patients-stats", function(fromDate, toDate) {
    ReactiveAggregate(this, Patients, [{
            $match: {
                referalDate: {
                    $gte: moment(fromDate)._d,
                    $lte: moment(toDate)._d
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y/%m/%d",
                        date: "$referalDate"
                    }
                },
                y: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ], {
        clientCollection: 'patients-stats'
    });
});

Meteor.publish("patients-aggregates", function(query, field) {
    ReactiveAggregate(this, Patients, [{
            $match: query
        },
        {
            $group: {
                _id: field,
                total: {
                    $sum: 1
                }
            }
        }
    ], {
        clientCollection: "patients-aggregates"
    });
});

Meteor.publish("allpatients", function() {
    return Patients.find({})
});

// Patients two level aggregation
Meteor.publish("patients-spreadsheet", function(type, date, field1, field2, insurances) {

    var agencies = [];
    if (type && type == "Hospice") {
        agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton'];
    } else {
        agencies = ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];
    }

    var match = {
        [field1.substr(1)]: {
            $ne: null
        },
        [field2.substr(1)]: {
            $ne: null
        },
        chartStatus: {
            $ne: null
        },
        agency: {
            $in: agencies
        },
        referalDate: {
            $gte: moment(date, "MM/DD/YYYY").startOf('month')._d,
            $lte: moment(date, "MM/DD/YYYY").endOf('month')._d
        }
    };

    if (insurances) {
        match["primaryInsurance"] = {
            $in: insurances
        };
    }
    ReactiveAggregate(this, Patients, [{
            $match: match
        },
        {
            $project: {
                [field1.substr(1)]: true,
                [field2.substr(1)]: true,
                chartStatus: true,
                dayLead: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('day')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('day')._d]
                        },
                        {
                            $eq: ["$chartStatus", 'Lead']
                        }
                    ]
                },
                dayReferral: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('day')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('day')._d]
                        },
                    ]
                },
                weekLead: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('week')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('week')._d]
                        },
                        {
                            $eq: ["$chartStatus", 'Lead']
                        }
                    ]
                },
                weekReferral: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('week')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('week')._d]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: {
                    field1,
                    field2
                },
                dayLeads: {
                    $sum: {
                        $cond: ["$dayLead", 1, 0]
                    }
                },
                dayReferrals: {
                    $sum: {
                        $cond: ["$dayReferral", 1, 0]
                    }
                },
                weekLeads: {
                    $sum: {
                        $cond: ["$weekLead", 1, 0]
                    }
                },
                weekReferrals: {
                    $sum: {
                        $cond: ["$weekReferral", 1, 0]
                    }
                },
                monthLeads: {
                    $sum: {
                        $cond: [{
                            $eq: ["$chartStatus", 'Lead']
                        }, 1, 0]
                    }
                },
                monthReferrals: {
                    $sum: {
                        $cond: [{
                            $ne: ["$chartStatus", 'Lead']
                        }, 1, 0]
                    }
                },
                monthNonAdmit: {
                    $sum: {
                        $cond: [{
                            $eq: ["$chartStatus", 'Non-Admit']
                        }, 1, 0]
                    }
                },
                monthAdmitted: {
                    $sum: {
                        $cond: [{
                            $or: [{
                                    $eq: ["$chartStatus", 'Admitted']
                                },
                                {
                                    $eq: ["$chartStatus", 'Admitted W/O Con']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Admit W/O Con']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Admit']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Recert']
                                },
                                {
                                    $eq: ["$chartStatus", 'Recert']
                                },
                                {
                                    $eq: ["$chartStatus", 'Transferred']
                                },
                                {
                                    $eq: ["$chartStatus", 'Resumption']
                                },
                                {
                                    $eq: ["$chartStatus", 'Discharged W/O Con']
                                },
                                {
                                    $eq: ["$chartStatus", 'DC wo ppw']
                                },
                                {
                                    $eq: ["$chartStatus", 'Live Discharge']
                                },
                                {
                                    $eq: ["$chartStatus", 'Discharged']
                                },
                                {
                                    $eq: ["$chartStatus", 'Revocation']
                                },
                                {
                                    $eq: ["$chartStatus", 'Death Discharge']
                                },



                            ]
                        }, 1, 0]
                    }
                },


                // monthPreAdmitWOCon: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Pre-Admit W/O Con' ] }, 1, 0] } },
                // monthPreAdmit: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Pre-Admit' ] }, 1, 0] } },
                // monthPreRecert: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Pre-Recert' ] }, 1, 0] } },
                // monthRecert: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Recert' ] }, 1, 0] } },
                // monthTransferred: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Transferred' ] }, 1, 0] } },
                // monthResumption: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Resumption' ] }, 1, 0] } },
                // monthDischargeWON: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Discharge W/O CON' ] }, 1, 0] } },
                // monthDCWOPPW: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'D/C W/O PPW' ] }, 1, 0] } },
                // monthDischarge: { $sum: { $cond: [{ $eq: [ "$chartStatus", 'Discharge' ] }, 1, 0] } },


            }
        },
        {
            $sort: {
                monthReferrals: -1
            }
        },
        {
            $group: {
                _id: "$_id.field1",
                dayLeads: {
                    $sum: "$dayLeads"
                },
                dayReferrals: {
                    $sum: "$dayReferrals"
                },
                weekLeads: {
                    $sum: "$weekLeads"
                },
                weekReferrals: {
                    $sum: "$weekReferrals"
                },
                monthLeads: {
                    $sum: "$monthLeads"
                },
                monthReferrals: {
                    $sum: "$monthReferrals"
                },
                monthNonAdmit: {
                    $sum: "$monthNonAdmit"
                },
                monthAdmitted: {
                    $sum: "$monthAdmitted"
                },

                // monthPreAdmitWOCon: { $sum: "$monthPreAdmitWOCon" },
                // monthPreAdmit: { $sum: "$monthPreAdmit" },
                // monthPreRecert: { $sum: "$monthPreRecert" },
                // monthRecert: { $sum: "$monthRecert" },
                // monthTransferred: { $sum: "$monthTransferred" },
                // monthResumption: { $sum: "$monthResumption" },
                // monthDischargeWON: { $sum: "$monthDischargeWON" },
                // monthDCWOPPW: { $sum: "$monthDCWOPPW" },
                // monthDischarge: { $sum: "$monthDischarge" },

                field2Aggregates: {
                    $push: {
                        _id: "$_id.field2",
                        dayLeads: "$dayLeads",
                        dayReferrals: "$dayReferrals",
                        weekLeads: "$weekLeads",
                        weekReferrals: "$weekReferrals",
                        monthLeads: "$monthLeads",
                        monthReferrals: "$monthReferrals",
                        monthNonAdmit: "$monthNonAdmit",
                        monthAdmitted: "$monthAdmitted",
                        // monthPreAdmitWOCon: "$monthPreAdmitWOCon",
                        // monthPreAdmit: "$monthPreAdmit" ,
                        // monthPreRecert: "$monthPreRecert" ,
                        // monthRecert: "$monthRecert" ,
                        // monthTransferred: "$monthTransferred" ,
                        // monthResumption: "$monthResumption" ,
                        // monthDischargeWON: "$monthDischargeWON" ,
                        // monthDCWOPPW: "$monthDCWOPPW" ,
                        // monthDischarge: "$monthDischarge",
                    }
                }
            }
        },



        {
            $sort: {
                monthReferrals: -1
            }
        }
    ], {
        clientCollection: "patients-spreadsheet"
    });

});

//==================================================================================
// Patients one level aggregation
Meteor.publish("patients-spreadsheet-notm", function(type, date, field2, insurances) {

    var agencies = [];
    if (type && type == "Hospice") {
        agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton'];
    } else {
        agencies = ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];
    }

    var match = {
        [field2.substr(1)]: {
            $ne: null
        },
        chartStatus: {
            $ne: null
        },
        agency: {
            $in: agencies
        },
        referalDate: {
            $gte: moment(date, "MM/DD/YYYY").startOf('month')._d,
            $lte: moment(date, "MM/DD/YYYY").endOf('month')._d
        }
    };

    // if(insurances){
    match["primaryInsurance"] = {
        $nin: ["Medicare Home Health", "Hospice Medicare"]
    };
    // }

    ReactiveAggregate(this, Patients, [{
            $match: match
        },
        {
            $project: {
                // [field1.substr(1)]: true,
                [field2.substr(1)]: true,
                chartStatus: true,
                dayLead: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('day')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('day')._d]
                        },
                        {
                            $eq: ["$chartStatus", 'Lead']
                        }
                    ]
                },
                dayReferral: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('day')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('day')._d]
                        },
                    ]
                },
                weekLead: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('week')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('week')._d]
                        },
                        {
                            $eq: ["$chartStatus", 'Lead']
                        }
                    ]
                },
                weekReferral: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('week')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('week')._d]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: field2,
                dayLeads: {
                    $sum: {
                        $cond: ["$dayLead", 1, 0]
                    }
                },
                dayReferrals: {
                    $sum: {
                        $cond: ["$dayReferral", 1, 0]
                    }
                },
                weekLeads: {
                    $sum: {
                        $cond: ["$weekLead", 1, 0]
                    }
                },
                weekReferrals: {
                    $sum: {
                        $cond: ["$weekReferral", 1, 0]
                    }
                },
                monthLeads: {
                    $sum: {
                        $cond: [{
                            $eq: ["$chartStatus", 'Lead']
                        }, 1, 0]
                    }
                },
                monthReferrals: {
                    $sum: 1
                },
                monthNonAdmit: {
                    $sum: {
                        $cond: [{
                            $eq: ["$chartStatus", 'Non-Admit']
                        }, 1, 0]
                    }
                },
                monthAdmitted: {
                    $sum: {
                        $cond: [{
                            $or: [{
                                    $eq: ["$chartStatus", 'Admitted']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Admit W/O Con']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Admit']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Recert']
                                },
                                {
                                    $eq: ["$chartStatus", 'Recert']
                                },
                                {
                                    $eq: ["$chartStatus", 'Transferred']
                                },
                                {
                                    $eq: ["$chartStatus", 'Resumption']
                                },
                                {
                                    $eq: ["$chartStatus", 'Discharge W/O CON']
                                },
                                {
                                    $eq: ["$chartStatus", 'D/C W/O PPW']
                                },
                                {
                                    $eq: ["$chartStatus", 'Discharge']
                                },
                            ]
                        }, 1, 0]
                    }
                },

            }
        },
        {
            $sort: {
                monthReferrals: -1
            }
        },

    ], {
        clientCollection: "patients-spreadsheet-notm"
    });

});
//==================================================================================


// Patients one level aggregation
Meteor.publish("patients-spreadsheet-m", function(type, date, field2, insurances) {

    var agencies = [];
    if (type && type == "Hospice") {
        agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton'];
    } else {
        agencies = ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];
    }

    var match = {
        [field2.substr(1)]: {
            $ne: null
        },
        chartStatus: {
            $ne: null
        },
        agency: {
            $in: agencies
        },
        referalDate: {
            $gte: moment(date, "MM/DD/YYYY").startOf('month')._d,
            $lte: moment(date, "MM/DD/YYYY").endOf('month')._d
        }
    };

    // if(insurances){
    match["primaryInsurance"] = {
        $in: ["Medicare Home Health", "Hospice Medicare"]
    };
    // }

    ReactiveAggregate(this, Patients, [{
            $match: match
        },
        {
            $project: {
                // [field1.substr(1)]: true,
                [field2.substr(1)]: true,
                chartStatus: true,
                dayLead: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('day')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('day')._d]
                        },
                        {
                            $eq: ["$chartStatus", 'Lead']
                        }
                    ]
                },
                dayReferral: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('day')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('day')._d]
                        },
                    ]
                },
                weekLead: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('week')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('week')._d]
                        },
                        {
                            $eq: ["$chartStatus", 'Lead']
                        }
                    ]
                },
                weekReferral: {
                    $and: [{
                            $gte: ["$referalDate", moment(date, "MM/DD/YYYY").startOf('week')._d]
                        },
                        {
                            $lte: ["$referalDate", moment(date, "MM/DD/YYYY").endOf('week')._d]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: field2,
                dayLeads: {
                    $sum: {
                        $cond: ["$dayLead", 1, 0]
                    }
                },
                dayReferrals: {
                    $sum: {
                        $cond: ["$dayReferral", 1, 0]
                    }
                },
                weekLeads: {
                    $sum: {
                        $cond: ["$weekLead", 1, 0]
                    }
                },
                weekReferrals: {
                    $sum: {
                        $cond: ["$weekReferral", 1, 0]
                    }
                },
                monthLeads: {
                    $sum: {
                        $cond: [{
                            $eq: ["$chartStatus", 'Lead']
                        }, 1, 0]
                    }
                },
                monthReferrals: {
                    $sum: 1
                },
                monthNonAdmit: {
                    $sum: {
                        $cond: [{
                            $eq: ["$chartStatus", 'Non-Admit']
                        }, 1, 0]
                    }
                },
                monthAdmitted: {
                    $sum: {
                        $cond: [{
                            $or: [{
                                    $eq: ["$chartStatus", 'Admitted']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Admit W/O Con']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Admit']
                                },
                                {
                                    $eq: ["$chartStatus", 'Pre-Recert']
                                },
                                {
                                    $eq: ["$chartStatus", 'Recert']
                                },
                                {
                                    $eq: ["$chartStatus", 'Transferred']
                                },
                                {
                                    $eq: ["$chartStatus", 'Resumption']
                                },
                                {
                                    $eq: ["$chartStatus", 'Discharge W/O CON']
                                },
                                {
                                    $eq: ["$chartStatus", 'D/C W/O PPW']
                                },
                                {
                                    $eq: ["$chartStatus", 'Discharge']
                                },
                            ]
                        }, 1, 0]
                    }
                },

            }
        },
        {
            $sort: {
                monthReferrals: -1
            }
        },

    ], {
        clientCollection: "patients-spreadsheet-m"
    });

});

extractDate = (dateStr) => {
    return dateStr.length > 0 ? moment(dateStr + " Z", "MM/DD/YYYY Z").utc()._d : null;
}

patientsRequest = (Cookie, hhsosSessionKey, hhsosTokenKey, startDate, endDate, maxResults, pagingPageNum) => {
    let start = maxResults * (pagingPageNum - 1);
    let nextStart = start + maxResults;
    let previousStart = start - maxResults;
    console.log("requesting patients..");
    Meteor.http.post(
        "https://prohealth.devero.com/runReport.action", {
            headers: {
                Cookie,
                'Response-type': "application/json"
            },
            params: {
                hhsosSessionKey,
                hhsosTokenKey,
                startDate,
                endDate,

                maxResults,
                start,
                nextStart,
                pagingPageNum,
                previousStart,

                reportId: '44',
                actionToPerform: "update",
                printType: 'specified',
                selectedActivityStatuses: 'Submitted,Resubmitted,Cosigning,Shared,Pending,Reviewed,Completed',
                selectedFormIds: '20',
                selectedPatientId: '-1',
                selectedUserId: '-1',
                sendType: 'fax',
                faxType: 'selectedOnForm',
            },
        },
        (error, result) => {
            if (!error) {
                let data = JSON.parse(result.content).reportData;
                console.log("returned");
                for (let key in data) {

                    let row = data[key];
                    let activityId = row.activity.activityId;
                    let patientDeveroId = row.patient.patientId;
                    let mrn = row.patient.medicalRecordNum;
                    let patient = row.patient.displayName;
                    let agency = row.agency;
                    let agencyId = parseInt(row.agencyIdString) || "Agency N/A";;
                    // could be blank

                    let marketer = row.values[0] || "Marketer N/A";
                    let primaryInsurance = row.values[1] || "Insurance N/A";
                    let secondaryInsurance = row.values[2] || "2nd Insurance N/A";
                    let referalDate = extractDate(row.values[3]);
                    let socDate = extractDate(row.values[4]);
                    let chartStatus = row.status.statusName || "Status N/A";
                    // update or insert record into db
                    var patients = Patients.find({
                        patient
                    }).fetch();
                    var match = {
                        patient,
                        mrn
                    };
                    console.log(mrn, patient, marketer, row);
                    var insuranceType;
                    if (primaryInsurance && primaryInsurance.indexOf("Medicare") > -1)
                        insuranceType = "Public";
                    else
                        insuranceType = "Private";

                    var businessType;
                    if (agency && agency.indexOf("Hospice") > -1)
                        businessType = "Hospice";
                    else
                        businessType = "Homecare";

                    Patients.upsert(
                        match, {
                            $set: {
                                patientDeveroId,
                                patient,
                                chartStatus,
                                agencyId,
                                agency,
                                marketer,
                                primaryInsurance,
                                secondaryInsurance,
                                referalDate,
                                socDate,
                                agencyId,
                                agency,
                                mrn,
                                businessType,
                                insuranceType
                            }
                        }
                    );
                    if (data.length == maxResults) {
                        patientsRequest(Cookie, hhsosSessionKey, hhsosTokenKey, startDate, endDate, maxResults, pagingPageNum + 1);
                    } else {
                        // PatientsSettings.update( { key: 'updating' }, { $set: { value: false } });
                    }
                }
            }
        });

}

Meteor.methods({
    "patients.update" (startDate, endDate, maxResults = 10000) {

        console.log("patients.update: ", startDate, endDate, maxResults);

        //PatientsSettings.upsert( { key: 'updating' }, { $set: { value: true } });
        let base = "https://prohealth.devero.com/";
        Meteor.http.post(
            base + "login.action", {
                params: {
                    username: "mohamed.b",
                    password: "123456789",
                    site: "prohealth",
                    action: "login",
                },
            },
            (error, result) => {
                //console.log(error);
                if (!error) {
                    // console.log("login!")
                    let Cookie = result.headers["set-cookie"];
                    let hhsosSessionKey = result.headers["location"].split('hhsosSessionKey=')[1].split('&')[0];
                    let location = result.headers["location"].split(';')[0];
                    console.log("logging in")
                    Meteor.http.get(
                        base + location, {
                            headers: {
                                Cookie,
                                'Response-type': "application/json",
                            },
                            params: {
                                hhsosSessionKey,
                                fromLogin: "true",
                                patientAnalytics: 'true',
                            },
                        },
                        (error, result) => {
                            // console.log(error);
                            if (!error) {
                                // console.log("requesting patients");
                                let hhsosTokenKey = JSON.parse(result.content).hhsosTokenKey;
                                patientsRequest(Cookie, hhsosSessionKey, hhsosTokenKey, startDate, endDate, maxResults, 1);
                            }
                        }
                    );
                }
            }
        );
    },

    'sendemail' (to, from, subject, text) {
        // SSR.compileTemplate('htmlEmail', text);
        this.unblock(); // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        try {
            Email.send({
                to: to,
                from: from,
                subject: subject,
                // html: SSR.render('htmlEmail'),
                attachments: [{
                    fileName: subject + '.csv',
                    contents: text,
                    contentType: 'csv',
                }],
            });
            return true;
        } catch (e) {
            throw new Meteor.Error(e.name, e.message);
        }
    }
});
