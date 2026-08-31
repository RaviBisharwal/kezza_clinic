/**
 * Kezza Hair & Skin Clinic — Universal SQL Database Layer
 * ────────────────────────────────────────────────────────────────
 * Supports:
 *  1. MySQL (Production / GoDaddy / Cloud) via mysql2/promise when
 *     DATABASE_HOST or DATABASE_URL is configured in .env.
 *  2. SQLite (Local Development) via better-sqlite3 as high-performance
 *     fallback with zero-configuration needed.
 *
 * Security & Integrity:
 *  - Parameterized queries & prepared statements (prevents SQL injection).
 *  - Strict data normalization and column isolation.
 *  - Production indexes for fast searching and filtering.
 *  - Idempotency & duplicate submission protection.
 * ────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
const fs = require('fs');

let dbDriver = null; // 'mysql' | 'sqlite'
let sqliteDb = null;
let mysqlPool = null;

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, 'kezza-data.db');

// ─── SQL SCHEMA DEFINITIONS ──────────────────────────────────────────────────
const SQLITE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS consultations (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        consultation_id       TEXT UNIQUE NOT NULL,
        full_name             TEXT NOT NULL,
        age                   INTEGER NOT NULL,
        mobile_number         TEXT NOT NULL,
        patient_city          TEXT NOT NULL,
        clinic_location       TEXT NOT NULL,
        category              TEXT NOT NULL,
        consultation_type     TEXT DEFAULT 'General Consultation',
        treatment             TEXT NOT NULL,
        concern               TEXT,
        concern_duration      TEXT,
        preferred_date        TEXT,
        preferred_time        TEXT,
        consultation_date     TEXT NOT NULL DEFAULT (datetime('now')),
        specialist            TEXT,
        department            TEXT,
        whatsapp_number       TEXT,
        photo_url             TEXT,
        photo_analysis        TEXT,
        ai_category           TEXT,
        ai_possible_concern   TEXT,
        ai_confidence         REAL,
        status                TEXT DEFAULT 'NEW',
        source                TEXT DEFAULT 'WEBSITE_FORM',
        idempotency_key       TEXT,
        notes                 TEXT,
        created_at            TEXT DEFAULT (datetime('now')),
        updated_at            TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT NOT NULL,
        email         TEXT UNIQUE NOT NULL,
        phone         TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role          TEXT DEFAULT 'patient',
        created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS departments (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        department_key  TEXT UNIQUE NOT NULL,
        department_name TEXT NOT NULL,
        whatsapp_number TEXT NOT NULL,
        default_doctor  TEXT
    );

    CREATE TABLE IF NOT EXISTS doctors (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT NOT NULL,
        department_key TEXT NOT NULL,
        specialization TEXT,
        location       TEXT,
        phone          TEXT,
        is_active      INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_consultations_mobile ON consultations(mobile_number);
    CREATE INDEX IF NOT EXISTS idx_consultations_city ON consultations(patient_city);
    CREATE INDEX IF NOT EXISTS idx_consultations_clinic ON consultations(clinic_location);
    CREATE INDEX IF NOT EXISTS idx_consultations_category ON consultations(category);
    CREATE INDEX IF NOT EXISTS idx_consultations_treatment ON consultations(treatment);
    CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
    CREATE INDEX IF NOT EXISTS idx_consultations_pref_date ON consultations(preferred_date);
    CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at);
    CREATE INDEX IF NOT EXISTS idx_consultations_idempotency ON consultations(idempotency_key);
`;

const MYSQL_SCHEMA_TABLES = [
    `CREATE TABLE IF NOT EXISTS consultations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        consultation_id VARCHAR(64) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        mobile_number VARCHAR(20) NOT NULL,
        patient_city VARCHAR(100) NOT NULL,
        clinic_location VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        consultation_type VARCHAR(50) DEFAULT 'General Consultation',
        treatment VARCHAR(150) NOT NULL,
        concern TEXT,
        concern_duration VARCHAR(100),
        preferred_date VARCHAR(50),
        preferred_time VARCHAR(50),
        consultation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        specialist VARCHAR(150),
        department VARCHAR(50),
        whatsapp_number VARCHAR(20),
        photo_url VARCHAR(255),
        photo_analysis JSON,
        ai_category VARCHAR(50),
        ai_possible_concern TEXT,
        ai_confidence FLOAT,
        status VARCHAR(30) DEFAULT 'NEW',
        source VARCHAR(50) DEFAULT 'WEBSITE_FORM',
        idempotency_key VARCHAR(128),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_consultations_mobile (mobile_number),
        INDEX idx_consultations_city (patient_city),
        INDEX idx_consultations_clinic (clinic_location),
        INDEX idx_consultations_category (category),
        INDEX idx_consultations_treatment (treatment),
        INDEX idx_consultations_status (status),
        INDEX idx_consultations_pref_date (preferred_date),
        INDEX idx_consultations_created (created_at),
        INDEX idx_consultations_idempotency (idempotency_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) DEFAULT 'patient',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        department_key VARCHAR(50) UNIQUE NOT NULL,
        department_name VARCHAR(100) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        default_doctor VARCHAR(150)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        department_key VARCHAR(50) NOT NULL,
        specialization VARCHAR(150),
        location VARCHAR(100),
        phone VARCHAR(20),
        is_active TINYINT DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

// Seed reference data
const SEED_DEPARTMENTS = [
    { key: 'HAIR_LOSS', name: 'Hair Loss & Restoration', phone: '919216063681', doctor: 'Dr. Ankit Bhalothia' },
    { key: 'HAIR_TRANSPLANT', name: 'Hair Transplant (Elite Surgical)', phone: '918130888129', doctor: 'Elite Surgical Team' },
    { key: 'SKIN', name: 'Skin & Aesthetics', phone: '919216063686', doctor: 'Dr. Amrita Makhija / Dr. Neelam Choudhary' },
    { key: 'ANTI_AGING', name: 'Anti-Aging & Injectables', phone: '919216063686', doctor: 'Dr. Amrita Makhija' },
    { key: 'PMU', name: 'Permanent Makeup (PMU)', phone: '919079161300', doctor: 'Dr. Krishna Choudhary' },
    { key: 'SMP', name: 'Scalp Micropigmentation', phone: '919079161300', doctor: 'Kezza SMP Team' },
    { key: 'WEIGHT_LOSS', name: 'Weight Loss & Slimming', phone: '919057546221', doctor: 'Kezza Wellness Team' },
    { key: 'FACIAL_AESTHETICS', name: 'Facial Aesthetics & Surgery', phone: '918130888129', doctor: 'Dr. Dhiral Vijayvargiya' },
    { key: 'ENT_RHINOPLASTY', name: 'ENT & Rhinoplasty', phone: '919284517427', doctor: 'Dr. Mandhata Sharma' }
];

// ─── INITIALIZATION ─────────────────────────────────────────────────────────
async function initDatabase() {
    // Check if MySQL is configured via environment variables
    const mysqlHost = process.env.DATABASE_HOST || process.env.DB_HOST;
    const mysqlName = process.env.DATABASE_NAME || process.env.DB_NAME;

    if (mysqlHost && mysqlName) {
        try {
            const mysql = require('mysql2/promise');
            mysqlPool = mysql.createPool({
                host:            mysqlHost,
                port:            parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '3306', 10),
                user:            process.env.DATABASE_USER || process.env.DB_USER || 'root',
                password:        process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
                database:        mysqlName,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit:      0,
                ssl:             process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
            });

            // Verify connection
            const conn = await mysqlPool.getConnection();
            conn.release();

            // Run table migrations
            for (const query of MYSQL_SCHEMA_TABLES) {
                await mysqlPool.query(query);
            }

            // Seed departments
            for (const dept of SEED_DEPARTMENTS) {
                await mysqlPool.query(
                    `INSERT IGNORE INTO departments (department_key, department_name, whatsapp_number, default_doctor) VALUES (?, ?, ?, ?)`,
                    [dept.key, dept.name, dept.phone, dept.doctor]
                );
            }

            dbDriver = 'mysql';
            console.log(`[Database] Connected to MySQL (${mysqlHost}/${mysqlName})`);
            return { driver: 'mysql' };
        } catch (err) {
            console.warn(`[Database] MySQL connection failed (${err.message}). Falling back to SQLite...`);
        }
    }

    // Fallback to SQLite (Local / Zero-Config)
    try {
        const Database = require('better-sqlite3');
        sqliteDb = new Database(DB_PATH);
        sqliteDb.pragma('journal_mode = WAL');
        sqliteDb.pragma('foreign_keys = ON');

        sqliteDb.exec(SQLITE_SCHEMA);

        // Seed departments in SQLite
        const insertDept = sqliteDb.prepare(`
            INSERT OR IGNORE INTO departments (department_key, department_name, whatsapp_number, default_doctor)
            VALUES (?, ?, ?, ?)
        `);
        for (const dept of SEED_DEPARTMENTS) {
            insertDept.run(dept.key, dept.name, dept.phone, dept.doctor);
        }

        dbDriver = 'sqlite';
        console.log(`[Database] Connected to SQLite (${DB_PATH})`);
        return { driver: 'sqlite', path: DB_PATH };
    } catch (err) {
        console.error('[Database] Fatal: Failed to initialize SQLite database:', err);
        throw err;
    }
}

// ─── QUERY HELPERS ──────────────────────────────────────────────────────────

/**
 * Inserts a new consultation record into SQL with duplicate protection.
 */
async function insertConsultation(data) {
    const consultationDate = data.consultation_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const photoAnalysisStr = typeof data.photo_analysis === 'object'
        ? JSON.stringify(data.photo_analysis)
        : (data.photo_analysis || null);

    if (dbDriver === 'mysql' && mysqlPool) {
        const [result] = await mysqlPool.query(`
            INSERT INTO consultations (
                consultation_id, full_name, age, mobile_number, patient_city,
                clinic_location, category, consultation_type, treatment,
                concern, concern_duration, preferred_date, preferred_time,
                consultation_date, specialist, department, whatsapp_number,
                photo_url, photo_analysis, ai_category, ai_possible_concern,
                ai_confidence, status, source, idempotency_key, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.consultation_id,
            data.full_name,
            data.age,
            data.mobile_number,
            data.patient_city,
            data.clinic_location,
            data.category,
            data.consultation_type || 'General Consultation',
            data.treatment,
            data.concern || null,
            data.concern_duration || null,
            data.preferred_date || null,
            data.preferred_time || null,
            consultationDate,
            data.specialist || null,
            data.department || null,
            data.whatsapp_number || null,
            data.photo_url || null,
            photoAnalysisStr,
            data.ai_category || null,
            data.ai_possible_concern || null,
            data.ai_confidence || null,
            data.status || 'NEW',
            data.source || 'WEBSITE_FORM',
            data.idempotency_key || null,
            data.notes || null
        ]);
        return { id: result.insertId, consultation_id: data.consultation_id };
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        const stmt = sqliteDb.prepare(`
            INSERT INTO consultations (
                consultation_id, full_name, age, mobile_number, patient_city,
                clinic_location, category, consultation_type, treatment,
                concern, concern_duration, preferred_date, preferred_time,
                consultation_date, specialist, department, whatsapp_number,
                photo_url, photo_analysis, ai_category, ai_possible_concern,
                ai_confidence, status, source, idempotency_key, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            data.consultation_id,
            data.full_name,
            data.age,
            data.mobile_number,
            data.patient_city,
            data.clinic_location,
            data.category,
            data.consultation_type || 'General Consultation',
            data.treatment,
            data.concern || null,
            data.concern_duration || null,
            data.preferred_date || null,
            data.preferred_time || null,
            consultationDate,
            data.specialist || null,
            data.department || null,
            data.whatsapp_number || null,
            data.photo_url || null,
            photoAnalysisStr,
            data.ai_category || null,
            data.ai_possible_concern || null,
            data.ai_confidence || null,
            data.status || 'NEW',
            data.source || 'WEBSITE_FORM',
            data.idempotency_key || null,
            data.notes || null
        );
        return { id: info.lastInsertRowid, consultation_id: data.consultation_id };
    }

    throw new Error('Database not initialized');
}

/**
 * Check if a duplicate submission exists by idempotency key.
 */
async function findDuplicateConsultation(idempotencyKey) {
    if (!idempotencyKey) return null;

    if (dbDriver === 'mysql' && mysqlPool) {
        const [rows] = await mysqlPool.query(
            `SELECT * FROM consultations WHERE idempotency_key = ? ORDER BY id DESC LIMIT 1`,
            [idempotencyKey]
        );
        return rows[0] || null;
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        const row = sqliteDb.prepare(
            `SELECT * FROM consultations WHERE idempotency_key = ? ORDER BY id DESC LIMIT 1`
        ).get(idempotencyKey);
        return row || null;
    }

    return null;
}

/**
 * Retrieves a single consultation by ID or consultation_id.
 */
async function getConsultationById(idOrCode) {
    if (dbDriver === 'mysql' && mysqlPool) {
        const [rows] = await mysqlPool.query(
            `SELECT * FROM consultations WHERE consultation_id = ? OR id = ? LIMIT 1`,
            [idOrCode, isNaN(idOrCode) ? -1 : parseInt(idOrCode, 10)]
        );
        return rows[0] || null;
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        return sqliteDb.prepare(
            `SELECT * FROM consultations WHERE consultation_id = ? OR id = ? LIMIT 1`
        ).get(idOrCode, isNaN(idOrCode) ? -1 : parseInt(idOrCode, 10)) || null;
    }

    return null;
}

/**
 * Lists consultations with flexible filtering.
 */
async function listConsultations(filters = {}) {
    const {
        clinic,
        category,
        status,
        search,
        startDate,
        endDate,
        limit = 100,
        offset = 0
    } = filters;

    let whereClause = [];
    let params = [];

    if (clinic && clinic !== 'ALL') {
        whereClause.push('LOWER(clinic_location) = LOWER(?)');
        params.push(clinic);
    }
    if (category && category !== 'ALL') {
        whereClause.push('LOWER(category) = LOWER(?)');
        params.push(category);
    }
    if (status && status !== 'ALL') {
        whereClause.push('status = ?');
        params.push(status);
    }
    if (startDate) {
        whereClause.push('DATE(created_at) >= ?');
        params.push(startDate);
    }
    if (endDate) {
        whereClause.push('DATE(created_at) <= ?');
        params.push(endDate);
    }
    if (search) {
        const term = `%${search}%`;
        whereClause.push('(full_name LIKE ? OR mobile_number LIKE ? OR consultation_id LIKE ? OR patient_city LIKE ? OR treatment LIKE ?)');
        params.push(term, term, term, term, term);
    }

    const whereStr = whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : '';

    if (dbDriver === 'mysql' && mysqlPool) {
        const [rows] = await mysqlPool.query(
            `SELECT * FROM consultations ${whereStr} ORDER BY id DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit, 10), parseInt(offset, 10)]
        );
        const [countRows] = await mysqlPool.query(
            `SELECT COUNT(*) as total FROM consultations ${whereStr}`,
            params
        );
        return { records: rows, total: countRows[0]?.total || 0 };
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        const records = sqliteDb.prepare(
            `SELECT * FROM consultations ${whereStr} ORDER BY id DESC LIMIT ? OFFSET ?`
        ).all(...params, parseInt(limit, 10), parseInt(offset, 10));

        const totalRow = sqliteDb.prepare(
            `SELECT COUNT(*) as total FROM consultations ${whereStr}`
        ).get(...params);

        return { records, total: totalRow?.total || 0 };
    }

    return { records: [], total: 0 };
}

/**
 * Updates status and clinical notes of a consultation.
 */
async function updateConsultationStatus(idOrCode, status, notes = null) {
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (dbDriver === 'mysql' && mysqlPool) {
        let query = `UPDATE consultations SET status = ?, updated_at = ?`;
        let params = [status, updatedAt];
        if (notes !== null) {
            query += `, notes = ?`;
            params.push(notes);
        }
        query += ` WHERE consultation_id = ? OR id = ?`;
        params.push(idOrCode, isNaN(idOrCode) ? -1 : parseInt(idOrCode, 10));

        const [result] = await mysqlPool.query(query, params);
        return result.affectedRows > 0;
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        let query = `UPDATE consultations SET status = ?, updated_at = ?`;
        let params = [status, updatedAt];
        if (notes !== null) {
            query += `, notes = ?`;
            params.push(notes);
        }
        query += ` WHERE consultation_id = ? OR id = ?`;
        params.push(idOrCode, isNaN(idOrCode) ? -1 : parseInt(idOrCode, 10));

        const info = sqliteDb.prepare(query).run(...params);
        return info.changes > 0;
    }

    return false;
}

/**
 * Aggregates consultation dashboard statistics.
 */
async function getConsultationStats() {
    if (dbDriver === 'mysql' && mysqlPool) {
        const [totalRows] = await mysqlPool.query(`SELECT COUNT(*) as total FROM consultations`);
        const [todayRows] = await mysqlPool.query(`SELECT COUNT(*) as today FROM consultations WHERE DATE(created_at) = CURDATE()`);
        const [jaipurRows] = await mysqlPool.query(`SELECT COUNT(*) as jaipur FROM consultations WHERE LOWER(clinic_location) = 'jaipur'`);
        const [sikarRows] = await mysqlPool.query(`SELECT COUNT(*) as sikar FROM consultations WHERE LOWER(clinic_location) = 'sikar'`);
        const [newRows] = await mysqlPool.query(`SELECT COUNT(*) as new_count FROM consultations WHERE status = 'NEW'`);
        const [confirmedRows] = await mysqlPool.query(`SELECT COUNT(*) as confirmed FROM consultations WHERE status = 'CONFIRMED'`);

        return {
            total: totalRows[0]?.total || 0,
            today: todayRows[0]?.today || 0,
            jaipur: jaipurRows[0]?.jaipur || 0,
            sikar: sikarRows[0]?.sikar || 0,
            newCount: newRows[0]?.new_count || 0,
            confirmed: confirmedRows[0]?.confirmed || 0
        };
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        const total = sqliteDb.prepare(`SELECT COUNT(*) as count FROM consultations`).get()?.count || 0;
        const today = sqliteDb.prepare(`SELECT COUNT(*) as count FROM consultations WHERE DATE(created_at) = DATE('now')`).get()?.count || 0;
        const jaipur = sqliteDb.prepare(`SELECT COUNT(*) as count FROM consultations WHERE LOWER(clinic_location) = 'jaipur'`).get()?.count || 0;
        const sikar = sqliteDb.prepare(`SELECT COUNT(*) as count FROM consultations WHERE LOWER(clinic_location) = 'sikar'`).get()?.count || 0;
        const newCount = sqliteDb.prepare(`SELECT COUNT(*) as count FROM consultations WHERE status = 'NEW'`).get()?.count || 0;
        const confirmed = sqliteDb.prepare(`SELECT COUNT(*) as count FROM consultations WHERE status = 'CONFIRMED'`).get()?.count || 0;

        return { total, today, jaipur, sikar, newCount, confirmed };
    }

    return { total: 0, today: 0, jaipur: 0, sikar: 0, newCount: 0, confirmed: 0 };
}

/**
 * Retrieves user by email for admin authentication.
 */
async function getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (dbDriver === 'mysql' && mysqlPool) {
        const [rows] = await mysqlPool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [cleanEmail]);
        return rows[0] || null;
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        return sqliteDb.prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`).get(cleanEmail) || null;
    }

    return null;
}

/**
 * Creates or updates an admin user.
 */
async function ensureAdminUser(name, email, phone, passwordHash) {
    const cleanEmail = email.toLowerCase().trim();
    if (dbDriver === 'mysql' && mysqlPool) {
        await mysqlPool.query(`
            INSERT INTO users (name, email, phone, password_hash, role)
            VALUES (?, ?, ?, ?, 'admin')
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
        `, [name, cleanEmail, phone, passwordHash]);
        return;
    }

    if (dbDriver === 'sqlite' && sqliteDb) {
        const existing = sqliteDb.prepare(`SELECT id FROM users WHERE email = ?`).get(cleanEmail);
        if (existing) {
            sqliteDb.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`).run(passwordHash, cleanEmail);
        } else {
            sqliteDb.prepare(`
                INSERT INTO users (name, email, phone, password_hash, role)
                VALUES (?, ?, ?, ?, 'admin')
            `).run(name, cleanEmail, phone, passwordHash);
        }
    }
}

module.exports = {
    initDatabase,
    insertConsultation,
    findDuplicateConsultation,
    getConsultationById,
    listConsultations,
    updateConsultationStatus,
    getConsultationStats,
    getUserByEmail,
    ensureAdminUser,
    getDriver: () => dbDriver
};
