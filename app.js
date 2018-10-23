const bcrypt=require('bcrypt');

function  run(){
    console.log(bcrypt.genSaltSync(10,'b'));
}

    run();
