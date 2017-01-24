import expDocs from './pubExpiredDocuments';

let Utils = {};
Utils.collection_options = function(Collection, field) {
    return Collection.find().map(function(model) {
        return {
            id: model["_id"],
            name: model[field]
        };
    });
};

Template.expiringDocumentsFilter.viewmodel({
    expiresIn: "",
    filterHasEntries: function(){
      return Session.get("filterHasEntries");
    },
    refreshDocs: function() {
        var instance = this.templateInstance;
        var expires = this.expiresIn();
        var rangeEnd = moment().add(expires, 'days');
        var rangeStart = moment().add(expires - 30 , 'days');
        var query = {};
        if (expires === "0") {
            query = {
                expires: {
                    $lte: new Date(rangeEnd)
                }
            };
            instance.subscribe('expiringDocs', query);

        } else if(expires==""){

        } else{
            query = {
                $and: [{
                    expires: {
                        $lte: new Date(rangeEnd)
                    }
                }, {
                    expires: {
                        $gt: new Date(rangeStart)
                    }
                }]
            };
            instance.subscribe('expiringDocs', query);
        }
        //
        // console.log(query);
        //   console.log(expDocs.find().fetch());
        if(expDocs.find().fetch().length>0){
          Session.set("expDocsExist",true);
        }
        else{
          Session.set("expDocsExist",false);
        }
        Session.set("expiresIn",expires);
        // agentsExpiringDocuments.reload();
    },

    agentsWithExpiringDocuments: function() {
        let agent_ids = [];

        expDocs.find({}).forEach(function(doc) {
            agent_ids.push(doc._id);
        });
        // console.log(expDocs.find({},{fields:{docs:0}}).fetch());
        // console.log("agentsWithExpiringDocuments");
        // console.log(agent_ids);


        return agent_ids;
    },
    active: 'true',
    name_query: '',
    state: '',
    job: '',
    agency: '',
    area: '',
    availability: '',
    // inQuery: {},
    currentFilter: function() {
        // console.log("currentFilter");
        var agentsWExp = this.agentsWithExpiringDocuments();
        let currentFilter = {
          _id : {
              $in: agentsWExp
          }
        };

        if(agentsWExp.length<=0){
          currentFilter._id = {
                $in: [-1]
            };
        }

        if (this.name_query()) {
            currentFilter.name = {
                '$regex': '.*' + this.name_query() + '.*',
                '$options': 'i'
            };
        };
        // if (this.state()) {
        //     currentFilter.state = this.state();
        // };

        if (this.job()) {
            currentFilter.job_id = this.job();
        }

        if (this.agency()) {
            currentFilter.agencies = this.agency();
        }

        if (this.area()) {
            currentFilter.areas = this.area();
        }

        if (this.availability()) {
            currentFilter.availabilities = this.availability();
        }
        if (this.active() && (this.active() === 'true')) {
            currentFilter.active = true;
        }
        return currentFilter;
    },
    filterChange: function() {
        this.refreshDocs();
        // console.log(this.currentFilter());
        agentsExpiringDocuments.set({
            filters: this.currentFilter(),
        });

        // console.log("filterChange");
        // console.log(this.currentFilter());
    },
    autorun: function() {
      //subscribe to agents
        var subscription = this.templateInstance.subscribe("agents", this.currentFilter());
        if (subscription.ready())
            agentsExpiringDocuments.reload();

        if (this.currentFilter()) {
            agentsExpiringDocuments.reload();
        }
        // if (Object.keys(this.currentFilter()).length > 1) {
        Session.set("agentsFilter", this.currentFilter());
        // }
        // console.log("autorun");


        //
        // console.log(expDocs.find().fetch());
    },
    expiringDocumentsAggr: function() {
        return expDocs.find();

    },
    nameChange: _.throttle(function() {
        if (searchByName) {
            if (!backspace) {
                agentsExpiringDocuments.set({
                    filters: this.currentFilter(),
                });
            } else {
                var filter = this.currentFilter();
                delete filter.name;
                agentsExpiringDocuments.set({
                    filters: filter,
                });
            }
        } else {
            var fltr = this.currentFilter();
            delete fltr.name;
            agentsExpiringDocuments.set({
                filters: fltr,
            });
        }
        // console.log("throttle");
        agentsExpiringDocuments.reload();
        // console.log($("#nameField").val());
        // console.log(  agentsExpiringDocuments.filters);
        if (Object.keys(this.currentFilter()).length > 1) {
            Session.set("agentsFilter", this.currentFilter());
        }
    }, 1000),

    jobs_options: function() {
        return Utils.collection_options(Jobs, "name");
    },
    agencies_options: function() {
        return Utils.collection_options(Agencies, "name");
    },
    areas_options: function() {
        return Utils.collection_options(Areas, "name");
    },
    availabilities_options: function() {
        return Utils.collection_options(Availabilities, "name");
    },
    agent_states_options: function() {
        return Utils.collection_options(AgentStates, "name");
    },
    onCreated: function() {
      // this.templateInstance.subscribe('agents');
      // this.refreshDocs();
        agentsExpiringDocuments.set({
            filters: this.currentFilter(),
        });
        if (Session.get("agentsFilter")) {
            // console.log(Session.get("agentsFilter"));
            var filter = Session.get("agentsFilter");
            if (filter.job_id) {
                // console.log(filter.job_id);
                this.job(filter.job_id);
            }
            if (filter.agencies) {
                this.agency(filter.agencies);
            }
            if (filter.areas) {
                this.area(filter.areas);
            }
            if (filter.availabilities) {
                this.availability(filter.availabilities);
            }
            if (filter.active) {
                this.active(filter.active);
            }
            if (filter.name) {
                var name_q = filter.name.$regex;
                this.name_query(name_q.substring(2, name_q.length - 2));
            }
            agentsExpiringDocuments.set({
                filters: this.currentFilter(),
            });
            agentsExpiringDocuments.reload();
        }
        // this.refreshDocs();
    },
    onRendered: function() {
        Materialize.updateTextFields();
        if($("select.initialized").length==0)
          $("select").material_select();
        agentsExpiringDocuments.reload();
    },
    events: {
        "focus #nameField": function() {
            isEditingName = true;
            // console.log(isEditingName);
        },
        "blur #nameField": function() {
            isEditingName = false;
            // console.log(isEditingName);
        },
        "input #nameField": function(e) {
            backspace = false;
            if (e.target.value.length > 2) {
                searchByName = true;
            } else {
                if (preLength == 3) {
                    // console.log("backspace");
                    backspace = true;
                    searchByName = true;
                } else
                    searchByName = false;
            }
            // console.log("search by name");
            // console.log(searchByName);
            preLength = e.target.value.length;
        },
        "click #clear-filters": function(e){
          this.active("true");
          this.name_query("");
          this.state("");
          this.job("");
          this.agency("");
          this.area("");
          this.availability("");
          this.expiresIn("");
          this.refreshDocs();
          $(".filter .select-wrapper input").val("Select");
          $(".filter .active-only input").val("Active Only");
          Session.set("filterHasEntries", false);

          agentsExpiringDocuments.set({
              filters: this.currentFilter(),
          });
          agentsExpiringDocuments.reload();
          setTimeout(function () {
            if($("select.initialized").length==0)
              $("select").material_select();
          }, 10);
        }
    }
});
export default expDocs;
