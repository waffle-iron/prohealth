import './summaries.html';



// set subsribtion
//autorun
Template.visitsSummaries.setSubscribtion = () => {
    let instance = Template.instance();
    if (instance.filters.get('start-date')) {
        console.log(instance.filters.get('start-date'));
        Session.set("billsFromDate", moment(instance.filters.get('start-date'), "MM/DD/YYYY").format("YYYY-MM-DD"));
    }
    if (Session.get("billsFromDate")) {
        var st = moment(Session.get("billsFromDate"));
        instance.filters.set('start-date', st._d);
    }
    //--
    if (instance.filters.get('end-date')) {
        Session.set("billsToDate", moment(instance.filters.get('end-date'), "MM/DD/YYYY").format("YYYY-MM-DD"));
    }
    if (Session.get("billsToDate")) {
        var endDt = moment(Session.get("billsToDate"), "MM/DD/YYYY");
        instance.filters.set('end-date', endDt._d);
    }
    let field = instance.filters.get('field');
    //==========================================
    // SAVE FILTER IN SESSION
    if (field) {
        Session.set("aggrField", field);
    }
    if (Session.get("aggrField")) {
        field = Session.get("aggrField");
    }
    //END SAVE FILTER
    //========================================
    let start = instance.filters.get('start-date');
    let end = instance.filters.get('end-date');
    let query = {
        formDate: {
            $gte: start,
            $lte: end
        }
    };
    instance.subscribe('visits-aggregates', query, field);
    console.log(start);
}

Template.visitsSummaries.onRendered(function() {
    var startDate = new Pikaday({
        field: $('#start-date')[0],
        format: "MM/DD/YYYY"
    });
    var endDate = new Pikaday({
        field: $('#end-date')[0],
        format: "MM/DD/YYYY"
    });
    //$("select").material_select({});
});

Template.visitsSummaries.onCreated(function summariesOnCreated() {
    this.filters = new ReactiveDict();
    //======================================
    // FETCH FILTER IF EXISTS IN SESSION
    if (Session.get("billsFromDate")) {
        var st = moment(Session.get("billsFromDate"), "MM/DD/YYYY");
        this.filters.set('start-date', st._d);
    }
    if (Session.get("billsToDate")) {
        var endDt = moment(Session.get("billsToDate"), "MM/DD/YYYY");
        this.filters.set('end-date', endDt._d);
    }
    if (Session.get("aggrField")) {
        if (Session.get("aggrField") != "$form" && Session.get("aggrField") != "$billingState" && Session.get("aggrField") != "$marketer") {
            if (Session.get("aggrField") == "$primaryInsurance") {
                this.filters.set('field', "$insurance");
                Meteor.setTimeout(function() {
                    $("#change-field").val("$insurance");
                }, 100);
            } else {
                this.filters.set('field', Session.get("aggrField"));
                Meteor.setTimeout(function() {
                    $("#change-field").val(Session.get("aggrField"));
                }, 100);
            }
        } else {
            this.filters.set('field', "$patient");
        }
    } else {
        this.filters.set('field', "$patient");
    }
    //END FILTER
    //===========================================
    this.autorun(Template.visitsSummaries.setSubscribtion);
});

Template.visitsSummaries.helpers({
    summaries() {
        return VisitsAggregates.find().fetch().sort((a, b) => Math.sign(b.total - a.total));
    },
    totalCount() {
        return VisitsAggregates.find().fetch().reduce((prev, curr) => prev + curr.total, 0);
    },
    startDate() {
        let date = Template.instance().filters.get('start-date');
        return moment(date, "MM/DD/YYYY").format("MM/DD/YYYY");
    },
    endDate() {
        let date = Template.instance().filters.get('end-date');
        return moment(date, "MM/DD/YYYY").format("MM/DD/YYYY");
    },
    field() {
        let field = Template.instance().filters.get('field');
        return field.substr(1);
    },
});

Template.visitsSummaries.events({
    'change #update-date input' (event, instance) {
        let name = event.target.id;
        let date_str = event.target.value;
        let date = moment(date_str + " Z", "MM/DD/YYYY Z").utc()._d;
        instance.filters.set(name, date);
    },
    'change #change-field' (event, instance) {
        instance.filters.set('field', event.target.value);
    },
});
