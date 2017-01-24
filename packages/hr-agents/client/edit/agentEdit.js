Template.agentEdit.viewmodel({
    headerVariable: function() {
        var agent = Agents.findOne({
            "_id": Router.current().params._id
        });
        var title = "";
        var subtitle = "";
        if (agent) {
            title = agent.name;
            subtitle = "Editing " + agent.name + "'s profile"
        }
        return {
            title: title,
            subtitle: subtitle,
            hasBack: true
        };

    },
    currentTab: "agentEditGeneral",
    tab: function() {
        return this.currentTab();
    },
    tabTitle: function() {
        if (this.currentTab() === "agentEditGeneral")
            return "General Info";
        else if (this.currentTab() === "agentEditRates")
            return "Agent Rates"
        else if (this.currentTab() === "agentEditDocuments")
            return "Agent Documents"
        else if (this.currentTab() === "personal")
            return "Personal Info"
    },
    isRatesTab: function() {
        if (this.currentTab() === "agentEditRates")
            return true;
        else
            return false;
    },
    onCreated: function() {
        Meteor.subscribe('agent', Router.current().params._id);

        // console.log(Session.get("activeProfileTab"));
        if (!Session.get("activeProfileTab")) {
            Session.set("activeProfileTab", "agentEditGeneral");
        }
        // $("#agentEditGeneral").toggleClass("active");

    },
    onRendered: function() {
        // Meteor.subscribe("agent", Router.current().params._id);
        if (Session.get("activeProfileTab")) {
            this.currentTab(Session.get("activeProfileTab"));
            $("#" + Session.get("activeProfileTab")).toggleClass("active");
        } else {
            $("#agentEditGeneral").toggleClass("active");
        }
        $('.collapsible').collapsible({
            accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    },
    autorun: function() {
        // this.templateInstance.subscribe("agent", Router.current().params._id);
        // this.templateInstance.subscribe("agents",{});
        // sub = this.templateInstance.subscribe("compensation_types");

        // if (sub.ready())
    },
    rateTypes: function() {
        return CompensationTypes.find({}, {
            sort: {
                name: 1
            }
        });
    },
    agent: function() {
        return Agents.findOne({
            "_id": Router.current().params._id
        });
    },
    autocompleteSettings: function() {
        return {
            position: "bottom",
            limit: 5,
            rules: [{
                token: '',
                collection: CompensationTypes,
                field: "name",
                template: Template.autocompleteTemplate
            }, ]
        };
    },
    events: {
        "autocompleteselect input": function(event, template, doc) {
            console.log(event.target.value);
            var val = CompensationTypes.findOne({
                name: event.target.value
            })._id
            $(".amount" + val).focus();
        },
        "click .submit-agent": function() {
            $(".documentForm").submit();
        },
        "click .tab-button": function(event) {
            $(".tab-button.active").toggleClass("active");
            event.target.classList.add("active");
            this.currentTab(event.target.getAttribute("data-template"));
            Session.set("activeProfileTab", event.target.getAttribute("data-template"));
        },
        // "change #rateJump": function(event) {
        //     console.log(event.target.value);
        //     $(".amount" + event.target.value).focus();
        // }
    }
});
