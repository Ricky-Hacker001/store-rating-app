-- Users Table: Stores all user types
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store a hashed password
    address TEXT,
    role ENUM('admin', 'user', 'store_owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stores Table: Stores information about each store
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT, -- Can be NULL if admin creates a store without assigning an owner initially
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ratings Table: Connects users and stores with a rating value
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store_rating (user_id, store_id) -- Ensures a user can rate a store only once
);

INSERT INTO stores (name, email, address) VALUES
('Green Valley Grocers', 'contact@gvgrocers.com', '123 Market St, Pleasantville'),
('The Book Nook', 'info@thebooknook.com', '456 Library Ln, Readington'),
('Tech Gadget Hub', 'support@techgadgethub.com', '789 Silicon Ave, Tech City');

-- UPDATE users SET role = 'admin' WHERE id = 1;
