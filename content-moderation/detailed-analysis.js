const process = require('node:process');

exports.splitter = function(content, overlap) {
    let length = content.length;
    let outs = [];

    let separation = length/3;

    if(length < separation){return content} else {
        let newIndex = 0;
        let oldIndex = 0;

        for(let i = 0 ; i < Math.floor(length/separation) + (Math.floor((length%separation + Math.floor(length/separation)*overlap)/separation)); i++ ){
            if((length - (oldIndex + separation - overlap)) < separation){
                newIndex = length;
            } else {
                newIndex = oldIndex + separation;
            }
            outs.push(content.substring(oldIndex, newIndex));
            oldIndex = newIndex - 1;
        }
    }
    return outs;
}