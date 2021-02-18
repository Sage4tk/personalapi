const { urlencoded } = require('express');
const express = require('express');
const ySP = require('yahoo-stock-prices');

const app = express();
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

let all = [
    {
        name: "AMD",
        bought: 90,
        currency: "USD",
        currentPrice: undefined
    },
    {
        name: "BNGO",
        bought: 5,
        currency: "USD",
        currentPrice: undefined
    },
    {
        name: "NIO",
        bought: 52,
        currency: "USD",
        currentPrice: undefined
    },
    {
        name: "WBA",
        bought: 48.60,
        currency: "USD",
        currentPrice: undefined
    }
]

getPrice = () => {
    all.forEach((e) => {
        ySP.getCurrentPrice(e.name, (err, price) => {
            e.currentPrice = price;
            const roi = e.currentPrice / e.bought * 100 - 100;
            const fixed = roi.toFixed(2);
            e.returnOfInvesment = fixed;
        })
    })
    
}

getPrice();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/investments', (req, res) => {
    getPrice();
    res.json(all)
})

app.post('/api/investments', (req, res) => {
    const theInvestment = {
        name: req.body.name,
        bought: req.body.bought,
        currency: req.body. currency
    }

    all.push(theInvestment);
    getPrice();
    res.json("success")
})

app.listen(process.env.PORT || 4000, ()=> {
    console.log("App deployed")
})
