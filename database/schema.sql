CREATE DATABASE IF NOT EXISTS arcade_game;
USE arcade_game;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pseudo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#FF6B6B',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    games_played INT DEFAULT 0,
    high_score INT DEFAULT 0,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_pseudo (pseudo)
);

CREATE TABLE game_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT DEFAULT 0,
    duration INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    total_playtime INT DEFAULT 0,
    average_score DECIMAL(10,2) DEFAULT 0,
    best_streak INT DEFAULT 0,
    achievements JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
