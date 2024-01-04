//
// app.get('/download/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const dbConnection = require('./database.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_download = async (req, res) => {

  console.log("call to /download...");

  try {

    //
    // TODO
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //

    assetid = req.params.assetid

    try {
      // new promise for call to the database
      var rds_call = new Promise((resolve, reject) => {
        try {
          var sql = "SELECT bucketkey, userid, assetname FROM assets WHERE assetid = ?";
          var param = [assetid];

          // executing the sql query with the assetid
          dbConnection.query(sql, param, (err, result) => {
            try {
              if (err) {
                reject(err);
                return;
              }

              // if the result is empty, then the assetid doesn't exist
              if (result.length == 0) {
                res.status(400).json({
                  "message": "no such asset...",
                  "user_id": -1,
                  "asset_name": "?",
                  "bucket_key": "?",
                  "data": []
                })
                return;
              }

              console.log("/download query done");
              resolve(result[0]);
            }
            catch (err) {
              res.status(400).json({
                "message": err.message,
                "user_id": -1,
                "asset_name": "?",
                "bucket_key": "?",
                "data": []
              });
            }
          });
        }
        catch (promise_err) {
          reject(promise_err)
        }
      });

      // promise all on the rds call
      Promise.all([rds_call]).then(async results => {
        var dbRes = results[0]
        // console.log(dbRes)

        try {
          // create input for GetObjectRequest and then execute the function
          const input = { // GetObjectRequest
            Bucket: s3_bucket_name, // required
            Key: dbRes.bucketkey, // required
          };
          const command = new GetObjectCommand(input);
          console.log("ERROR?")
          console.log(dbRes.bucketkey)
          const response = await s3.send(command);
          console.log(response)
          var datastr = await response.Body.transformToString("base64");
          res.status(200).json({
            "message": "success",
            "user_id": dbRes.userid,
            "asset_name": dbRes.assetname,
            "bucket_key": dbRes.bucketkey,
            "data": datastr
          })
        }
        catch (err) {
          console.log("TEST")
          res.status(400).json({
            "message": err.message,
            "user_id": -1,
            "asset_name": "?",
            "bucket_key": "?",
            "data": []
          });
          return;
        }
      })
    }
    catch (err) {
      res.status(400).json({
        "message": err.message,
        "user_id": -1,
        "asset_name": "?",
        "bucket_key": "?",
        "data": []
      });
      return;
    }
  }//try
  catch (err) {
    //
    // generally we end up here if we made a 
    // programming error, like undefined variable
    // or function:
    //
    res.status(400).json({
      "message": err.message,
      "user_id": -1,
      "asset_name": "?",
      "bucket_key": "?",
      "data": []
    });
  }//catch

}//get