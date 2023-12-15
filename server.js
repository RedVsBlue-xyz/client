const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const { parse } = require('url');
const next = require('next');
const { createPublicClient, http } = require('viem')
const { mainnet } = require('viem/chains')

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

client.getBlockNumber().then(blockNumber => {
  console.log("blockNumber", blockNumber)
})

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const publicVapidKey = "BE2H2BPms7pkWMRcOMbY-XOccXwJLVrHHQYh4ESAzN9_yATNdnFV9IrgVSgUtfsQjNjooarGN4YpJnkeULM12PA";
const privateVapidKey = "oNPyJBRoyuSRJEmeGhoyGcMNgDyNhh1q6ZkS_6QQxdc";

// Setup the public and private VAPID keys to web-push library.
webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);


const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let subscriptions = [];

//send push notification every 30 seconds
setInterval(() => {
  const payload = JSON.stringify({ title: "Hello World", body: "This is your first push notification" });
  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, payload).catch(console.log);
  } );
} , 30000);


app.prepare().then(() => {
    const server = express();

    server.use(bodyParser.json());

    server.post('/subscribe', (req, res) => {
      const subscription = req.body;
      subscriptions.push(subscription);
      res.status(201).json({});
      const payload = JSON.stringify({ title: "Hello World", body: "This is your first push notification" });
      console.log(subscription);
      webpush.sendNotification(subscription, payload).catch(console.log);
    })
    

    server.get('/a', (req, res) => {
        return app.render(req, res, '/a', req.query);
    });

    server.get('/b', (req, res) => {
        return app.render(req, res, '/b', req.query);
    });

    server.all('*', (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    server.listen(port, err => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
