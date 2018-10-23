#!/bin/sh
read -p "DB name: " DB
read -p "DB user: " USER
read -p "DB pass: " PASS

mysqldump -u$USER -p$PASS --add-drop-table $DB > bak.sql
mysql -u$USER -p$PASS --database=$DB --execute "SOURCE unicode.sql"
mysqlcheck -u$USER -p$PASS --auto-repair --optimize $DB