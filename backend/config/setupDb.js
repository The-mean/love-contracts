const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    try {
        // İlk bağlantı (veritabanı olmadan)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || ''
        });

        // Veritabanını oluştur
        await connection.query('DROP DATABASE IF EXISTS love_contracts');
        console.log('Eski veritabanı silindi');

        await connection.query('CREATE DATABASE love_contracts');
        console.log('Yeni veritabanı oluşturuldu');

        await connection.query('USE love_contracts');
        console.log('love_contracts veritabanı seçildi');

        // Users tablosunu oluştur
        await connection.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Users tablosu oluşturuldu');

        // Templates tablosunu oluştur
        await connection.query(`
            CREATE TABLE templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                description TEXT,
                category VARCHAR(50),
                is_public BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Templates tablosu oluşturuldu');

        // Örnek şablonları ekle
        await connection.query(`
            INSERT INTO templates (title, content, description, category) VALUES 
            (
                'Sadakat Sözleşmesi',
                'Madde 1: Partnerler birbirlerine sadık olacaklarını taahhüt ederler.\n\nMadde 2: Her iki taraf da ilişki dışında duygusal veya fiziksel yakınlık kurmayacaklarını kabul ederler.\n\nMadde 3: Taraflar birbirlerinin sosyal medya hesaplarına saygı gösterecek ve mahremiyete dikkat edeceklerdir.\n\nMadde 4: İlişkide şeffaflık esastır ve taraflar birbirlerine karşı dürüst olacaklarını taahhüt ederler.\n\nMadde 5: Bu sözleşmenin ihlali durumunda, taraflar birbirlerini anlayışla dinleyecek ve çözüm odaklı yaklaşacaklardır.',
                'Çiftler arasında sadakat ve güven temelli bir ilişki için temel kuralları belirleyen kapsamlı bir sözleşme şablonu',
                'relationship'
            ),
            (
                'Ortak Harcama Anlaşması',
                'Madde 1: Ortak Harcamalar\n- Ev kirası/mortgage ödemeleri\n- Faturalar (elektrik, su, doğalgaz, internet)\n- Market alışverişleri\n- Ortak kullanılan eşyalar\n\nMadde 2: Harcama Dağılımı\n- Taraflar ortak harcamaları gelirlerine orantılı olarak paylaşacaklardır\n- Her ayın başında ortak hesaba katkı payları yatırılacaktır\n\nMadde 3: Özel Harcamalar\n- Kişisel alışverişler\n- Bireysel hobiler\n- Kişisel bakım harcamaları\n\nMadde 4: Tasarruf Planı\n- Aylık ortak birikim hedefi\n- Acil durum fonu oluşturma',
                'Çiftler arasındaki finansal harcamaların yönetimi ve paylaşımı için detaylı bir anlaşma şablonu',
                'financial'
            ),
            (
                'Romantik Takvim',
                'Madde 1: Özel Günler\n- Yıldönümleri\n- Doğum günleri\n- Tanışma günü\n- Sevgililer günü\n\nMadde 2: Aylık Aktiviteler\n- En az bir romantik akşam yemeği\n- Bir hafta sonu gezisi\n- Film/dizi izleme gecesi\n\nMadde 3: Sürprizler ve Hediyeler\n- Özel günlerde hediyeleşme\n- Spontane sürprizler\n\nMadde 4: Ortak Hobiler\n- Birlikte yapılacak aktiviteler\n- Yeni deneyimler planlanması',
                'Özel günleri ve romantik aktiviteleri planlamak için oluşturulmuş detaylı bir takvim sözleşmesi',
                'activities'
            ),
            (
                'Tatil ve Seyahat Planı',
                'Madde 1: Yıllık Tatil Planlaması\n- Yılda en az bir uzun tatil (1 hafta veya daha fazla)\n- İki kısa hafta sonu kaçamağı\n\nMadde 2: Destinasyon Seçimi\n- Tarafların tercihlerinin dikkate alınması\n- Bütçe planlaması\n- Rezervasyonların ortaklaşa yapılması\n\nMadde 3: Tatil Bütçesi\n- Konaklama masrafları\n- Ulaşım giderleri\n- Aktivite ve yeme-içme bütçesi\n\nMadde 4: Sorumluluklar\n- Planlama ve organizasyon\n- Rezervasyonlar\n- Seyahat sigortası',
                'Çiftlerin tatil ve seyahat planlarını organize etmek için kapsamlı bir anlaşma şablonu',
                'travel'
            ),
            (
                'İlişki Sınırları ve Kurallar',
                'Madde 1: İletişim Kuralları\n- Düzenli iletişim sürdürme\n- Tartışma ve anlaşmazlık çözüm yöntemleri\n- Aktif dinleme ve empati\n\nMadde 2: Kişisel Alan ve Zaman\n- Bireysel aktiviteler için zaman\n- Arkadaşlarla vakit geçirme\n- Hobi ve ilgi alanlarına saygı\n\nMadde 3: Sosyal Medya Kullanımı\n- Paylaşım sınırları\n- Mahremiyet kuralları\n- Ortak fotoğraf paylaşım kriterleri\n\nMadde 4: Aile ve Arkadaş İlişkileri\n- Ailelerle görüşme sıklığı\n- Ortak arkadaş çevresi yönetimi\n- Özel günlerde katılım beklentileri',
                'İlişkideki temel kuralları, sınırları ve beklentileri belirleyen detaylı bir sözleşme şablonu',
                'boundaries'
            )
        `);
        console.log('Örnek şablonlar eklendi');

        // Contracts tablosunu oluştur
        await connection.query(`
            CREATE TABLE contracts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                user_id INT NOT NULL,
                partner_id INT,
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                partner_approval_status ENUM('pending', 'approved') DEFAULT 'pending',
                partner_email VARCHAR(255),
                approval_token VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Contracts tablosu oluşturuldu');

        // Comments tablosunu oluştur
        await connection.query(`
            CREATE TABLE comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content TEXT NOT NULL,
                user_id INT NOT NULL,
                contract_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Comments tablosu oluşturuldu');

        // Collaborations tablosunu oluştur
        await connection.query(`
            CREATE TABLE collaborations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                contract_id INT NOT NULL,
                user_id INT NOT NULL,
                invited_user_id INT NOT NULL,
                status ENUM('pending', 'accepted') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_collaboration (contract_id, user_id, invited_user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Collaborations tablosu oluşturuldu');

        // External Shares tablosunu oluştur
        await connection.query(`
            CREATE TABLE external_shares (
                id INT AUTO_INCREMENT PRIMARY KEY,
                contract_id INT NOT NULL,
                user_id INT NOT NULL,
                partner_email VARCHAR(255) NOT NULL,
                share_token VARCHAR(500) NOT NULL,
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_share (contract_id, partner_email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('External Shares tablosu oluşturuldu');

        // Referrals tablosunu oluştur
        await connection.query(`
            CREATE TABLE referrals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                referrer_id INT NOT NULL,
                referred_email VARCHAR(255) NOT NULL,
                status ENUM('pending', 'registered', 'paid') DEFAULT 'pending',
                referral_code VARCHAR(50) UNIQUE NOT NULL,
                reward_amount DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Referrals tablosu oluşturuldu');

        console.log('Veritabanı başarıyla kuruldu!');
    } catch (error) {
        console.error('Veritabanı kurulumu sırasında hata:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase(); 