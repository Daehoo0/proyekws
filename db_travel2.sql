CREATE DATABASE IF NOT EXISTS db_travel2;

USE db_travel2;

CREATE TABLE users (
    user_id VARCHAR(255) NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('traveler', 'guide', 'organizer') NOT NULL,
    balance INT DEFAULT 0, 
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE traveler_profiles (
    profile_id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    travel_time DATETIME NOT NULL,
    interests TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE guides (
    guide_id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    experience TEXT,
    rate DECIMAL(15, 2) NOT NULL,
    photo VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE events (
    event_id VARCHAR(255) NOT NULL PRIMARY KEY,
    organizer_id VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    event_time DATETIME NOT NULL,
    description TEXT,
    balance INT DEFAULT 0, 
    photo VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE event_participants (
    participant_id VARCHAR(255) NOT NULL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE guide_requests (
    request_id VARCHAR(255) NOT NULL PRIMARY KEY,
    traveler_id VARCHAR(255) NOT NULL,
    guide_id VARCHAR(255) NOT NULL,
    request_date DATETIME NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (traveler_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    guide_id VARCHAR(255),
    event_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

INSERT INTO users (user_id, username, password, email, role, balance, createdAt, updatedAt) VALUES 
('UID001', 'traveler1', '$2b$10$hashpassword', 'traveler1@example.com', 'traveler', 100, NOW(), NOW()),
('UID002', 'guide1', '$2b$10$hashpassword', 'guide1@example.com', 'guide', 0, NOW(), NOW()),
('UID003', 'organizer1', '$2b$10$hashpassword', 'organizer1@example.com', 'organizer', 0, NOW(), NOW());

INSERT INTO traveler_profiles (profile_id, user_id, destination, travel_time, interests, createdAt, updatedAt) VALUES 
('TP001', 'UID001', 'Bali', '2024-07-01 00:00:00', 'Beaches, Culture', NOW(), NOW());

INSERT INTO guides (guide_id, user_id, location, experience, rate, photo, createdAt, updatedAt) VALUES 
('G001', 'UID002', 'Bali', '5 years experience as a local guide', 100.00, 'guide1.jpg', NOW(), NOW());

INSERT INTO events (event_id, organizer_id, event_name, category, location, event_time, description, photo, createdAt, updatedAt) VALUES 
('E001', 'UID003', 'Beach Party', 'Party', 'Bali', '2024-07-05 18:00:00', 'Join us for a fun beach party!', 'beach_party.jpg', NOW(), NOW());

INSERT INTO event_participants (participant_id, event_id, user_id, createdAt, updatedAt) VALUES 
('EP001', 'E001', 'UID001', NOW(), NOW());

INSERT INTO guide_requests (request_id, traveler_id, guide_id, request_date, message, status, createdAt, updatedAt) VALUES 
('GR001', 'UID001', 'G001', '2024-07-02 00:00:00', 'Looking for a guide in Bali', 'pending', NOW(), NOW());

INSERT INTO reviews (review_id, user_id, rating, review, createdAt, updatedAt) VALUES 
('R001', 'UID001', 5, 'Great experience with the guide!', NOW(), NOW());

INSERT INTO payments (payment_id, user_id, amount, payment_date, guide_id, event_id) VALUES 
('P001', 'UID001', 100, NOW(), 'G001', NULL),
('P002', 'UID001', 50, NOW(), NULL, 'E001');
