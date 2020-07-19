const fs = require('fs')
const path = require('path')

/**
 * @description delete files
 */
const deleteFiles = function (pathname) {
  if (fs.existsSync(pathname)) {
    try {
      const files = fs.readdirSync(pathname) || [];
      files.forEach((file) => {
          let currentPath = pathname + "\\" + file;
          if (fs.statSync(currentPath).isDirectory()) {
            deleteFiles(currentPath) // recursively delete files
          } else {
            fs.unlinkSync(currentPath) // delete it
          }
      });
      fs.rmdirSync(pathname);
    } catch(e) {
      throw new Error(e)
    }
  }
};

// merge current dir file
const mergeDir = function (sourceDir, targetDir) {
  const merge = function (source, target) {
      let files = [];
      if (fs.existsSync(source)) {
        files = fs.readdirSync(source);
        // console.log(source)
        if (files && files.length) {
          files.forEach((file) => {
            let currentPath = source + "\\" + file;
            let relativePath = path.relative(sourceDir, currentPath);
            let absolutePath = path.resolve(targetDir, relativePath);
              // dir
              if (fs.statSync(currentPath).isDirectory()) {
                if (!fs.existsSync(absolutePath)) {
                    fs.mkdirSync(absolutePath);
                }
                merge(currentPath, target);
              } else {
                // recover old data
                if (fs.existsSync(absolutePath)) {
                  fs.copyFileSync(currentPath, absolutePath);
                } else {
                  // hash split
                  let array = file.split('.');

                  if (!array || !Array.isArray(array) || !array.length) {
                    return;
                  }
          
                  if (array.length === 2) {
                    return fs.copyFileSync(currentPath, absolutePath);
                  }

                  let fileName = array[0]; // fileName
                  let suffix = array[array.length - 1]; // file subfixx
                  let dirPath = path.dirname(absolutePath);
                  let targetFiles = fs.readdirSync(dirPath);
                  // if dir is empty
                  if (targetFiles && targetFiles.length){
                    let targetFile = targetFiles.find((targetFile) => {
                      if (!fs.statSync(dirPath+'\\'+targetFile).isDirectory()){
                        let targetArray = targetFile.split('.');
                        if (targetArray && targetArray.length > 2) {
                          if (targetArray[0] === fileName && targetArray[targetArray.length-1] === suffix) {
                            return true;
                          }
                          return false;
                        }
                        return  false;
                      }
                      return false;
                    });
                    // find some target file
                    if (targetFile) {
                      fs.unlinkSync(dirPath+'\\'+targetFile);
                    }
                    fs.copyFileSync(currentPath,dirPath+'\\'+file);
                  } else {
                    fs.copyFileSync(currentPath,dirPath+'\\'+file);
                  }
                }
              }
          })
        }
      }
  };
  merge(sourceDir, targetDir);
};



module.exports = {
  mergeDir,
  deleteFiles
}
