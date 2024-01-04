//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_bucket = async (req, res) => {

  console.log("call to /bucket...");

  try {
    //
    // TODO: remember, 12 at a time...  Do not try to cache them here, instead 
    // request them 12 at a time from S3
    //
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //
    startafter = null;

    // if the startafter parameter exists, set it
    if (req.query.startafter) {
      startafter = req.query.startafter;
      console.log(startafter);
    }

    // creating the input for the ListObjectsV2Command function and executing it
    const input = { // ListObjectsV2Request
      Bucket: s3_bucket_name, // required
      MaxKeys: Number(12),
      StartAfter: startafter,
      OptionalObjectAttributes: [ // OptionalObjectAttributesList
        "RestoreStatus",
      ],
      //Delimiter: "STRING_VALUE",
      //EncodingType: "url",
      //Prefix: "STRING_VALUE",
      //ContinuationToken: "STRING_VALUE",
      //FetchOwner: true || false,
      //RequestPayer: "requester",
      //ExpectedBucketOwner: "STRING_VALUE",
    };
    const command = new ListObjectsV2Command(input);
    const response = await s3.send(command);

    // relaying the appropriate response
    if(response.KeyCount == 0){
      res.json({
        "message": "success",
        "data": []
      })
    }
    else{
      res.json({
        "message": "success",
        "data": response.Contents
      })
      //console.log(response.KeyCount);
    }

  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
