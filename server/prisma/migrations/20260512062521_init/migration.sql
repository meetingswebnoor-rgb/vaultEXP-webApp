-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `google_id` VARCHAR(128) NULL,
    `auth_provider` ENUM('local', 'google') NOT NULL DEFAULT 'local',
    `avatar` VARCHAR(512) NULL,
    `role` ENUM('user', 'admin', 'superadmin') NOT NULL DEFAULT 'user',
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `timezone` VARCHAR(50) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `settings` JSON NULL,
    `ai_profile` JSON NULL,
    `email_verify_token` VARCHAR(255) NULL,
    `email_verify_expires` DATETIME(3) NULL,
    `reset_token` VARCHAR(255) NULL,
    `reset_token_expires` DATETIME(3) NULL,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_google_id_key`(`google_id`),
    UNIQUE INDEX `users_email_verify_token_key`(`email_verify_token`),
    UNIQUE INDEX `users_reset_token_key`(`reset_token`),
    INDEX `users_status_deleted_at_idx`(`status`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `businesses` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('sole_proprietor', 'partnership', 'llc', 'corporation', 'nonprofit', 'freelance', 'agency', 'other') NOT NULL DEFAULT 'other',
    `industry` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `logo_url` VARCHAR(512) NULL,
    `website` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `address` VARCHAR(500) NULL,
    `employee_count` INTEGER NULL,
    `founded_date` DATE NULL,
    `tax_id` VARCHAR(50) NULL,
    `total_revenue` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `total_expenses` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `valuation` DECIMAL(18, 2) NULL,
    `wallet_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `businesses_user_id_status_idx`(`user_id`, `status`),
    INDEX `businesses_user_id_type_idx`(`user_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('residential', 'commercial', 'industrial', 'land', 'mixed_use') NOT NULL DEFAULT 'residential',
    `status` ENUM('owned', 'rented_out', 'vacant', 'under_renovation', 'for_sale') NOT NULL DEFAULT 'owned',
    `address` VARCHAR(500) NOT NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `country` VARCHAR(60) NULL,
    `postal_code` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `description` TEXT NULL,
    `size_sqft` DECIMAL(10, 2) NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `year_built` INTEGER NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `purchase_value` DECIMAL(18, 2) NULL,
    `purchase_date` DATE NULL,
    `current_value` DECIMAL(18, 2) NULL,
    `last_valuated` DATE NULL,
    `amenities` JSON NULL,
    `mortgage_data` JSON NULL,
    `insurance_data` JSON NULL,
    `image_urls` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `properties_user_id_status_idx`(`user_id`, `status`),
    INDEX `properties_user_id_type_idx`(`user_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenants` (
    `id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `national_id` VARCHAR(80) NULL,
    `emergency_name` VARCHAR(120) NULL,
    `emergency_phone` VARCHAR(30) NULL,
    `lease_start_date` DATE NOT NULL,
    `lease_end_date` DATE NULL,
    `rent_amount` DECIMAL(12, 2) NOT NULL,
    `security_deposit` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `payment_due_day` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('active', 'inactive', 'vacated', 'evicted') NOT NULL DEFAULT 'active',
    `notes` TEXT NULL,
    `ai_score` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tenants_property_id_status_idx`(`property_id`, `status`),
    INDEX `tenants_lease_end_date_idx`(`lease_end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rent_records` (
    `id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(7) NOT NULL,
    `amount_expected` DECIMAL(12, 2) NOT NULL,
    `amount_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `payment_date` DATE NULL,
    `status` ENUM('pending', 'paid', 'partial', 'overdue', 'waived') NOT NULL DEFAULT 'pending',
    `payment_method` VARCHAR(50) NULL,
    `receipt_url` VARCHAR(512) NULL,
    `late_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `notes` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `rent_records_property_id_month_idx`(`property_id`, `month` DESC),
    INDEX `rent_records_user_id_status_idx`(`user_id`, `status`),
    UNIQUE INDEX `rent_records_tenant_id_month_key`(`tenant_id`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `business_id` VARCHAR(191) NULL,
    `property_id` VARCHAR(191) NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `category` ENUM('operations', 'marketing', 'payroll', 'utilities', 'rent_cost', 'equipment', 'software', 'travel', 'legal', 'tax', 'advertising', 'other_business', 'maintenance', 'repair', 'insurance', 'mortgage', 'management_fee', 'renovation', 'landscaping', 'other_property') NOT NULL DEFAULT 'other_business',
    `date` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `vendor` VARCHAR(120) NULL,
    `payment_method` VARCHAR(50) NULL,
    `receipt_url` VARCHAR(512) NULL,
    `is_recurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrence_rule` VARCHAR(100) NULL,
    `is_tax_deductible` BOOLEAN NOT NULL DEFAULT false,
    `tax_category` VARCHAR(80) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `expenses_user_id_date_idx`(`user_id`, `date` DESC),
    INDEX `expenses_business_id_date_idx`(`business_id`, `date` DESC),
    INDEX `expenses_property_id_date_idx`(`property_id`, `date` DESC),
    INDEX `expenses_user_id_category_idx`(`user_id`, `category`),
    INDEX `expenses_user_id_is_tax_deductible_idx`(`user_id`, `is_tax_deductible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `business_id` VARCHAR(191) NULL,
    `invoice_number` VARCHAR(100) NOT NULL,
    `client_name` VARCHAR(200) NOT NULL,
    `client_email` VARCHAR(255) NULL,
    `client_address` VARCHAR(500) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `subtotal` DECIMAL(18, 2) NOT NULL,
    `tax_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `discount_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(18, 2) NOT NULL,
    `status` ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft',
    `issue_date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `due_date` DATE NULL,
    `paid_at` DATETIME(3) NULL,
    `items` JSON NOT NULL,
    `notes` TEXT NULL,
    `pdf_url` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_user_id_status_idx`(`user_id`, `status`),
    INDEX `invoices_user_id_due_date_idx`(`user_id`, `due_date`),
    INDEX `invoices_business_id_status_idx`(`business_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `investments` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `ticker` VARCHAR(20) NULL,
    `type` ENUM('stock', 'etf', 'crypto', 'mutual_fund', 'real_estate', 'bond', 'business', 'manual_asset') NOT NULL DEFAULT 'manual_asset',
    `status` ENUM('active', 'sold', 'partially_sold') NOT NULL DEFAULT 'active',
    `platform` VARCHAR(100) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `quantity` DECIMAL(24, 8) NULL,
    `avg_buy_price` DECIMAL(18, 6) NULL,
    `amount_invested` DECIMAL(18, 2) NOT NULL,
    `current_value` DECIMAL(18, 2) NOT NULL,
    `realized_gain` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `purchase_date` DATE NULL,
    `sell_date` DATE NULL,
    `risk_level` INTEGER NULL,
    `goal_tag` VARCHAR(80) NULL,
    `notes` TEXT NULL,
    `price_history` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `investments_user_id_type_status_idx`(`user_id`, `type`, `status`),
    INDEX `investments_user_id_goal_tag_idx`(`user_id`, `goal_tag`),
    INDEX `investments_ticker_idx`(`ticker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `account_type` ENUM('checking', 'savings', 'credit', 'investment', 'crypto', 'cash', 'other') NOT NULL DEFAULT 'checking',
    `bank_name` VARCHAR(100) NULL,
    `masked_number` VARCHAR(10) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `balance` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `color` VARCHAR(10) NULL,
    `icon` VARCHAR(50) NULL,
    `linked_business_id` VARCHAR(36) NULL,
    `linked_property_id` VARCHAR(36) NULL,
    `linked_investment_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `wallets_user_id_idx`(`user_id`),
    INDEX `wallets_user_id_is_default_idx`(`user_id`, `is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `wallet_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('income', 'expense', 'transfer') NOT NULL,
    `status` ENUM('completed', 'pending', 'failed', 'reversed') NOT NULL DEFAULT 'completed',
    `amount` DECIMAL(18, 2) NOT NULL,
    `balance_after` DECIMAL(18, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `category` VARCHAR(80) NULL,
    `merchant` VARCHAR(120) NULL,
    `description` VARCHAR(500) NULL,
    `date` DATE NOT NULL,
    `reference_id` VARCHAR(120) NULL,
    `to_wallet_id` VARCHAR(36) NULL,
    `expense_id` VARCHAR(36) NULL,
    `invoice_id` VARCHAR(36) NULL,
    `rent_id` VARCHAR(36) NULL,
    `is_tax_relevant` BOOLEAN NOT NULL DEFAULT false,
    `attachment_url` VARCHAR(512) NULL,
    `tags` JSON NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `transactions_wallet_id_date_idx`(`wallet_id`, `date` DESC),
    INDEX `transactions_user_id_date_idx`(`user_id`, `date` DESC),
    INDEX `transactions_user_id_category_idx`(`user_id`, `category`),
    INDEX `transactions_wallet_id_type_idx`(`wallet_id`, `type`),
    INDEX `transactions_reference_id_idx`(`reference_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `context` ENUM('business', 'property', 'investment', 'vault', 'personal', 'other') NOT NULL DEFAULT 'other',
    `business_id` VARCHAR(191) NULL,
    `property_id` VARCHAR(191) NULL,
    `tenant_id` VARCHAR(191) NULL,
    `vault_id` VARCHAR(191) NULL,
    `name` VARCHAR(200) NOT NULL,
    `file_url` VARCHAR(1024) NOT NULL,
    `thumbnail_url` VARCHAR(1024) NULL,
    `mime_type` VARCHAR(100) NULL,
    `size_bytes` INTEGER NULL,
    `type` ENUM('pdf', 'image', 'doc', 'spreadsheet', 'video', 'audio', 'other') NOT NULL DEFAULT 'other',
    `category` VARCHAR(80) NULL,
    `tags` JSON NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT true,
    `ai_summary` TEXT NULL,
    `ai_keywords` JSON NULL,
    `expires_at` DATETIME(3) NULL,
    `cloud_public_id` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `documents_user_id_context_idx`(`user_id`, `context`),
    INDEX `documents_business_id_idx`(`business_id`),
    INDEX `documents_property_id_idx`(`property_id`),
    INDEX `documents_user_id_expires_at_idx`(`user_id`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alerts` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('invoice_due', 'invoice_overdue', 'expense_budget', 'payment_reminder', 'rent_due', 'rent_overdue', 'lease_expiry', 'document_expiry', 'maintenance_due', 'mortgage_payment', 'insurance_renewal', 'tax_deadline', 'value_change', 'stop_loss', 'take_profit', 'security', 'account', 'custom') NOT NULL,
    `priority` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    `status` ENUM('pending', 'seen', 'completed', 'dismissed', 'snoozed') NOT NULL DEFAULT 'pending',
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `property_id` VARCHAR(191) NULL,
    `business_id` VARCHAR(36) NULL,
    `investment_id` VARCHAR(36) NULL,
    `scheduled_for` DATETIME(3) NULL,
    `snoozed_until` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `source_table` VARCHAR(50) NULL,
    `source_id` VARCHAR(36) NULL,
    `auto_generated` BOOLEAN NOT NULL DEFAULT false,
    `email_sent_at` DATETIME(3) NULL,
    `push_sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `alerts_user_id_status_priority_idx`(`user_id`, `status`, `priority` DESC),
    INDEX `alerts_user_id_scheduled_for_idx`(`user_id`, `scheduled_for`),
    INDEX `alerts_user_id_type_status_idx`(`user_id`, `type`, `status`),
    INDEX `alerts_property_id_idx`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vaults` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'archived', 'locked') NOT NULL DEFAULT 'active',
    `color` VARCHAR(10) NULL,
    `icon` VARCHAR(50) NULL,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vaults_user_id_status_idx`(`user_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vault_members` (
    `id` VARCHAR(191) NOT NULL,
    `vault_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vault_members_vault_id_user_id_key`(`vault_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_records` ADD CONSTRAINT `rent_records_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_records` ADD CONSTRAINT `rent_records_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent_records` ADD CONSTRAINT `rent_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investments` ADD CONSTRAINT `investments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_vault_id_fkey` FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vaults` ADD CONSTRAINT `vaults_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vault_members` ADD CONSTRAINT `vault_members_vault_id_fkey` FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vault_members` ADD CONSTRAINT `vault_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
