ALTER TABLE `applications` ADD `accountType` varchar(32);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt1Creditor` varchar(255);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt1Balance` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt1Payment` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt2Creditor` varchar(255);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt2Balance` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt2Payment` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt3Creditor` varchar(255);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt3Balance` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `debt3Payment` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `hasLiens` varchar(16);--> statement-breakpoint
ALTER TABLE `applications` ADD `liensExplanation` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `merchantId` varchar(128);