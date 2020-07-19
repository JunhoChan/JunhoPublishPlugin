const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')
const compressing = require('compressing')
const utils = require('./../utils')

class JunhoPublishPlugin {

  constructor(options) {
    const defaultOption = {
      receiveType: 'replace' // replace all file Or merge other file. current options havea replace with merge 
    };
    Object.assign(defaultOption, options);
    this.options = defaultOption;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('JunhoPublishPlugin', (compilation)=> {
      const { outputPath } = compiler

      if (!outputPath) {
        throw new Error(`can't get current outputPath`)
      }
    
      function validParamIsEmpty(paramName) {
        if (!this.options[paramName]) {
          throw new Error(`JunhoPublishPlugin require ${paramName} option!`)
        }
      }

      validParamIsEmpty.call(this, 'target')
      validParamIsEmpty.call(this, 'receiveType')
      validParamIsEmpty.call(this, 'domain')

      const zipPath = this.options.outputPath || outputPath

      if (!path.isAbsolute(zipPath)){
        throw new Error('JunhoPublishPlugin require static absolutely outputPath!')
      }

      compressing.zip.compressDir(outputPath, `${zipPath}.zip`).then((result) => {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(`${zipPath}.zip`));
        formData.append('target',this.options.target);
        formData.append('receiveType',this.options.receiveType);
        
        utils.deleteFiles(zipPath);// delete build file
    
        axios.post(this.options.domain, formData, {
          headers: formData.getHeaders(),
          timeout: 10000,
          onUploadProgress: (progressEvent) => {
            const percentage = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%'
            console.log(`current upload ${percentage}`)
          }
        }).then(res => {
          if (res.status === 200) {
            console.log('\x1b[44m', 'production enviroment publish success!')
            console.log('\x1b[0m')
            return;
          }
          console.error(res.data)
        }).catch(err => {
          throw new Error('JunhoPublishPlugin publish error: ' + err)
        }).finally(_ => {
          fs.unlinkSync(`${zipPath}.zip`) // delete it
        })

      }).catch((err) => {
        console.log('\x1b[41m', `JunhoPublishPlugin error: ${err}`.error)
        console.log('\x1b[0m')
      });
    });
  }
}

module.exports = JunhoPublishPlugin;