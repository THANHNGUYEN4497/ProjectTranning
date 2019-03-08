function writeServerLog(type, msg) {
    let log = "";
    switch(type) {
        case 0:
            log += '>>> '; //out
            break;
        case 1:
            log += '<<< '; //in
            break;
        case 2:
            log += '*** '; //sys
            break;
        case 3:
            log += '--- '; //err
            break;
    }
        
    //log += '['+ _date.convertDateTimeForDatabase(new Date()) +'] ';
    log += '['+ (new Date()) +'] ';	
    log += msg;
    
    console.log(log);
}

exports.writeServerLog = writeServerLog; 