DROP TABLE IF EXISTS `db_history`;

CREATE TABLE `db_history` (
	`_id` INT UNSIGNED NOT NULL auto_increment,
	`version` INT UNSIGNED NOT NULL,
	`patch` INT UNSIGNED NOT NULL,
	`comment` VARCHAR( 255 ) NOT NULL,
	`applied` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY( _id )
) ENGINE=INNODB CHARACTER SET=utf8;
