var TiraTime = (function(){
  var numberOfTeams, numberOfPlayers, playersNames = [],
      playersInputObjects = [], currentPlayer = 0, teams = []
      _this = this;

  function TiraTime() {
    addEventListeners();
  };

  function addEventListeners() {
    $("#first-step-submit").on("click", onFirstStepSubmit);
    $("#second-step-submit").on("click", onSecondStepSubmit);
    $("#final-step").on("click", "input", onReSortTeams);
  };

  function onFirstStepSubmit(e) {
    e.preventDefault();
    if(validateFirstStep()) callSecondStep();
  };

  function validateFirstStep() {
    var teamsInput = $("#number-of-teams"),
        playersInput = $("#number-of-players"),
        valid = false;

    teamsInput.removeClass("invalid");
    playersInput.removeClass("invalid");

    if(!teamsInput.val()) {
      teamsInput.addClass("invalid");
    };

    if(!playersInput.val()) {
      playersInput.addClass("invalid");
    };

    if(playersInput.val() && teamsInput.val()) {
      numberOfTeams = teamsInput.val();
      numberOfPlayers = playersInput.val();
      valid = true;
    };

    return valid;
  };

  function callSecondStep() {
    $("#first-step").hide();

    trackProgress();
    buildPlayersInputs();
    setPlayerInput();

    $("#second-step").show();
    $("#second-step .fields input").focus();
  };

  function onSecondStepSubmit(e) {
    e.preventDefault();
    if(validateSecondStep()) secondStepSubmit();
  };

  function validateSecondStep() {
    $input = $("#second-step .fields input");
    var valid = false;

    $input.removeClass("invalid");

    if(!$input.val()) {
      $input.addClass("invalid");
    } else {
      playersNames.push($input.val());
      currentPlayer++;
      valid = true;
    };

    return valid;
  };

  function secondStepSubmit() {
    if((currentPlayer + 1) > numberOfPlayers) {
      sortTeams();
      showTeams();
    } else {
      if((currentPlayer + 1) == numberOfPlayers) {
        $("#second-step-submit").val("Tirar os times");
      };
      trackProgress();
      setPlayerInput();
      $("#second-step .fields input").focus();
    }
  };

  function trackProgress() {
    $("#current-player").text(currentPlayer + 1);
    $("#total-players").text(numberOfPlayers);
  };

  function buildPlayersInputs() {
    for(var i = 0; i < numberOfPlayers; i++) {
      playersInputObjects.push({ name: "player["+(i+1)+"]", placeholder: "Jogador " + (i+1) });
    }
  };

  function setPlayerInput(index) {
    var player = playersInputObjects[currentPlayer];
    var playerInput = "<input type='text' name='"+player.name+ "' placeholder='"+player.placeholder+"'/>";
    $("#second-step .fields").html(playerInput);
  };

  function sortTeams() {
    teams = [];
    var namesArray = playersNames.slice(0);
    while(namesArray.length > 0) {
      for(var i = 0; i < numberOfTeams; i++) {
        teams[i] = { team_number: i+1, players: []};
        for(var j = 0; j < (numberOfPlayers/numberOfTeams); j++) {
          shuffle(namesArray);
          teams[i].players.push({ name: namesArray.pop()});
        }
      }
    };
  };

  function showTeams() {
    console.log(teams);
    $("#second-step").hide();
    var source = "{{#each teams}}<div class='team'><header><h1>Time {{team_number}}</h1></header><ul>{{#each players}}<li>{{name}}<li>{{/each}}</ul></div>{{/each}} <input type='submit' value='Sortear Novamente' class='button' id='re-sort-teams' />";
    var template = Handlebars.compile(source);
    var compiledTemplate = template({ teams: teams });
    $("#final-step").html(compiledTemplate).show();
   
    
  };

  function onReSortTeams() {
    sortTeams();
    showTeams();
  };

  return TiraTime;
}());

new TiraTime();
MBP.hideUrlBarOnLoad();
MBP.startupImage();
