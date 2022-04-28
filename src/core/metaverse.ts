/* eslint-disable max-len */
import MMO_Core from './mmo_core';
import pino from 'pino';
import Logger = pino.Logger;

/*****************************
  METAVERSE by Axel Fiolle
*****************************/
const { ImmutableXClient, Link } = require('@imtbl/imx-sdk');

const axios = require('axios');

export default class Metaverse {
    private environment = 'main';
    private isMainNet = this.environment === 'main';

    private gameworld;

    private allowedCrypto;
    private networks;
    private ethCollections;
    private net;
    private mainnet;
    private testnet;
    private collections;
    private mainNetCollections;
    private testNetCollections;
    private link;
    private client;
    private openSeaApiKey;
    private abiKey;
    private allAssets;
    private restApi;

    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    initialize(mmoCore: MMO_Core) {
        this.logger.info('[ETH] METAVERSE by Axel Fiolle');

        this.gameworld = mmoCore.gameworld;

        this.allowedCrypto = {
            eth: true, // Ethereum
            rinkeby: true, // TestNet
            imx: false, // Immutable X (ETH L2)
            matic: false, // Polygon (ETH L2)
            sol: false, // Solana
            xtz: false, // Tezos
            waxp: false, // WAX
        };

        this.networks = {
            main: {
                linkAddress: 'https://link.x.immutable.com',
                apiAddress: 'https://api.x.immutable.com/v1',
                openseaAddress: 'https://api.opensea.io/api/v1',
                collection: '', // Your main collection
            },
            test: {
                linkAddress: 'https://link.uat.x.immutable.com',
                apiAddress: 'https://api.uat.x.immutable.com/v1',
                openseaAddress: 'https://testnets-api.opensea.io/api/v1',
                collection: '',
            },
        };
        this.ethCollections = {
            // Main Ethereum collections (at OpenSea)
            main: [],
            test: [],
        };
        this.net = this.networks[this.environment] || this.networks.main;
        this.mainnet = this.networks.main;
        this.testnet = this.networks.test;
        this.collections = this.ethCollections[this.environment] || this.ethCollections.main;
        this.mainNetCollections = this.ethCollections.main;
        this.testNetCollections = this.ethCollections.test;
        this.link = null;
        this.client = null;

        this.openSeaApiKey = '';
        this.abiKey = this.openSeaApiKey;
        this.allAssets = [];

        this.restApi = {
            // Endpoints to API
            world: {
                main: (offset = 0, limit = 50) =>
                    `${this.mainnet.openseaAddress}/assets?collection=${this.ethCollections.world[0]}&offset=${offset}&limit=${limit}`,
            },
            ethereum: {
                openseaCollection: (collection, offset = 0, limit = 50) =>
                    `${this.mainnet.openseaAddress}/assets?collection=${collection}&offset=${offset}&limit=${limit}`,
                openseaOwned: (owner, offset = 0, limit = 50) =>
                    `${this.mainnet.openseaAddress}/assets?owner=${owner}&offset=${offset}&limit=${limit}`,
                openseaToken: (owner, tokenId, offset = 0, limit = 50) =>
                    `${this.mainnet.openseaAddress}/assets?owner=${owner}&offset=${offset}&limit=${limit}`,
            },
            rinkeby: {
                openseaCollection: (collection, offset = 0, limit = 50) =>
                    `${this.testnet.openseaAddress}/assets?collection=${collection}&offset=${offset}&limit=${limit}`,
                openseaOwned: (owner, offset = 0, limit = 50) =>
                    `${this.testnet.openseaAddress}/assets?owner=${owner}&offset=${offset}&limit=${limit}`,
                openseaToken: (owner, tokenId) =>
                    `${this.testnet.openseaAddress}/assets?owner=${owner}&token_ids=${tokenId}`,
            },
            immutable: {
                imxCollection: (cursor) =>
                    `${this.net.apiAddress}/assets?collection=${this.net.collection}${
                        cursor ? `&cursor=${cursor}` : ''
                    }`,
                imxOwned: (address) =>
                    `${this.net.apiAddress}/assets?collection=${this.net.collection}&user=${address}`,
            },
        };

        if (this.allowedCrypto.imx) this.fetchCollection(this.restApi.immutable.imxCollection()); // Get IMX collection
        if (this.allowedCrypto.eth)
            for (const collection of this.ethCollections['main']) {
                this.fetchCollection(this.restApi.ethereum.openseaCollection(collection), 'eth'); // Get ETH collection
            }
        if (this.allowedCrypto.rinkeby)
            for (const collection of this.ethCollections['test']) {
                this.fetchCollection(this.restApi.rinkeby.openseaCollection(collection), 'rinkeby'); // Get Rinkeby collection
            }
        this.logger.info('[ETH] METAVERSE is ready!');
        this.logger.info('######################################');
    }

    // HELPERS
    findPlayerByClientId = (clientId) => this.gameworld.getNodeBy('clientId', clientId);
    findAsset = (assetId, collection) => {
        return this.allAssets.find(
            (asset) =>
                asset.id === assetId && // same id // same contract
                ((asset.token_address && asset.token_address === collection) ||
                    (asset.collection && asset.collection.slug && asset.collection.slug === collection)),
        ); // endof .find()
    }; // endof findAsset()

    // METAVERSE FUNCTIONS
    setup = async () => {
        this.logger.info('[ETH] Setup...');
        const link = new Link(this.net.linkAddress);
        const client = await ImmutableXClient.build({ publicApiUrl: this.net.apiAddress });
        this.link = link;
        this.client = client;
        return { link, client };
    };

    handleFetchError = (error) => {
        if (!error) return;
        console.error('[ETH] handleFetchError', error);
    };

    fetchCollection = async (url = this.restApi.ethereum.openseaCollection(), chain = 'eth') => {
        this.logger.info('[ETH] fetchCollection...', url);
        const res = await axios
            .get(url, { headers: { 'X-API-KEY': this.abiKey } })
            .catch((error) => this.handleFetchError(error))
            .then((response) => {
                if (response && response.data) {
                    // on success
                    const _assets = // Format depends on selected chain
                        chain === 'eth' || chain === 'rinkeby'
                            ? response.data.assets || []
                            : chain === 'imx'
                            ? response.data.result || []
                            : [];
                    for (const artefact of _assets) {
                        this.logger.info('[ETH] ... ' + artefact.name);
                        this.allAssets.push(Object.assign(artefact, { chain }));
                    }
                }
            });
        return res;
    };

    verifyStarkSignature = (starkPublicKey, clientId) => {
        if (!starkPublicKey || !clientId) return false;
        const _player = this.gameworld.getNodeBy('starkPublicKey', starkPublicKey);
        if (_player) {
            if (_player.clientId !== clientId) return false;
            return _player.address || false;
        } else return false;
    };

    verifyEthSignature = (signature, clientId) => {
        if (!signature || signature === 'Disconnected' || !clientId) return false; // Prevent breaking function
        const _player = this.gameworld.getNodeBy('clientId', clientId); // Get the real user node
        if (_player) {
            const debug = !this.isMainNet ? _player.address : null;
            const resolveAdress = this.getEthSignatureAddress(signature, { debug }); // Reverse the signature
            return resolveAdress === _player.address; // Check if resolved address match with know user true address
        } else return false;
    };

    getEthSignatureAddress = (signature, payload: { message?: string; debug?: string }) => {
        let message = payload.message || 'signature';
        if (!signature || signature === 'Disconnected') return '0x0000000000000000000000000000000000000000';

        const util = require('ethereumjs-util');

        message = '\x19Ethereum Signed Message:\n' + message.length + message;
        message = util.keccak(Buffer.from(message, 'utf-8'));

        const { v, r, s } = util.fromRpcSig(signature);
        const pubKey = util.ecrecover(util.toBuffer(message), v, r, s);
        const addrBuf = util.pubToAddress(pubKey);
        const addr = util.bufferToHex(addrBuf);
        const response = this.isMainNet ? addr : payload.debug || addr;

        this.logger.info('getSignatureWallet', response);
        return response;
    };

    getAssetsByWalletAddress = async (address) => {
        if (address) {
            this.logger.info('[I] fetch request for ' + address);
            const assets = [];
            if (this.allowedCrypto.eth) {
                // first mainnet
                await axios
                    .get(this.restApi.ethereum.openseaOwned(address), { headers: { 'X-API-KEY': this.abiKey } }) // Fetch ETH tokens
                    .then(async (response) => {
                        await (response.data.assets || []).map((asset) => {
                            if (asset.name === null || asset.name === undefined) asset.name = 'NoName';
                            if (this.mainNetCollections.includes(asset.collection.slug))
                                assets.push(Object.assign(asset, { chain: 'eth' }));
                        });
                        // then testnet
                        if (this.allowedCrypto.rinkeby)
                            return await axios
                                .get(this.restApi.rinkeby.openseaOwned(address), {
                                    headers: { 'X-API-KEY': this.abiKey },
                                }) // Fetch ETH tokens
                                .then((response) =>
                                    (response.data.assets || []).map((asset) => {
                                        if (asset.name === null || asset.name === undefined) asset.name = 'NoName';
                                        if (this.testNetCollections.includes(asset.collection.slug))
                                            assets.push(Object.assign(asset, { chain: 'rinkeby' }));
                                    }),
                                );
                    });
            }

            // ImmutableX
            if (this.allowedCrypto.imx)
                await axios
                    .get(this.restApi.immutable.imxOwned(address), { headers: { 'X-API-KEY': this.abiKey } }) // Fetch IMX tokens
                    .then((response) =>
                        (response.data.result || []).map((asset) => {
                            if (this.allAssets.find(asset)) assets.push(Object.assign(asset, { chain: 'imx' }));
                        }),
                    );
            return assets;
        }
    };

    playerHasAsset = async (address, id, collection, chain = 'eth') => {
        if (!address || !id || !collection) return false;
        this.logger.info('playerHasAsset', address, id, collection, chain);
        if (chain === 'eth' && this.allowedCrypto.eth)
            return await axios
                .get(this.restApi.ethereum.openseaOwned(address), { headers: { 'X-API-KEY': this.abiKey } })
                .then((response) =>
                    ((response && response.data && response.data.assets) || []).find(
                        (asset) => asset && asset.id === id && asset.collection && asset.collection.slug === collection,
                    ),
                );
        if (chain === 'rinkeby' && this.allowedCrypto.eth)
            return await axios
                .get(this.restApi.rinkeby.openseaOwned(address), { headers: { 'X-API-KEY': this.abiKey } })
                .then((response) =>
                    ((response && response.data && response.data.assets) || []).find(
                        (asset) => asset && asset.id === id && asset.collection && asset.collection.slug === collection,
                    ),
                );
        else if (chain === 'imx' && this.allowedCrypto.eth)
            return await axios
                .get(this.restApi.immutable.imxOwned(address), { headers: { 'X-API-KEY': this.abiKey } })
                .then((response) =>
                    ((response && response.data && response.data.assets) || []).find(
                        (asset) => asset && asset.id === id && asset.collection && asset.collection.slug === collection,
                    ),
                );
        else return false;
    };
    getPlayerAsset = async (address, id, collection, chain = 'eth') => {
        return this.playerHasAsset(address, id, collection, chain);
    };

    useEther = async (clientId, targetUniqueId, assetId, collection, chain = 'eth') => {
        if (!clientId || !collection) return;
        this.logger.info('[ETH] useEther', clientId, targetUniqueId, assetId);
        const _player = this.findPlayerByClientId(clientId); // get the true user informations
        if (_player) {
            const debug = !this.isMainNet ? _player.address : null;
            const trueAddress = this.getEthSignatureAddress(_player.signature, { debug }); // extract known user true address
            const owned = await this.playerHasAsset(trueAddress, assetId, collection, chain); // test if owned
            if (owned) return owned;
        }
    };
}
