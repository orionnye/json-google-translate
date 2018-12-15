#!/usr/bin/env node

//  Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate')
const fs = require('fs')
const path = require('path')
function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// Instantiates a client using default project and credentials.
const translate = new Translate()

// Checks to see if minimum parameters were passed in
if (process.argv.length < 5) {
    console.log(
`
Usage:

    jgt input.json outputDir lang-code1 lang-code2...
`
    )
} else {
    // Variables Imported from the file call
    const [srcFilePath, outputDir, ...newLanguages] = process.argv.slice(2)
    const oldData = JSON.parse(fs.readFileSync(srcFilePath).toString())
    const propValues = Object.values(oldData)
    const propNames = Object.keys(oldData)
    const fileType = '.json'
    
    // Translates Into all given languages
    for (let language of newLanguages){
        let newFileName = language + fileType
        let newFilePath = path.join(outputDir, newFileName)
        let newData = {}
    
        // translate Text
        translate
            .translate(propValues, language)
            .then(results => {
                const translation = results[0]
    
                for (let i = 0; i < translation.length; i++) {
                    newData[propNames[i]] = translation[i]
                }
                ensureDirectoryExistence(newFilePath)
                fs.writeFile(newFilePath, JSON.stringify(newData, null, 4), (err) => {
                    if (err) {
                        console.error(err)
                        process.exit(1)
                    }
                    console.log(`Translated: ${newFilePath}`)
                })
            })
            .catch(err => {
                console.error('ERROR:', err)
                process.exit(1)
            })
    }
}
