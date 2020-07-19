const fs = require('fs')
const path = require('path')
const fileUpload = require('express-fileupload')
const express = require('express')
const compressing = require('compressing')
const publishType =require('./utils/constant');
const { deleteFiles, mergeDir } = require('./utils');


const app = express()
app.use(fileUpload({}))

app.get('/receive', function(req, res) {
  return res.status(200).send('test')
})

app.post('/receive', function (req, res) {

  let files = req.files //  data origin middle ware handle

  // validate target is valid
  if (req.body.target) {
    
    // juege file type
    if (fs.existsSync(req.body.target) && !fs.statSync(req.body.target).isDirectory()) {
      return  res.status(500).send(new Error(`current target option is't dir type`))
    }

    // receive zip format
    let filename = path.basename(files.file.name, '.zip')
    if (!filename) {
      return res.status(500).send(new Error(`can't distinguish file format`))
    }

    // dirpath
    let dirPath = path.dirname(req.body.target)
    let dirname = path.basename(req.body.target)
    // console.log(dirPath, dirname)
    // if current file is't exist or has replace option
    if (req.body.publishType === publishType.REPLACE || !fs.existsSync(req.body.target)) {
      // old files need to delete
      if (fs.existsSync(req.body.target)){
        deleteFiles(req.body.target)
      }

      compressing.zip.uncompress(files.file.data, dirPath).then(() => {
        // rename current filename
        fs.renameSync(path.resolve(dirPath,filename),path.resolve(dirPath,dirname))
        res.status(200).send('publish success')
      }).catch((error) => {
        return res.status(500).send(error)
      });
    } else {
      compressing.zip.uncompress(files.file.data, dirPath).then(() => {
        try {
          mergeDir(dirPath+'\\'+filename,req.body.target)
          deleteFiles(dirPath+'\\'+filename) // in case old file exist
          res.status(200).send('publish success')
        } catch (error) {
          return res.status(500).send(error)
        }
      }).catch((error) => {
        return res.status(500).send(error)
      })
    }
  } else {
    return res.status(404).send(new Error(`cant't get file target`))
  }

})

app.listen(3001, () => console.log('the server is running!'))