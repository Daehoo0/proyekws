CREATE DATABASE IF NOT EXISTS db_travel;

USE db_travel;

DROP TABLE IF EXISTS traveler_profiles;
DROP TABLE IF EXISTS guide_requests;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS guides;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id VARCHAR(255) DEFAULT NULL,
    username VARCHAR(255) DEFAULT NULL,
    name VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    role VARCHAR(255) DEFAULT NULL,
    balance INT(11) DEFAULT NULL,
    api_hit INT(11) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE traveler_profiles (
    traveler_id VARCHAR(255) DEFAULT NULL,
    user_id VARCHAR(255) DEFAULT NULL,
    destination VARCHAR(255) DEFAULT NULL,
    travel_time DATETIME DEFAULT NULL,
    interests TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (traveler_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE guides (
    guide_id VARCHAR(255) DEFAULT NULL,
    user_id VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    experience TEXT DEFAULT NULL,
    rate INT(11) DEFAULT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (guide_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE events (
    event_id VARCHAR(255) DEFAULT NULL,
    organizer_id VARCHAR(255) DEFAULT NULL,
    event_name VARCHAR(255) DEFAULT NULL,
    category VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    event_time DATETIME DEFAULT NULL,
    description TEXT DEFAULT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (event_id),
    FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE event_participants (
    event_participant_id VARCHAR(255) DEFAULT NULL,
    event_id VARCHAR(255) DEFAULT NULL,
    user_id VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (event_participant_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE guide_requests (
    request_id VARCHAR(255) DEFAULT NULL,
    traveler_id VARCHAR(255) DEFAULT NULL,
    guide_id VARCHAR(255) DEFAULT NULL,
    request_date DATETIME DEFAULT NULL,
    message TEXT DEFAULT NULL,
    status VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (request_id),
    FOREIGN KEY (traveler_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id VARCHAR(255) DEFAULT NULL,
    user_id VARCHAR(255) DEFAULT NULL,
    rating INT(11) DEFAULT NULL,
    review TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (review_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE rsvps (
    rsvp_id VARCHAR(255) DEFAULT NULL,
    user_id VARCHAR(255) DEFAULT NULL,
    event_id VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    PRIMARY KEY (rsvp_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

INSERT INTO users (user_id, username, name, password, email, role, balance, api_hit, created_at, update_at) VALUES 
('1', 'user1', 'John Doe', 'password1', 'john@example.com', 'traveler', 100, 0, NOW(), NOW()),
('2', 'user2', 'Jane Smith', 'password2', 'jane@example.com', 'organizer', 200, 0, NOW(), NOW()),
('3', 'user3', 'Mike Johnson', 'password3', 'mike@example.com', 'guide', 150, 0, NOW(), NOW());

INSERT INTO traveler_profiles (traveler_id, user_id, destination, travel_time, interests, created_at, update_at) VALUES 
('1', '1', 'Bali', '2024-07-01 00:00:00', 'Beaches, Culture', NOW(), NOW()),
('2', '2', 'Paris', '2024-08-01 00:00:00', 'Art, History', NOW(), NOW()),
('3', '3', 'Tokyo', '2024-09-01 00:00:00', 'Food, Technology', NOW(), NOW());

INSERT INTO guides (guide_id, user_id, location, experience, rate, photo, created_at, update_at) VALUES 
('1', '3', 'Bali', '5 years experience as a local guide', 100, 'guide1.jpg', NOW(), NOW()),
('2', '3', 'Paris', '3 years experience as a tour guide', 120, 'guide2.jpg', NOW(), NOW()),
('3', '3', 'Tokyo', 'Expert in navigating Tokyo', 150, 'guide3.jpg', NOW(), NOW());

INSERT INTO events (event_id, organizer_id, event_name, category, location, event_time, description, photo, created_at, update_at) VALUES 
('1', '2', 'Beach Party', 'Party', 'Bali', '2024-07-05 18:00:00', 'Join us for a fun beach party!', 'beach_party.jpg', NOW(), NOW()),
('2', '2', 'Art Exhibition', 'Art', 'Paris', '2024-08-10 10:00:00', 'Explore the finest artworks in Paris', 'art_exhibition.jpg', NOW(), NOW()),
('3', '2', 'Sushi Tasting', 'Food', 'Tokyo', '2024-09-15 12:00:00', 'Experience the best sushi in Tokyo', 'sushi_tasting.jpg', NOW(), NOW());

INSERT INTO guide_requests (request_id, traveler_id, guide_id, request_date, message, status, created_at, update_at) VALUES 
('1', '1', '1', '2024-07-02 00:00:00', 'Looking for a guide in Bali', 'pending', NOW(), NOW()),
('2', '1', '2', '2024-08-01 00:00:00', 'Interested in touring Paris', 'approved', NOW(), NOW()),
('3', '1', '3', '2024-09-01 00:00:00', 'Need assistance in Tokyo', 'pending', NOW(), NOW());

INSERT INTO reviews (review_id, user_id, rating, review, created_at, update_at) VALUES 
('1', '1', 5, 'Great experience with the guide!', NOW(), NOW()),
('2', '2', 4, 'Organized event, enjoyed it!', NOW(), NOW()),
('3', '3', 5, 'The participants were enthusiastic!', NOW(), NOW());

INSERT INTO rsvps (rsvp_id, user_id, event_id, created_at, update_at) VALUES 
('1', '1', '1', NOW(), NOW()),
('2', '2', '2', NOW(), NOW()),
('3', '3', '3', NOW(), NOW());

SELECT * FROM users;
SELECT * FROM traveler_profiles;
SELECT * FROM guides;
SELECT * FROM events;
SELECT * FROM guide_requests;
SELECT * FROM reviews;
SELECT * FROM rsvps;
