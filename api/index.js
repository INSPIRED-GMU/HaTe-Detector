//  EXPRESS
const express = require('express');
var cors = require('cors')
const bp = require('body-parser')
const {Base64} = require('js-base64');
const { MongoClient } = require("mongodb");


const app = express();
app.use(cors({
    credentials: true,
    preflightContinue: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
    origin: true
}));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
var access_token = "";

//DB Stuff
const connectionURI = "<PASTE HERE>"
async function getAllWords() {
    const uri =connectionURI;
    const client = new MongoClient(uri);
    try {
      const database = client.db('hatedetector');
      const harmfulterminologies = database.collection("harmfulterminologies");
      const pairsView = database.collection("wordAlternatePairs");
      const wordAltDef = database.collection("WordAltDef");
	  const distinctValues = await harmfulterminologies.distinct("Terms");
      const distinctDefs = await wordAltDef.distinct("value");
      const distinctAlternates = await pairsView.distinct("Alternates");
	
      return await {words:distinctValues,alternates:distinctAlternates,definitions:distinctDefs};
    } finally {
      await client.close();
    }
}




app.get('/', function(req, res) {
  res.render('pages/index',{client_id: clientID});
});

const port = process.env.PORT || 2400;
app.listen(port , () => console.log('Backend running on port ' + port));

const axios = require('axios')

const clientID = '<PASTE HERE>'
const clientSecret = '<PASTE HERE>'

app.get('/github', (req, res) => {

  const requestToken = req.query.code
  
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    headers: {
         accept: 'application/json'
    }
  }).then((response) => {
    console.log(response.data)
    access_token = response.data.access_token
    res.redirect('/user');
  })
})

app.get('/user', function(req, res) {
  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + access_token
    }
  }).then((response) => {
    console.log({ "userData": response.data,"accessToken":access_token });
    res.status(200).send({userData:response.data,accessToken:access_token})
  })
});

app.post('/getRepo', function(req, res) {

    console.log(req.body)

    const userName = req.body.user
    const authToken = req.body.authToken
    axios({
      method: 'get',
      url: `https://api.github.com/user/repos?per_page=100&affiliation=owner&sort=updated`,
      headers: {
        Authorization: 'token ' + authToken
      }
    }).then((response) => {
      //console.log({ "userRepos": response.data });
      res.status(200).send({userRepos:response.data})
    })
  });

app.post('/getFilesFromRepo', function(req, res) {
    console.log(req.body)
    const name = req.body.name
    const repo = req.body.repo
    const authToken = req.body.authToken
    axios({
      method: 'get',
      url: `https://api.github.com/search/code?q=a+user:${name}+extension:md+extension:docx+extension:doc+repo:${name}/${repo}&per_page=100&sort=updated`,
      headers: {
        Authorization: 'token ' + authToken
      }
    }).then((response) => {
      //console.log({ "repoFiles": response.data });
      res.status(200).send({repoFiles:response.data})
    })
  });
  app.post('/loadFile', function (req, res) {
    console.log(req.body)
    getAllWords().catch(console.dir)
    .then( function (allWords){
        //console.log(allWords)
        const name = req.body.name
        const repo = req.body.repo
        const path = req.body.path
        const authToken = req.body.authToken
        console.log(name,repo)
        axios({
        method: 'get',
        url: `https://api.github.com/repos/${repo}/contents/${path}`,
        headers: {
            Authorization: 'token ' + authToken
        }
        }).then((response) => {
        let content = Base64.decode(response.data.content)
        res.status(200).send({fileContent:response.data,decoded:content,words:allWords.words,alternates:allWords.alternates,definitions:allWords.definitions})
        })
    })
  });

  app.post('/submitFeedback', function(req, res) {
    console.log(req.body)
    const word = req.body.word
    const feedback = req.body.feedback
    var fbObj = { word: word, feedback:feedback };

    const client = new MongoClient(connectionURI);
    const database = client.db('hatedetector');
    const feedbackDB = database.collection("feedback");
    feedbackDB.insertOne(fbObj, function(err, res) {
    if (err) throw err;
    console.log("feedback submitted");
    client.close();
  });
  res.status(200).send({status:"success"})
  });
  