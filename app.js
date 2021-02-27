const { urlencoded } = require('express');
const express = require('express');
const ySP = require('yahoo-stock-prices');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//database
mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('connected to atlas')
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

//models
const Bought = require('./model/Bought.js');
const watchList = require('./model/Watchlist.js');

let stocks = [];
let radar = [];

getPrice = () => {
    stocks.forEach((e) => {
        ySP.getCurrentPrice(e.name, (err, price) => {
            if (err) {
                console.log(err);
            } else {
                e.currentPrice = price;
                const roi = e.currentPrice / e.bought * 100 - 100;
                e.returnOfInvestment = roi.toFixed(2);
            }
        })
    })

    radar.forEach((e) => {
        ySP.getCurrentPrice(e.name, (err, price) => {
            if (err) {
                console.log(err);
            } else {
                e.currentPrice = price;
            }
        })
    })
}

const readStocks = () => {
    Bought.find((err, stonks) => {
        if (err) {
            console.log(err)
        } else {
            stocks = [];
            stonks.forEach((data, index) => {
                const pushToStocks = {
                    name: data.ticker,
                    bought: data.bought,
                    currency: data.currency,
                    invested: true,
                    key: index
                }
    
                stocks.push(pushToStocks);
                getPrice();
            })
        }
    })

    watchList.find((err, list) => {
        if (err) {
            console.log(err)
        } else {
            radar = [];
            list.forEach((watch, index) => {
                const pushtToRadar = {
                    name: watch.ticker,
                    currency: watch.currency,
                    invested: false,
                    key: index
                }

                radar.push(pushtToRadar)
                getPrice();
            })
        }
    })
}

readStocks();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//for invested
app.get('/api/investments', (req, res) => {
    getPrice();
    res.json(stocks);
});

app.post('/api/investments', async (req, res) => {
    const invested = new Bought ({
        ticker: req.body.ticker,
        bought: req.body.bought,
        currency: req.body.currency
    });

    try {
        const saverino = await invested.save();
        readStocks();
        res.send("SUCCESS")
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
});

//for watchlist
app.get('/api/watchlist', (req, res) => {
    res.json(radar)
});

app.post('/api/watchlist', async (req, res) => {
    const wList = new watchList ({
        ticker: req.body.ticker,
        currency: req.body.currency
    });

    try {
        const save = await wList.save();
        res.send("SUCCESS");
    } catch (err) {
        res.status(400).send(err);
    }
});

app.listen(process.env.PORT || 4000, ()=> {
    console.log("App deployed")
});