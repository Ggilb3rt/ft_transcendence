import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ChatGuard implements CanActivate {
  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const cookief = context.args[0].handshake.headers.cookie;
    
    return true;
  }
}
