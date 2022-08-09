const express = require('express');
const TxList = require('../db/models').TxList;
const router = express.Router();

router.get('/', (req, res) => {
    res.json({"message": "Api server is running"});
});

router.post('/add_tx', async(req, res) => {
    const reqBody = req.body;
    await TxList.create(reqBody);

    return res.json({status: true});
});

router.post('/update_tx', async(req, res) => {
    const reqBody = req.body;
    await TxList.update({
        status: 1
    }, {
        where: {
            id: reqBody.id
        }
    });

    return res.json({status: true});
});

router.post('/find_tx', async(req, res) => {
    const reqBody = req.body;
    const selTx = await TxList.findOne({
        where: {
            from_address: reqBody.sender,
            to_address: reqBody.receiver,
            from_chain: reqBody.from_chain,
            to_chain: reqBody.to_chain,
            status: 0
        }
    });

    if(selTx) {

    }

    return res.json({data: selTx, status: true});
});

module.exports = router;
