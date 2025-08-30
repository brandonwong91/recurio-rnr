-- Create the tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create the grocery_items table
CREATE TABLE grocery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER,
  done BOOLEAN DEFAULT FALSE,
  checked_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create the join table for the many-to-many relationship
CREATE TABLE grocery_item_tags (
  grocery_item_id INTEGER REFERENCES grocery_items(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (grocery_item_id, tag_id)
);