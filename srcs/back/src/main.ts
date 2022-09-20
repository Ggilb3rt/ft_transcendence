import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';
// const fs = require('fs');
declare const module: any;

config();

// const httpsOptions = {
//   key: fs.readFileSync('./security/key.pem', 'utf8'),
//   cert: fs.readFileSync('./security/cert.pem', 'utf8')
// }

async function bootstrap() {
  
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
