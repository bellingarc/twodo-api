var admin = require("firebase-admin")
var serviceAccount = require('../credentials.json')

let db;

function dbAuth() {
  if(!admin.apps.length){
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
    db = admin.firestore()
  }
}

exports.getTasks = (req, res) => {
  if(!req.params.userId) {
    res.status(400).send('Invalid request')
  }
  dbAuth()
  db.collection('tasks').where('userId', '==', req.params.userId).get()
    .then(collection => {
      const taskList = collection.docs.map(doc => {
        let task = doc.data()
        task.id = doc.id
        return task
      })
      res.status(200).json(taskList)
    })
    .catch(err => res.status(500).send('GET TASKS FAILED:' + err))
}

exports.postTask = (req, res) => {
  if(!req.body || !req.body.item || !req.body.userId || !req.params.userId) {
    res.status(400).send('Invalid request')
  }
  dbAuth()
  const newTask = {
    item: req.body.item,
    done: false,
    userId: req.body.userId
  }
  db.collection('tasks').add(newTask)
    .then(() => {
      this.getTasks(req, res)
    })
    .catch(err => res.status(500).send('POST FAILED:' + err))
}

exports.patchTask = (req, res) => {
  if(!req.body || !req.params.userId || !req.params.taskId) {
    res.status(400).send('Invalid request')
  }
  dbAuth()
  db.collection('tasks').doc(req.params.taskId).update(req.body)
    .then(() => {
      this.getTasks(req, res)
    })
    .catch(err => res.status(500).send('UPDATE FAILED: '+ err))
}

exports.deleteTask = (req, res) => {
  if(!req.params.userId || !req.params.taskId) {
    res.status(400).send('Invalid request')
  }
  dbAuth()
  db.collection('tasks').doc(req.params.taskId).delete()
    .then(() => this.getTasks(req, res))
    .catch(err => res.status(500).send('DELETE FAILED: '+ err))
}
