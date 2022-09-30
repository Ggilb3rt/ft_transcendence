import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FourtyTwoStrategy } from './local.strategy';

@Injectable()
export class FourtyTwoGuard extends AuthGuard("42") {}