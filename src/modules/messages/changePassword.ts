import MMO_Core from '../../core/mmo_core';

import * as security from '../../core/security';
import { Messages } from './messages';

export class ChangePassword {
    mmoCore: MMO_Core;

    constructor(messages: Messages) {
        this.mmoCore = messages.mmoCore;
    }

    async use(args, initiator) {
        if (args.length < 3) {
            return this.mmoCore.socket.modules.messages.sendToPlayer(
                initiator,
                'System',
                'Not enough arguments.',
                'error',
            );
        }

        const oldPassword = security.hashPassword(args[1].toLowerCase());
        const newPassword = security.hashPassword(args[2].toLowerCase());

        const user = await this.mmoCore.database.findUser({ username: initiator.playerData.username });
        if (user) {
            if (oldPassword !== user.password) {
                return this.mmoCore.socket.modules.messages.sendToPlayer(
                    initiator,
                    'System',
                    'Wrong old password.',
                    'error',
                );
            }

            const payload = {
                username: initiator.playerData.username,
                password: newPassword,
            };

            await this.mmoCore.database.savePlayer(payload);
            this.mmoCore.socket.modules.messages.sendToPlayer(
                initiator,
                'System',
                'Password changed with success!',
                'action',
            );
        }
    }
}
