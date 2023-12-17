const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const { parse } = require('url');
const next = require('next');
const { createPublicClient, http, decodeEventLog } = require('viem')
const { chainToConnect } = require('viem/chains');

const ColorTypesToName = {
  0: "Red",
  1: "Orange",
  2: "Yellow",
  3: "Green",
  4: "Blue",
  5: "Indigo",
  6: "Violet",
}

const ColorTypesToEmoji = {
  0: "🟥",
  1: "🟧",
  2: "🟨",
  3: "🟩",
  4: "🟦",
  5: "🟪",
  6: "🟫",
}

const colorClashContractConfig = {
  address: "0x343C0a3f355E0C9786a60caA2B5a3B243731D353",
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        }
      ],
      "name": "FetchingRandomNumber",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "randomNumber",
          "type": "uint256"
        }
      ],
      "name": "RandomNumberReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deduction",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "supply",
          "type": "uint256"
        }
      ],
      "name": "RoundColorDeduction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum ColorClash.RoundState",
          "name": "status",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "enum ColorClash.ColorTypes",
          "name": "winner",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "supply",
          "type": "uint256"
        }
      ],
      "name": "RoundEnded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "roundNumber",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "RoundStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "trader",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isBuy",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "shareAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "ethAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "protocolEthAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "supply",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Trade",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "GAME_DURATION",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "buyShares",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "colorSharesBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "colors",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "supply",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentRound",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deductionFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameEndTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "supply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "scalingFactor",
          "type": "uint256"
        }
      ],
      "name": "getAdjustedPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "getBuyPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "getBuyPriceAfterFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "supply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "getPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        }
      ],
      "name": "getScalingFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "getSellPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "getSellPriceAfterFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolFeeDestination",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolFeePercent",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_requestId",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "_randomWords",
          "type": "uint256[]"
        }
      ],
      "name": "rawFulfillRandomWords",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "rounds",
      "outputs": [
        {
          "internalType": "bool",
          "name": "ended",
          "type": "bool"
        },
        {
          "internalType": "enum ColorClash.RoundState",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "winner",
          "type": "uint8"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "paid",
              "type": "uint256"
            },
            {
              "internalType": "uint256[]",
              "name": "randomWords",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct ColorClash.VrfRequestStatus",
          "name": "vrfRequestStatus",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum ColorClash.ColorTypes",
          "name": "color",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "sellShares",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_randomWord",
          "type": "uint256"
        }
      ],
      "name": "testFulfillRandomWords",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalValueDeposited",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawLink",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
}

const client = createPublicClient({
  chain: chainToConnect,
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

const sendPushToAll = ({ title, body }) => {
  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, JSON.stringify({ title, body })).catch(console.log);
  } );
}

const unwatchRoundEnded = client.watchContractEvent({
  ...colorClashContractConfig,
  eventName: 'RoundEnded',
  onLogs: (logs) => {
    logs.forEach(log => {
      const decodedLog = decodeEventLog({
        abi: colorClashContractConfig.abi,
        topics: log.topics,
        data: log.data,
      })
      console.log(decodedLog);

      const { timestamp, roundNumber, reward, winner, value, supply } = decodedLog.args;

      sendPushToAll({
        title: `${ColorTypesToEmoji[winner]} ${ColorTypesToName[winner]} won ${Number(reward)} ETH`,
        body: `${ColorTypesToEmoji[winner]} ${ColorTypesToName[winner]} Supply:${Number(supply)} ETH and Market Cap:${Number(value)} ETH`,
      })
    })
  }
})

//send push notification every 30 minutes
const pollGameStatus = (callback) => {
  setInterval(() => {
    const red = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [0],
    });
    const orange = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [1],
    });
    const yellow = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [2],
    });
    const green = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [3],
    });
    const blue = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [4],
    });
    const indigo = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [5],
    });
    const violet = client.readContract({
      ...colorClashContractConfig,
      functionName: 'colors',
      args: [6],
    });
    const roundNumber = client.readContract({
      ...colorClashContractConfig,
      functionName: 'currentRound',
    });
    const totalValueDeposited = client.readContract({
      ...colorClashContractConfig,
      functionName: 'totalValueDeposited',
    });

    Promise.all([red, orange, yellow, green, blue, indigo, violet, roundNumber, totalValueDeposited]).then(values => {
      const [_red, _orange, _yellow, _green, _blue, _indigo, _violet, _roundNumber, _totalValueDeposited] = values;
      const redValue = Number(_red[0]) / 10 ** 18;
      const redSupply = Number(_red[1]);
      const orangeValue = Number(_orange[0]) / 10 ** 18;
      const orangeSupply = Number(_orange[1]);
      const yellowValue = Number(_yellow[0]) / 10 ** 18;
      const yellowSupply = Number(_yellow[1]);
      const greenValue = Number(_green[0]) / 10 ** 18;
      const greenSupply = Number(_green[1]);
      const blueValue = Number(_blue[0]) / 10 ** 18;
      const blueSupply = Number(_blue[1]);
      const indigoValue = Number(_indigo[0]) / 10 ** 18;
      const indigoSupply = Number(_indigo[1]);
      const violetValue = Number(_violet[0]) / 10 ** 18;
      const violetSupply = Number(_violet[1]);
      const roundNumber = Number(_roundNumber);
      const totalValueDeposited = Number(_totalValueDeposited) / 10 ** 18;

      callback({
        redValue,
        redSupply,
        orangeValue,
        orangeSupply,
        yellowValue,
        yellowSupply,
        greenValue,
        greenSupply,
        blueValue,
        blueSupply,
        indigoValue,
        indigoSupply,
        violetValue,
        violetSupply,
        roundNumber,
        totalValueDeposited,
      })
    })
  }, 1000 * 60 * 30)
}


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
