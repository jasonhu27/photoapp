//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const dbConnection = require('./database.js')

exports.get_assets = async (req, res) => {

  console.log("call to /assets...");

  try {

    //
    // TODO: remember we did an example similar to this in class with
    // movielens database (lecture 05 on Thursday 04-13)
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //
    var sql = "Select * FROM assets Order By assetid ASC";

    // Executes the sql query
    dbConnection.query(sql, (err, result) => {
      try {
        if (err) {
          reject(err);
          return;
        }

        console.log("/assets query done");

        //sends the json response
        res.json({
          "message": "success",
          "data": result
        })
      }
      catch (code_err) {
        reject(code_err);
      }

    });
    

  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
