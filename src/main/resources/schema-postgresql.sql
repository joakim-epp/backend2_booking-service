-- Customer data moved to the customer service. A database created by Backend 1 still has the
-- customers table and a foreign key from bookings to it, which would reject every booking for a
-- customer id this database has never seen. Drop both. A fresh database has neither, and the
-- block does nothing.
DO $$
DECLARE
    fk record;
BEGIN
    IF to_regclass('bookings') IS NOT NULL AND to_regclass('customers') IS NOT NULL THEN
        FOR fk IN
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'bookings'::regclass AND confrelid = 'customers'::regclass
        LOOP
            EXECUTE format('ALTER TABLE bookings DROP CONSTRAINT %I', fk.conname);
        END LOOP;
        DROP TABLE customers;
    END IF;
END $$;;
