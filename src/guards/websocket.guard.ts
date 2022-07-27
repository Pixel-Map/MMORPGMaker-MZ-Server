import { CanActivate, ExecutionContext } from '@nestjs/common';

export class WebSocketGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    if (client && client.playerData && client.playerData.id) {
      return true;
    } else {
      return false;
    }
  }
}
