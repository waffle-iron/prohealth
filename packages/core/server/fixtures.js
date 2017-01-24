Meteor.methods({

  'seedBills'(bills){
    console.log("Seeding Bills..");



    let length = bills.length;
    _.each(bills, function(bill, index){

      console.log(index, "/", length, bill.patient_name);
      if(!Claims.findOne({name: bill.claim_name.trim()})){
        Claims.insert({name: bill.claim_name.trim()});
      }
      if(!Payors.findOne({name: bill.payor_name.trim()})){
        Payors.insert({name: bill.payor_name.trim()});
      }


      Bills.insert({
        date: new Date(bill.date),
        amount: bill.amount,
        patient_name: bill.patient_name,
        claim_id: Claims.findOne({name: bill.claim_name.trim()})._id,
        payor_id: Payors.findOne({name: bill.payor_name.trim()})._id,
        claim_start_date: bill.claim_start_date ? new Date(bill.claim_start_date) : null,
        claim_end_date: bill.claim_end_date ? new Date(bill.claim_end_date) : null,
        r_id: bill.r_id
      });
    });

  },

  'seedPayments'(payments){
      console.log("Seeding Payments..");
        let length = payments.length;
      _.each(payments, function(payment, index){
        console.log(index, "/", length);
        var payment_type_name = payment.payment_type == "nulls" ? "N/S" : payment.payment_type.trim();
        var payment_type = PaymentTypes.findOne({name: payment_type_name});
        var payment_type_id;
        if(!payment_type){
          payment_type_id = PaymentTypes.insert({name: payment_type_name});
        }
        else{
          payment_type_id = payment_type._id;
        }

        var bill = Bills.findOne({r_id: payment.bill_id});
        Payments.insert({
          date: new Date(payment.date),
          amount: payment.amount,
          bill_id: bill._id,
          note: payment.notes,
          payment_type_id: payment_type_id,
          claim_id: Claims.findOne({name: bill.claim_name.trim()})._id,
          payor_id: Payors.findOne({name: bill.payor_name.trim()})._id,
        });
      });
  },
  'seed'(){
    if(!Areas.findOne()){
      let areas = JSON.parse(Assets.getText('private/fixtures/areas.json'));
      _.each(areas, function(area) {
        Areas.insert({
          name: area.name,
          rid: area.id
        });
      })
    }

    if(!Agencies.findOne()){
      let agencies = JSON.parse(Assets.getText('private/fixtures/agencies.json'));
      _.each(agencies, function(agency) {
        Agencies.insert({
          name: agency.display_name,
          code: agency.short_name,
          rid: agency.id
        });
      })
    }

    if(!Jobs.findOne()){
      let jobs = JSON.parse(Assets.getText('private/fixtures/jobs.json'));
      _.each(jobs, function(job) {
        Jobs.insert({ name: job.title, rid: job.id });
      });
    }

    if(!Availabilities.findOne()){
      let availabilities = JSON.parse(Assets.getText('private/fixtures/availabilities.json'));
      _.each(availabilities, function(availability){
        Availabilities.insert({
          name: availability.name,
          rid: availability.id
        });
      });
    }

    //----------------------Activity types-----------------------
    if(!ActivityTypes.findOne()){
      let activityTypes = JSON.parse(Assets.getText('private/fixtures/activity_types.json'));
      _.each(activityTypes, function(activityType) {
        ActivityTypes.insert({
          name: activityType.title,
          rid: activityType.id
        });
      })

      let jobs_activity_types = JSON.parse(Assets.getText('private/fixtures/jobs_activity_types.json'));
      _.each(jobs_activity_types, function(job) {
        activities = ActivityTypes.find({ rid: { $in: job.v } }).fetch();
        activityTypes_ids = _.map(activities, function(activity_type) {
          return activity_type._id;
        });
        Jobs.update({ rid: job.id }, { $set: { activity_types_ids: activityTypes_ids } });
      });
    }

    //--------------------------DocumentTypes------------------------------------
    if(!DocumentTypes.findOne()){
      let documentTypes = JSON.parse(Assets.getText('private/fixtures/document_types.json'));
      _.each(documentTypes, function(documentType) {
        DocumentTypes.insert({
          name: documentType.document_name,
          rid: documentType.id
        });
      });
    }

    //------------------------- Assign Activity types toJobs-------------

    //--------------------------Agents------------------------------------
    if(!Agents.findOne()){
      let agents = JSON.parse(Assets.getText('private/fixtures/agents.json'));
      _.each(agents, function(agent){
        let job = Jobs.findOne({ rid: agent.job_type_id });
        if(job){
          let agentData = {
            name: agent.display_name,
            job_id: job._id,
            email: agent.email,
            phone: agent.phone,
            mobile: agent.cell,
            active: !agent.inactive,
            rid: agent.id
          };

          if(Match.test(agentData, AgentsSchema)){
              let returnValues = Agents.insert(agentData);
          }
        }
      });

      let users_agencies = JSON.parse(Assets.getText('private/fixtures/users_agencies.json'));
      _.each(users_agencies, function(agent){
        agencies = Agencies.find({ rid: { $in: agent.av } }).fetch();
        agencies = _.map(agencies, function(agency) {
          return agency.name;
        });
        let updated = Agents.update({ rid: agent.uid }, { $set: { agencies: agencies } });
      });

      //------------------------------- user Availabilities--------------------
      let users_availabilities = JSON.parse(Assets.getText('private/fixtures/users_availabilities.json'));
      _.each(users_availabilities, function(agent){
        availabilities = Availabilities.find({ rid: { $in: agent.av } }).fetch();
        availabilities = _.map(availabilities, function(availability) {
          return availability.name;
        });
        Agents.update({ rid: agent.uid }, { $set: { availabilities: availabilities } });
      });

      //--------------------------- User Areas------------------------------------
      let users_areas = JSON.parse(Assets.getText('private/fixtures/users_areas.json'));
      _.each(users_areas, function(agent){
        areas = Areas.find({ rid: { $in: agent.av } }).fetch();
        areas = _.map(areas, function(area) {
          return area.name;
        });
        Agents.update({ rid: agent.uid }, { $set: { areas: areas } });
      });
    }

    if(!CompensationTypes.findOne()){
      var types = ["Salary", "Start of Care", "Start of Care Facility", "Start of Care Home", "Death visit", "Evaluation", "DC Oasis", "Transfer Oasis", "Re-visit", "Non-billable DC", "Missed Visit DC", "Complex Case", "ROC", "Re-Certification", "Office rate", "Complex", "Out of area", "Mileage"];
      _.each(types, function(type){
        CompensationTypes.insert({name: type, multi: false});
      });
    }

    //------- bills -----
    if(!Bills.findOne()){
      let bills = JSON.parse(Assets.getText('private/fixtures/bills.json'));
      _.each(bills, function(bill){
        let patient = Patients.findOne({patient: bill.patient_name});
        let patient_id = 0;
        if(!patient){
          patient_id = Patients.insert({patient: bill.patient_name});
        }
        else{
          patient_id = patient._id;
        }

        Bills.insert({
          date: new Date(bill.date),
          amount: bill.amount,
          patient_id: patient_id,
          // patient_id: Patients.findOne({name: bill.patient_name.trim()})._id,
          claim_id: Claims.findOne({name: bill.claim_name.trim()})._id,
          payor_id: Payors.findOne({name: bill.payor_name.trim()})._id,
          claim_start_date: bill.claim_start_date ? new Date(bill.claim_start_date) : null,
          claim_end_date: bill.claim_end_date ? new Date(bill.claim_end_date) : null,
          r_id: bill.r_id
        });
      });
    }

    //------- payments -----
    if(!Payments.findOne()){
      let payments = JSON.parse(Assets.getText('private/fixtures/payments.json'));
      _.each(payments, function(payment){
        var payment_type_name = payment.payment_type == "nulls" ? "N/S" : payment.payment_type.trim();
        var payment_type = PaymentTypes.findOne({name: payment_type_name});
        var payment_type_id;
        if(!payment_type){
          payment_type_id = PaymentTypes.insert({name: payment_type_name});
        }
        else{
          payment_type_id = payment_type._id;
        }

        var bill = Bills.findOne({r_id: payment.bill_id});
        Payments.insert({
          date: new Date(payment.date),
          amount: payment.amount,
          bill_id: bill._id,
          note: payment.notes,
          payment_type_id: payment_type_id,
          claim_id: Claims.findOne({name: bill.claim_name.trim()})._id,
          payor_id: Payors.findOne({name: bill.payor_name.trim()})._id,
        });
      });
    }
  },//seed()
});
