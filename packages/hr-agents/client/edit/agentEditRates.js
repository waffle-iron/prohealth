import {
    accounting
} from 'meteor/iain:accounting'
Template.agentEditRatesCollectionItem.viewmodel({
    amount: 0,
    thisAgent: function() {
        return Router.current().params._id;
    },
    rate: function() {
        return accounting.formatMoney(this.amount());
    },
    hasRate: function() {
        return CompensationRates.findOne({
            $and: [{
                agent: this.parent()._id()
            }, {
                compensation_type: this._id()
            }]
        });

        // if()
    },
    hasFormType: function() {
        visit = Visits.findOne({
            form: this.name()
        });
        console.log("here");
        console.log(visit);
        if (visit)
            return true;
        return false;
    },
    amountId: function() {
        return "amount" + this._id();
    }
});
Template.agentEditRates.viewmodel({
    onRendered: function() {
        Materialize.updateTextFields();
        // setTimeout(function () {
        //   $('select').material_select();
        // }, 100);
    },
    onCreated: function() {
        Meteor.subscribe("agentRates", Router.current().params._id);
        // Meteor.subscribe("agentVisitsByName", Agents.findOne({
        //     _id: Router.current().params._id
        // }).name);
        Meteor.subscribe("compensation_types");
        Materialize.updateTextFields();
    },
    rateTypes: function() {
        return CompensationTypes.find({});
    },

    events: {
        "click .btn-commit": function() {
            _.each(CompensationTypes.find().fetch(), function(type) {
                if ($(".amount" + type._id).val())
                    $("#" + type._id).submit();
            });
        },
        "change #rateJump": function(event) {
            console.log(event.target.value);
            $(".amount" + event.target.value).focus();
        }
    }
});
