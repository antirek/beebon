

--- таблица ключей

DROP TABLE IF EXISTS `key1235`;

CREATE TABLE `key1235` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `tag` varchar(32) NOT NULL DEFAULT '',
  `status` varchar(32) NOT NULL DEFAULT 'init',
  `payload` json DEFAULT NULL,
  `ip` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`)
) 
COLLATE='utf8_general_ci' 
ENGINE=InnoDB DEFAULT CHARSET=utf8;


--- таблица файлов

CREATE TABLE `files` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `filename` varchar(255) NOT NULL DEFAULT '',
  `mime` varchar(255) NOT NULL DEFAULT '',
  `originalname` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;