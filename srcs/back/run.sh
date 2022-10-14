npm ci
# chmod 755 /resources
npx prisma migrate deploy
npx prisma generate
npm run start:dev