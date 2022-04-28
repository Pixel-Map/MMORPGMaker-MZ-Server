import { Router } from 'express';
import MMO_Core from '../core/mmo_core';

const EthersRouter = Router();

EthersRouter.get('/:address', async (req, res) => {
    const { address } = req.params;
    if (address) {
        const datas = await MMO_Core['metaverse'].getAssetsByWalletAddress(address);
        res.send(datas);
    } else res.send([]);
});

export default EthersRouter;
