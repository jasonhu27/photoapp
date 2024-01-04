//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require('./database.js')

exports.get_users = async (req, res) => {

  console.log("call to /users...");

  //
  // TODO: remember we did an example similar to this in class with
  // movielens database (lecture 05 on Thursday 04-13)
  //
  // MySQL in JS:
  //   https://expressjs.com/en/guide/database-integration.html#mysql
  //   https://github.com/mysqljs/mysql
  //

  try {

    var sql = "Select * FROM users Order By userid ASC";

    // executes the sql query
    dbConnection.query(sql, (err, result) => {
      try {
        if (err) {
          reject(err);
          return;
        }

        console.log("/users query done");

        // returns the values in json form
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
