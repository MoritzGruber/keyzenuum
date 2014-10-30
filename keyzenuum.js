var data = {};
var hits_correct = 0;
var hits_wrong = 0;
var start_time = 0;
var hpm = 0;
var ratio = 0;

data.chars = " William Shakespeare was an English poet, playwright and actor, widely regarded as the greatest writer in the English language and the world's pre-eminent dramatist. He is often called England's national poet and the \"Bard of Avon\".  His extant works, including some collaborations, consist of about 38 plays,  154 sonnets, two long narrative poems, and a few other verses, the authorship of some of which is uncertain. His plays have been translated into every major living language and are performed more often than those of any other playwright. Shakespeare was born and brought up in Stratford-upon-Avon. At the age of 18, he married Anne Hathaway, with whom he had three children: Susanna, and twins Hamnet and Judith. Between 1585 and 1592, he began a successful career in London as an actor, writer, and part-owner of a playing company called the Lord Chamberlain's Men, later known as the King's Men. He appears to have retired to Stratford around 1613 at age 49, where he died three years later. Few records of Shakespeare's private life survive, and there has been considerable speculation about such matters as his physical appearance, sexuality, religious beliefs, and whether any of the works attributed to him were written by others."
+"Shakespeare produced most of his known work between 1589 and 1613. 4] His early plays were mainly comedies and histories and these works remain regarded as some of the best work produced in these genres even today. He then wrote mainly tragedies until about 1608, including Hamlet, King Lear, Othello, and Macbeth, considered some of the finest works in the English language. In his last phase, he wrote tragicomedies, also known as romances, and collaborated with other playwrights."
+"Many of his plays were published in editions of varying quality and accuracy during his lifetime. In 1623, John Heminges and Henry Condell, two friends and fellow actors of Shakespeare, published the First Folio, a collected edition of his dramatic works that included all but two of the plays now recognised as Shakespeare's. It was prefaced with a poem by Ben Jonson, in which Shakespeare is hailed, presciently, as \"not of an age, but for all time\". In the 20th and 21st century, his work has been repeatedly adopted and rediscovered by new movements in scholarship and performance. His plays remain highly popular today and are constantly studied, performed, and reinterpreted in diverse cultural and political contexts throughout the world.";
data.chars_index = 0;
data.word_length = 36;

$(document).ready(function() {
    if (localStorage.data != undefined) {
        //load();
        //render();
        start();
    }
    else {
        start();
    }
    $(document).keypress(keyHandler);
    $(document).keydown(specialKeyHandler);
});


function start_stats() {
    start_time = start_time || Math.floor(new Date().getTime() / 1000);
}

function update_stats() {
    if (start_time) {
        var current_time = (Math.floor(new Date().getTime() / 1000));
        ratio = Math.floor(
            hits_correct / (hits_correct + hits_wrong) * 100
        );
        hpm = Math.floor(
            (hits_correct + hits_wrong) / (current_time - start_time) * 60
        );
        if (!isFinite(hpm)) { hpm = 0; }
    }
}


function start() {
    data.word_index = 0;
    data.word_errors = {};
    data.word = generate_word();
    data.keys_hit = "";
    save();
    render();
}


function specialKeyHandler(e) {
    start_stats();

    // Backspace
    if (e.which==8){
        e.preventDefault();
        data.keys_hit = data.keys_hit.slice(0,-1);
        if(data.keys_hit.length>=data.word_index){
            data.word_errors[data.keys_hit.length]=false
        }else 
        {data.word_index=minus1(data.word_index);}
    } 
    // Enter
    else if (e.which==13){
        // TODO
    }
    else {
        return;
    }
    
    update_stats();

    render();
    save();
}

// Handle keys
function keyHandler(e) {
    start_stats();

    var key = String.fromCharCode(e.which);
    if (data.chars.indexOf(key) > -1){
        e.preventDefault();
    }
    else {
    	return;
    }
    
    if(data.keys_hit.length==data.word_index && key == data.word[data.word_index]) {
        hits_correct += 1;
        data.word_index += 1;
        (new Audio("click.wav")).play();
    }
    else {
        hits_wrong += 1;
        (new Audio("clack.wav")).play();
        data.word_errors[data.word_index] = true;
    }

    data.keys_hit += key;

    if (data.word_index >= data.word.length) {
        setTimeout(next_word, 400);
    }

    update_stats();
    render();
    save();
}

function next_word(){
	data.word = generate_word();
	data.word_index = 0;
	data.keys_hit = "";
	data.word_errors = {};
	update_stats();

    render();
    save();
}



function save() {
    localStorage.data = JSON.stringify(data);
}


function load() {
    data = JSON.parse(localStorage.data);
}


function render() {
    render_word();
    //render_rigor();
    render_stats();
}



function render_rigor() {
    chars = "<span id='rigor-number' onclick='inc_rigor();'>";
    chars += '' + data.consecutive;
    chars += '<span>';
    $('#rigor').html('click to set required repititions: ' + chars);
}

function render_stats() {
    $("#stats").text([
        "hits per minute: ", hpm, " ",
        "correctness: ", ratio, "%"
    ].join(""));
}

function inc_rigor() {
    data.consecutive += 1;
    if (data.consecutive > 9) {
        data.consecutive = 2;
    }
    render_rigor();
}
 

function render_word() {
    var word = "";
    for (var i = 0; i < data.word.length; i++) {
        sclass = "normalChar";
        if (i > data.word_index) {
            sclass = "normalChar";
        }
        else if (i == data.word_index) {
            sclass = "currentChar";
        }
        else {
            sclass = "goodChar";
        }

        if(data.word_errors[i]) {
            sclass += " "+"errorChar";
        }

        word += "<span class='" + sclass + "'>";
        if(data.word[i] == " ") {
            word += "&#9141;"
        }
        else if(data.word[i] == "&") {
            word += "&amp;"
        }
        else {
            word += data.word[i];
        }
        word += "</span>";
    }
    var keys_hit = "<span class='keys-hit'>";
    for(var d in data.keys_hit) {
        if (data.keys_hit[d] == ' ') {
            keys_hit += "&#9141;";
        }
        else if (data.keys_hit[d] == '&') {
            keys_hit += "&amp;";
        }
        else {
            keys_hit += data.keys_hit[d];
        }
    }
    for(var i = data.word_index; i < data.word_length; i++) {
        keys_hit += "&nbsp;";
    }
    keys_hit += "</span>";
    $("#word").html(word + "<br>" + keys_hit);
}


function generate_word() {
    var next_chars_index=data.chars_index+data.word_length;
    var word = data.chars.substring(data.chars_index,data.chars_index+data.word_length);
    data.chars_index=next_chars_index;
    return word;
}



// minus 1 till zéro
function minus1(num) {
    return num>0?num-1:0;
}
