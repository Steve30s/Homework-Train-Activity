// You should try to get in the habit of wrapping your JS code within a document.ready block or 
// some other kind of functional closure so that you don't pollute the global scope with your variables.

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAMKrUjp-ATNkz3iRD_iRO6VnCrqyHw2cg",
    authDomain: "homework-trainschedule.firebaseapp.com",
    databaseURL: "https://homework-trainschedule.firebaseio.com",
    projectId: "homework-trainschedule",
    storageBucket: "",
    messagingSenderId: "790839068299"
  };
  firebase.initializeApp(config);
  database = firebase.database();

// I really really like how you broke out your logic into reusable functions!

/* calcNextArrival                                 */
/* Description: calculate next arrival time        */
/* parameter: time - time of first train           */
/*            freq - how often the train comes     */
/* return:    moment object of next arrival        */
function calcNextArrival(time, freq) {
	//get time info
	var mTime = moment(time,'H:mm');	
	console.log(moment(mTime).format('h:mm'));
	//check if it has past, if yes, set new time
	while (mTime.diff(moment(), 'm') <= 0) {

		// Calling `.add` doesn't change the value of `mTime`
		// In order to update `mTime` you'd need to assign the 
		// return value of the add operation to mTime. You'd also
		// need to wrap the `mTime` you're adding to in a `moment()` like so:
		// mTime = moment(mTime).add(freq, 'm');

		mTime.add(freq, 'm');
	}

	// Since the above while loop doesn't update `mTime`
	// this ends up returning the original `time` value
	// that's given to this function.
	return mTime;
}

/* calMinuteAway                                       */
/* Description: calculate minutes before train arrives */
/* return: minutes                                     */
function calcMinuteAway(mArrival) {
	return(moment(mArrival).diff(moment(), 'm'));	
}


$(document).ready(function() {

//retrieve from firebase
database.ref().on("child_added", function(snapshot, prevChildKey) {
	var name = snapshot.val().name;
	var dest = snapshot.val().dest;
	var firstTrainTime = snapshot.val().firstTrainTime;
	var frequency = snapshot.val().frequency;
	// console.log(firstTrainTime);
	//display table of schedule from database
	updateTable(name, dest, firstTrainTime, frequency );

});

/* undateTable                                          */
/* Description: display schedule in table row           */
/* parameter: name, dest, firstTime, freq  - details to */
/*            display                                   */
function updateTable(name, dest, firstTime, freq ) {
	var entry;
	//calculate next arrival
	var mNextArrival = calcNextArrival(firstTime, freq);
	//calculate minute away
	var minuteAway = calcMinuteAway(mNextArrival);
	var arrivalString = moment(mNextArrival).format("h:mmA");
	// console.log(arrivalString);
	// I like that you're using a template string here. In addition to the easy variable insertion
	// it allows you to do I'd suggest also taking advantage of it's ability to be broken up across
	// multiple lines so that your entry ends up appering more like html markup and less like a 
	// realy long JS string.
	entry = `
		<tr>
			<td>${name}</td>
			<td>${dest}</td>
			<td class="td-freq">${freq}</td>
			<td class="td-arrival">${arrivalString}</td>
			<td class="td-away">${minuteAway}</td>
		</tr>
	`;
	$('#table-schedule > tbody').append(entry);

}

//add train button click
$('#add-train-btn').on('click', function(event) {
	event.preventDefault();
	//take user input
	// Feel free to just declare these variables at the same time you assign them a value.
	// For instance: `var name = $('#train-name-input').val().trim();`
	var name;
	var dest;
	var firstTrainTime;
	var frequency;
	// Looks like you didn't end up using this variable anywhere in this function
	// so it's safe to remove it.
	var entry;

	name = $('#train-name-input').val().trim();
	dest = $('#train-dest-input').val().trim();
	firstTrainTime = $('#train-time-input').val().trim();
	frequency = parseInt($('#train-freq-input').val().trim());
	//add to firebase
	var newTrain = {
		name: name,
		dest: dest,
		firstTrainTime: firstTrainTime,
		frequency: frequency
	};
	database.ref().push(newTrain);
}); //on click add train

/* undateRowTable                                    */
/* Description: update arrival time and minutes away */
function updateRowTable() {
	var rowCount = $('#table-schedule >tbody >tr').length;
	$('#table-schedule >tbody >tr').each(function() {
		//update minute away every minute
		var away = $(this).find(".td-away").html();
		//check if <0
		if (away > 0) {
			$(this).find(".td-away").html(--away);
		}
		else {
			//reset minute away
			var freq = $(this).find(".td-freq").html();
			$(this).find(".td-away").html(freq);
			//get new arrival time
			var arrival = $(this).find(".td-arrival").html();
			var mNextArrival = calcNextArrival(arrival, freq);
			$(this).find(".td-arrival").html(moment(mNextArrival).format("h:mmA"));
		}
	}); //tr .each
}

//update table periodically
var interval = setInterval(updateRowTable, 60000);

}); //ready
