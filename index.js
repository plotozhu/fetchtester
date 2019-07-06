const { SwarmClient } =require('@erebos/swarm-node')


const Promise = require ("bluebird")
const fs = require('fs')
const readline = require("readline")
const program = require('commander')
const path = require('path')
const mkdirp = require('mkdirp')
const {execSync} = require("child_process")
/*
* 按行读取文件内容
* 返回：字符串数组
* 参数：fReadName:文件名路径
*      callback:回调函数
* */
function readFileToArr(fReadName){
    return new Promise((resolve,reject)=>{
        var fRead = fs.createReadStream(fReadName);
        var objReadline = readline.createInterface({
            input:fRead
        });
        var arr = new Array();
        objReadline.on('line',function (line) {
            if (line != "undefined")
                arr.push(line);
            //console.log('line:'+ line);
        }).on('close',function () {
            // console.log(arr);
            resolve(arr);
        }).on('error',function (err) {
            reject(err)
        })
    })

}


program
    .version('0.1.0')
    .option('-h, --hashes_file [value] ', 'set hashes file')
    .option('-p, --bzzapi   [value]','set bzzapi' )
    .parse(process.argv);


function downloadAFile(client,hash) {
    let start_time =  Date.now()
    mkdirp(path.join(process.cwd(),'tempfiles'))
    let filename = path.join(process.cwd(), 'tempfiles/'+hash)
    return client.bzz
        .downloadDirectoryTo(hash,filename).then(()=>{
        let end_time =  Date.now()- start_time
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        console.log (hash + "Download file size:",fileSizeInBytes, "\t bandrate:",fileSizeInBytes/end_time +" kBps")
    }).catch((e)=>{
     console.log("error in downloading file:",e.message)
    })

}

if (program.hashes_file ) {

    const client = new SwarmClient({ bzz: { url: program.bzzapi || 'http://localhost:8500' } })
    readFileToArr(program.hashes_file ).then((hashes)=>{
        console.log(" read file ok",program.hashes_file," total lines:",hashes.length)
        return Promise.each(hashes,function (hash) {
            console.log(`start downloading ${hash}`)
            return downloadAFile(client,hash)
        }).then(()=>{
            console.log(" All file has been downloaded")
        }).then(()=>{
            tmpPath = path.join(process.cwd(),'tempfiles')
            execSync('rm -fr ${tmpPath}')
        })
    }).catch((err)=>{
        console.log(err.message)
    })
}else {
    console.log("You should take one parameter at least")
}