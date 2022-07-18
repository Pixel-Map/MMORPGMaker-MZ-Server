import MMO_Core from '../../core/mmo_core';

const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
let mmoCore;

describe('User authentication', () => {
    let io, serverSocket, clientSocket;

    beforeAll((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            mmoCore = MMO_Core.getInstance();
            mmoCore.database.initialize().then(() => {
                mmoCore.socket.initialize(io, mmoCore).then(() => {
                    // Initalizing the socket-side of the server
                    // Initializing the RESTFUL API
                    // mmoCore.gameworld.initialize(mmoCore); // Initializing world environment
                });
                const port = httpServer.address().port;
                clientSocket = new Client(`http://localhost:${port}`);
                io.on('connection', (socket) => {
                    serverSocket = socket;
                });
                clientSocket.on('connect', done);
            });
        });
    });

    test('should allow user to register & login successfully', (done) => {
        clientSocket.emit('register', {
            username: 'testuser',
            password: 'testpassword',
        });
        clientSocket.emit('login', {
            username: 'testuser',
            password: 'testpassword',
        });
        clientSocket.on('login_success', (response) => {
            done();
            const expectedPlayer = {
                username: 'testuser',
                x: 5,
                y: 5,
                status: null,
                mapId: 1,
                permission: 0,
                skin: {
                    id: 1,
                    battlerName: 'Actor1',
                    characterIndex: 0,
                    characterName: 'Actor1',
                    faceIndex: 0,
                    faceName: 'Actor1',
                },
                stats: {
                    id: 1,
                    classId: 1,
                    exp: 0,
                    hp: 544,
                    mp: 41,
                    level: 1,
                    items: {},
                    weapons: {},
                    armors: {},
                    gold: 0,
                    equips: [],
                    skills: [],
                },
            };
            expect(response.msg).toMatchObject(expectedPlayer);
        });
    });

    test('should NOT allow a user to re-register with same login name', (done) => {
        clientSocket.emit('register', {
            username: 'testuser',
            password: 'testpassword',
        });
        clientSocket.on('login_error', (response) => {
            expect(response.msg).toBe('Cannot create this account.');
        });
        done();
    });

    afterAll(() => {
        mmoCore.database.close();
        io.close();
        clientSocket.close();
    });
});
