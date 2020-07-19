## JunhoPublishPlugin
* Automatic deployment and generation of H plug-ins
* You can use it app.js As a service, test the examples

### example
```shell
$: npm install 
$: node app.js
// Enable another window
$: cd demo 
$: npm install
$: npm run build
```

### configuration
```js
new JunhoPublishPlugin({
  domain: 'http://localhost:3001/receive',
  target: 'D:\\webpackPlugin\\pubt\\upload',
  receiveType: 'merge', // replace merge
})
```

### options
| option        | descriptiin             | type         | Required       | 
| ------------- | ----------------------  | ------------ | -------------  |
| domain        | receive server adddress | String       |   Required     |
| targe         | remote file path        | string       |   Required     |
| receiveType   | Accept file type        | string       |   Required     |

