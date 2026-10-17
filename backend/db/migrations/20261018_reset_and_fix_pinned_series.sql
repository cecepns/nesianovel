-- ==============================================================================
-- Migration: 20261018_reset_and_fix_pinned_series.sql
-- Description:
--   1. Reset is_pinned dan is_project ke 0 agar data legacy lama tidak memenuhi PINNED SERIES
--   2. Memastikan index idx_manga_is_pinned terpasang untuk kecepatan query PINNED SERIES
-- ==============================================================================

-- 1. Reset seluruh is_pinned & is_project ke 0
--    (Di database lama KomikNesia, ribuan judul terisi is_project = 1 sehingga ikut ter-pin).
--    Setelah query ini dijalankan, PINNED SERIES di homepage hanya menampilkan novel yang di-centang Admin.
UPDATE manga SET is_pinned = 0, is_project = 0;

-- 2. Tambahkan Index untuk kolom is_pinned jika belum ada
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;
DELIMITER $$
CREATE PROCEDURE AddIndexIfNotExists(
    IN tableName VARCHAR(64),
    IN indexName VARCHAR(64),
    IN columnList VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = tableName
          AND INDEX_NAME = indexName
    ) THEN
        SET @sql = CONCAT('CREATE INDEX `', indexName, '` ON `', tableName, '` (', columnList, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

CALL AddIndexIfNotExists('manga', 'idx_manga_is_pinned', 'is_pinned');

DROP PROCEDURE IF EXISTS AddIndexIfNotExists;
