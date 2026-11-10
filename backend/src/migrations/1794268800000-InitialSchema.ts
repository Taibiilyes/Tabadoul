import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * المخطط الأولي لقاعدة البيانات.
 *
 * نستخدم VARCHAR مع قيود CHECK بدل أنواع PostgreSQL enum حتى تبقى الـ migrations
 * قابلة للتوسّع بسهولة. قيم القيود مطابقة تمامًا للـ enums المعرّفة في الكيانات.
 * جدول wallet_transactions محمي أيضًا بمُحفِّز على مستوى قاعدة البيانات ليكون
 * سجلًا محاسبيًا للإضافة فقط (append-only).
 */
export class InitialSchema1794268800000 implements MigrationInterface {
  name = 'InitialSchema1794268800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "phoneNumber" character varying,
        "email" character varying,
        "passwordHash" character varying NOT NULL,
        "gender" character varying NOT NULL,
        "dateOfBirth" date,
        "firstName" character varying,
        "lastName" character varying,
        "verificationStatus" character varying NOT NULL DEFAULT 'unverified',
        "role" character varying NOT NULL DEFAULT 'user',
        "coinBalance" integer NOT NULL DEFAULT 0,
        "freeCallUsed" boolean NOT NULL DEFAULT false,
        "isBanned" boolean NOT NULL DEFAULT false,
        "banReason" character varying,
        "knownIps" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_phoneNumber" UNIQUE ("phoneNumber"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_users_identifier" CHECK ("phoneNumber" IS NOT NULL OR "email" IS NOT NULL),
        CONSTRAINT "CHK_users_gender" CHECK ("gender" IN ('male', 'female')),
        CONSTRAINT "CHK_users_verificationStatus" CHECK ("verificationStatus" IN ('unverified', 'pending', 'verified', 'rejected')),
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('user', 'admin')),
        CONSTRAINT "CHK_users_coinBalance" CHECK ("coinBalance" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "kyc_documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "storageKey" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "extractedFullName" character varying,
        "extractedDateOfBirth" date,
        "reviewedByAdminId" character varying,
        "rejectionReason" character varying,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "reviewedAt" timestamp,
        CONSTRAINT "PK_kyc_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kyc_documents_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_kyc_documents_type" CHECK ("type" IN ('national_id', 'passport', 'live_selfie')),
        CONSTRAINT "CHK_kyc_documents_status" CHECK ("status" IN ('pending', 'approved', 'rejected'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "amount" integer NOT NULL,
        "balanceAfter" integer NOT NULL,
        "referenceId" character varying,
        "note" character varying,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallet_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wallet_transactions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_wallet_transactions_type" CHECK ("type" IN ('signup_bonus', 'purchase', 'call_cost', 'room_creation', 'admin_adjustment')),
        CONSTRAINT "CHK_wallet_transactions_balanceAfter" CHECK ("balanceAfter" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ownerId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "creationCost" integer NOT NULL DEFAULT 100,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "closedAt" timestamp,
        CONSTRAINT "PK_rooms" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rooms_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_rooms_status" CHECK ("status" IN ('active', 'closed', 'banned'))
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_userId" ON "kyc_documents" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_userId" ON "wallet_transactions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_ownerId" ON "rooms" ("ownerId")`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION tabadul_prevent_wallet_ledger_mutation()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'wallet_transactions is append-only: UPDATE and DELETE are forbidden';
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "wallet_transactions_append_only"
      BEFORE UPDATE OR DELETE ON "wallet_transactions"
      FOR EACH ROW EXECUTE FUNCTION tabadul_prevent_wallet_ledger_mutation()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS "wallet_transactions_append_only" ON "wallet_transactions"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS tabadul_prevent_wallet_ledger_mutation()`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kyc_documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    // نترك إضافة pgcrypto لأنها قد تكون مشتركة مع جداول أو خدمات أخرى.
  }
}
