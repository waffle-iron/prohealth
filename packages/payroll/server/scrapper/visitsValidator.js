import VisitReport from './visitReport.js';

class VisitsValidator {

    constructor(startDate, endDate, formStatus, insertStatus, pagingPageNum, connection) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.connection = connection;
        this.pagingPageNum = pagingPageNum;
        this.formStatus = formStatus;
        this.insertStatus = insertStatus;
    }

    getFormStatus() {
        if (this.formStatus = "any") {
            return 'Sent To Office';
        } else {
            return this.formStatus;
        }
    }

    getVisits(maxResults) {
        console.log("Getting (" + maxResults + ") Visits.");
        let callURL = this.connection.baseURL + "runReport.action";
        let pagingPageNum = this.pagingPageNum;
        let startDate = this.startDate;
        let endDate = this.endDate;
        let start = maxResults * (pagingPageNum - 1);
        let nextStart = start + maxResults;
        let previousStart = start - maxResults;
        console.log(startDate, endDate, start, nextStart, previousStart, pagingPageNum);
        if (this.connection.status) {
            this.busy = true;
            let result = Meteor.http.post(callURL,
                this.getConnectionParams(startDate, endDate, start, nextStart, pagingPageNum, previousStart, maxResults)
            );
            this.dataAnalyzer(JSON.parse(result.content).reportData);
        } else {
            console.log("Error: connection failed!")
            return false;
        }
    } //getVisits

    dataAnalyzer(data) {
        let visitsArray = [];
        for (let key in data) {
            console.log("Current Visit: " + key);
            let row = data[key];
            let activityId = row.activity.activityId;
            let currentVisit = new VisitReport(activityId, this.connection);

            let patient = row.patient.displayName || "N/A";
            let medicalRecord = row.patient.medicalRecordNum || "N/A";
            let chartStatus = row.status.displayName || "N/A";
            let agency = row.agency || "N/A";
            let insurance = row.insuranceName || "N/A";
            let form = row.form.displayName || "N/A";
            let formStatus = row.activity.status.displayName || "N/A";
            let formDate = moment(new Date(row.activity.visitDate)).utc().toDate();
            let user = row.userName || "N/A";
            let billingCode = row.values[0] || "N/A";
            let timeIn = row.values[1] || "N/A";
            let timeOut = row.values[2] || "N/A";
            let validStatus = currentVisit.valid();
            let validations = currentVisit.validation;
            console.log(validations);
            //console.log(row.activity.visitDate);
            //console.log(moment(new Date(row.activity.visitDate)));
            if (this.insertStatus) {
                let upsertRes = Visits.upsert({
                    activityId: parseInt(activityId)
                }, {
                    $set: {
                        patient,
                        medicalRecord,
                        chartStatus,
                        agency,
                        insurance,
                        form,
                        formStatus,
                        formDate,
                        user,
                        billingCode,
                        timeIn,
                        timeOut,
                        billingState: "logged",
                        validationDetails: validations,
                        validStatus: validations.valid
                    }
                });

                //  console.log("upsert result" + upsertRes);
            }
        }
        this.busy = false;

    }

    getConnectionParams(startDate, endDate, start, nextStart, pagingPageNum, previousStart, maxResults) {
        let connectionParameters = {
            headers: {
                Cookie: this.connection.cookie,
                'Response-type': "application/json"
            },
            params: {
                hhsosSessionKey: this.connection.sessionKey,
                hhsosTokenKey: this.connection.tokenKey,
                startDate,
                endDate,
                start,
                nextStart,
                pagingPageNum,
                previousStart,
                maxResults,
                reportId: '17',
                order: 'visitDate',
                actionToPerform: "update",
                mainMenuForward: 'adminMenu.action',
                desc: '1',
                printType: 'specified',
                pushType: 'selectedUsers',
                selectedActivityStatuses: this.getFormStatus(), //'Submitted',//Sent to office
                selectedFormIds: '73,108,109,76,123,114,110,111,81,82,179,174,64,66,67,142,68,65,69,70,143,71,129,135,130,131,133,134,181,177,83,84,136,132,112,113,117',
                selectedMarkAsFilter3: 'both',
                selectedPatientId: '-1',
                selectedUserId: '-1',
                sendType: 'push',
            },
        };

        return connectionParameters;
    }

} //VisitsValidator

export default VisitsValidator;
