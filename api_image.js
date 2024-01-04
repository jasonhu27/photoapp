//
// app.post('/image/:userid', async (req, res) => {...});
//
// Uploads an image to the bucket and updates the database,
// returning the asset id assigned to this image.
//
const dbConnection = require('./database.js')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

const uuid = require('uuid');

exports.post_image = async (req, res) => {

  console.log("call to /image...");

  try {
    var data = req.body;  // data => JS object
    var S = data.data;
    var bytes = Buffer.from(S, 'base64');
    
    userid = req.params.userid

    var rds_call = new Promise((resolve, reject) => {
      try {
        var sql = "SELECT bucketfolder FROM users WHERE userid = ?";
        var param = [userid];

        dbConnection.query(sql, param, (err, result) => {
          try {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          }
          catch (code_err) {
            reject(code_err);
          }
        });
      }
      catch (code_err) {
        reject(code_err);
      }
    });

    Promise.all([rds_call]).then(async results => {
      if(results[0].length == 0){
        res.status(400).json({
          "message": "no such user...",
          "assetid": -1
        });
        return;
      }
      else{
        bfolder = results[0][0].bucketfolder;
        let name = uuid.v4();
        fullkey = bfolder + "/" + name + ".jpg";

        try{
          const command = new PutObjectCommand({
            Bucket: s3_bucket_name,
            Key: fullkey,
            Body: bytes,
          });
          try {
            const response = await s3.send(command);
            console.log(response);

            var assetinsert = "INSERT INTO assets (userid, assetname, bucketkey) VALUES (?, ?, ?)";
            var assetparam = [userid, data.assetname, fullkey];
            console.log(assetparam);
            dbConnection.query(assetinsert, assetparam, (err, result) => {
              try{
                console.log(result);
                res.status(200).json({
                  "message": "success",
                  "assetid": result.insertId
                })
              }
              catch (err){
                res.status(400).json({
                  "message": "some sort of error message",
                  "assetid": -1
                })
              }
              
            });            
          } catch (err) {
            console.error(err);
          }
        }
        catch (err) {
          console.error(err)
        }
      }
      
    });
  }//try
  catch (err) {
    console.log("**ERROR:", err.message);

    res.status(400).json({
      "message": err.message,
      "assetid": -1
    });
  }//catch

}//post
