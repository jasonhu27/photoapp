//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const dbConnection = require('./database.js')

exports.put_user = async (req, res) => {

  console.log("call to /user...");

  try {
    var data = req.body;  // data => JS object

    // console.log(data);
    var rds_call = new Promise((resolve, reject) => {
      try {
        var sql = "SELECT userid FROM users WHERE email = ?";
        var param = [data.email];

        dbConnection.query(sql, param, (err, result) => {
          try{
            if (err){
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
        try{
          var insertSql = "INSERT INTO users (email, lastname, firstname, bucketfolder) VALUES (?, ?, ?, ?)";
          var insertParams = [data.email, data.lastname, data.firstname, data.bucketfolder];

          dbConnection.query(insertSql, insertParams, (err, result) => {
            try{
              res.status(200).json({
                "message": "inserted", 
                "userid": result.insertId
              });
            }
            catch (err) {
              res.status(400).json({
                "message": err.message,
                "user_id": -1,
                "asset_name": "?",
                "bucket_key": "?",
                "data": []
              })
            }
          });
        }
        catch (err){
          res.status(400).json({
            "message": err.message,
            "user_id": -1,
            "asset_name": "?",
            "bucket_key": "?",
            "data": []
          })
        }
      }
      else{
        try{
          var updateSql = "UPDATE users SET lastname = ?, firstname = ?, bucketfolder = ? WHERE userid = ?";
          var updateParams = [data.lastname, data.firstname, data.bucketfolder, results[0][0].userid];

          dbConnection.query(updateSql, updateParams, (err, result) => {
            try{
              res.status(200).json({
                "message": "updated",
                "userid": results[0][0].userid
              })
            }
            catch (err){
              console.log("**ERROR:", err.message);
              
              res.status(400).json({
                "message": "some sort of error message",
                "userid": -1
              })
            }
          })
          
        }
        catch (err){
          console.log("**ERROR:", err.message);

          res.status(400).json({
            "message": err.message,
            "userid": -1
          });
        }
      }
    });
  }
  catch (err) {
    console.log("**ERROR:", err.message);

    res.status(400).json({
      "message": err.message,
      "userid": -1
    });
  } //put
} //catch

