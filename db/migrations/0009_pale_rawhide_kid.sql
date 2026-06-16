CREATE TABLE "product_bases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_user_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"sizes" text,
	"features" text,
	"colors" text,
	"image_url" text,
	"gallery_url" text,
	"product_url" text,
	"asin" text,
	"brand" text,
	"price" numeric(12, 2),
	"base_data" jsonb DEFAULT '{}'::jsonb,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "base_id" uuid;--> statement-breakpoint
ALTER TABLE "product_bases" ADD CONSTRAINT "product_bases_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bases" ADD CONSTRAINT "product_bases_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_bases_client_idx" ON "product_bases" USING btree ("client_user_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_base_id_product_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."product_bases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_base_idx" ON "products" USING btree ("base_id");