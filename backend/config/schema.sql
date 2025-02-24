DROP DATABASE IF EXISTS love_contracts;
CREATE DATABASE love_contracts;
USE love_contracts;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    partner_id INT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert example templates
INSERT INTO templates (title, description, content, category) VALUES
('Evlilik Sözleşmesi', 'Evlilik öncesi yapılacak anlaşma şablonu', 'Bu evlilik sözleşmesi [TARİH] tarihinde [EŞ1] ve [EŞ2] arasında yapılmıştır...', 'marriage'),
('Ev Arkadaşlığı Sözleşmesi', 'Ev arkadaşları arasında yapılacak anlaşma şablonu', 'Bu ev arkadaşlığı sözleşmesi [TARİH] tarihinde [KİŞİ1] ve [KİŞİ2] arasında yapılmıştır...', 'roommate'),
('İlişki Sözleşmesi', 'Çiftler arasında yapılacak anlaşma şablonu', 'Bu ilişki sözleşmesi [TARİH] tarihinde [TARAF1] ve [TARAF2] arasında yapılmıştır...', 'relationship'); 