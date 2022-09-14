# ft_transcendence

by ORMARTIN && GGILBERT && PTROGER

![Whaow](https://www.nicepng.com/png/detail/225-2258468_wow-meme-png-clip-royalty-free-download-eddy.png)

## TECH USED ##

-- docker-compose
  |
  |-- Database 
  |   |
  |   |-- Postgres // Database management 
  |   |
  |   |-- Sqitch // Database migrations
  |
  |-- Back -- NestJS
  |
  |-- Front -- Vue
  |

## POSTGRES ##

 1. ---- CONTAINER ----

  Doc-> https://hub.docker.com/_/postgres/
  best doc ever, docker image comes with a lot of features, notably:
  - launch initialization scripts only if /data doesnt exist
  - all envs variable cf link above

 2. ---- SETUP ----

  First you will need to download sqitch client for Postgres.
  Unfortunately, we will have to user homebrew on school computers.

  ```
  brew tap sqitchers/sqitch
  brew install sqitch --with-postgres-support --with-sqlite-support
  sqitch help
  ```

  Docs -> https://sqitch.org/docs/manual/
          https://sqitch.org/docs/manual/sqitchtutorial/
  
 3. ---- MIGRATIONS ----

  Each time you use sqitch add, it creates a .sql file in which we write the script to migrate.
  do : 

  ```
  alias sqd='date -u "+%Y_%m_%d_%Hh%M_"'
  ```
  
  so that everytime you create a migration using 'sqitch add' you can do : 

  ```
  sqitch add $(sqd)my_migration_name -n "My migration description"
  ```

  or you can use the script ./srcs/database/create_migration.sh do :

  ```
  sh create_migration.sh [my_mygration_name] ["My migration description"]
  ```

  You will also need to write a test and a revert script in sql.
  For example, a test script on a CREATE TABLE migration can be an ALTER TABLE assessment on this table.
  If it works, your test passes, if not it failed.

OH HI Maaarc !!