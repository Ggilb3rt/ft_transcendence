-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER,
    "admin_id" INTEGER,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ban_channels" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "banned_id" INTEGER,
    "ban_begin" TIMESTAMPTZ(6),

    CONSTRAINT "ban_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ban_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "banned_id" INTEGER,
    "ban_begin" TIMESTAMPTZ(6),

    CONSTRAINT "ban_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "need_pass" BOOLEAN,
    "pass" TEXT,
    "is_public" BOOLEAN,
    "chan_owner" INTEGER,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "player_left_id" INTEGER,
    "player_right_id" INTEGER,
    "score_left" INTEGER,
    "score_right" INTEGER,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER,
    "sender_id" INTEGER,
    "content" TEXT NOT NULL,
    "message_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muted" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER,
    "muted_id" INTEGER,
    "mute_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "muted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "ranking" INTEGER,
    "wins" INTEGER,
    "loses" INTEGER,
    "two_factor_auth" BOOLEAN,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_list" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER,
    "user_id" INTEGER,

    CONSTRAINT "users_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_friends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_friends_AB_unique" ON "_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_friends_B_index" ON "_friends"("B");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ban_channels" ADD CONSTRAINT "ban_channels_banned_id_fkey" FOREIGN KEY ("banned_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ban_channels" ADD CONSTRAINT "ban_channels_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ban_users" ADD CONSTRAINT "ban_users_banned_id_fkey" FOREIGN KEY ("banned_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ban_users" ADD CONSTRAINT "ban_users_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_chan_owner_fkey" FOREIGN KEY ("chan_owner") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player_left_id_fkey" FOREIGN KEY ("player_left_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player_right_id_fkey" FOREIGN KEY ("player_right_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "muted" ADD CONSTRAINT "muted_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "muted" ADD CONSTRAINT "muted_muted_id_fkey" FOREIGN KEY ("muted_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_list" ADD CONSTRAINT "users_list_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_list" ADD CONSTRAINT "users_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
