import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
// const fs = require('fs');
declare const module: any;

config();

// const httpsOptions = {
//   key: fs.readFileSync('./security/key.pem', 'utf8'),
//   cert: fs.readFileSync('./security/cert.pem', 'utf8')
// }

async function bootstrap() {
  
  try {
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: true
    }
  });
  app.enableCors();
  app.use(cookieParser())
  await app.listen(3000);
  } catch(err) {
    console.log(err);
  }
}
bootstrap();
