class ProhealthConnection{

  constructor(loginParams){
    this.baseURL = "https://prohealth.devero.com/";
    this.loginParams = loginParams;
    this.status = false;
  }

  start(){
    //Synchronous Call to the HTTP method. Waits untill it gets a result.
    let connResult = Meteor.http.post(
      this.baseURL+"login.action",
      {params: this.loginParams}
    );
    this.cookie = connResult.headers["set-cookie"];
    this.sessionKey = connResult.headers["location"].split('hhsosSessionKey=')[1].split('&')[0];
    this.tokenKey = this.getTokenKey(this.sessionKey, this.cookie);
    this.status = true;
    console.log("Connected to "+this.baseURL);
  }

  getTokenKey(hhsosSessionKey, Cookie){
    let result = Meteor.http.get(
      this.baseURL + "adminMenu.action",
      {
        headers: {
          Cookie,
          'Response-type': "application/json"
        },
        params: {
          hhsosSessionKey,
          fromLogin: "true",
          patientAnalytics: 'true'
        }
      }
    );
    let token = JSON.parse(result.content).hhsosTokenKey;
    return (!token)? false : token;
  }

}//ProhealthConnection

export default ProhealthConnection;
