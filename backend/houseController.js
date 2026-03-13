const db = require('./db');

// @desc    Get all houses
// @route   GET /api/houses
// @access  Public
const getHouses = async (req, res) => {
  try {
    const connection = db.getConnection();
    const [rows] = await connection.query('SELECT id, name, location, price, beds, baths, imageUrl, description FROM houses');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a house
// @route   POST /api/houses
// @access  Private
const addHouse = async (req, res) => {
  const {
    name,
    location,
    price,
    beds,
    baths,
    imageUrl,
    description,
  } = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: 'House name is required and must be a non-empty string.' });
  }

  if (!location || typeof location !== 'string' || location.trim() === '') {
    return res.status(400).json({ message: 'Location is required and must be a non-empty string.' });
  }

  if (price === undefined || price === null || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ message: 'Price is required and must be a positive number.' });
  }

  if (beds === undefined || beds === null || typeof beds !== 'number' || beds < 0) {
    return res.status(400).json({ message: 'Beds is required and must be a non-negative number.' });
  }

  if (baths === undefined || baths === null || typeof baths !== 'number' || baths < 0) {
    return res.status(400).json({ message: 'Baths is required and must be a non-negative number.' });
  }

  // Validate that imageUrl is a non-empty string (either a filename or absolute URL)
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return res.status(400).json({ message: 'Image URL is required and must be a non-empty string (filename or URL).' });
  }

  try {
    const connection = db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO houses (name, location, price, beds, baths, imageUrl, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, location, price, beds, baths, imageUrl, description]
    );
    res.status(201).json({
      message: 'House added successfully',
      houseId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a house
// @route   PUT /api/houses/:id
// @access  Admin
const updateHouse = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    location,
    price,
    beds,
    baths,
    imageUrl,
    description,
  } = req.body;

  // Validate at least one field is provided
  if (!name && !location && !price && !imageUrl && beds === undefined && baths === undefined && !description) {
    return res.status(400).json({ message: 'At least one field must be provided for update.' });
  }

  // Validate fields if provided
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ message: 'Name must be a non-empty string.' });
  }

  if (location !== undefined && (typeof location !== 'string' || location.trim() === '')) {
    return res.status(400).json({ message: 'Location must be a non-empty string.' });
  }

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ message: 'Price must be a positive number.' });
  }

  if (beds !== undefined && (typeof beds !== 'number' || beds < 0)) {
    return res.status(400).json({ message: 'Beds must be a non-negative number.' });
  }

  if (baths !== undefined && (typeof baths !== 'number' || baths < 0)) {
    return res.status(400).json({ message: 'Baths must be a non-negative number.' });
  }

  if (imageUrl !== undefined && (typeof imageUrl !== 'string' || imageUrl.trim() === '')) {
    return res.status(400).json({ message: 'Image URL must be a non-empty string.' });
  }

  try {
    const connection = db.getConnection();
    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (beds !== undefined) { updates.push('beds = ?'); params.push(beds); }
    if (baths !== undefined) { updates.push('baths = ?'); params.push(baths); }
    if (imageUrl !== undefined) { updates.push('imageUrl = ?'); params.push(imageUrl); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    params.push(id);

    const query = `UPDATE houses SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await connection.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'House not found.' });
    }

    res.json({ message: 'House updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a house
// @route   DELETE /api/houses/:id
// @access  Admin
const deleteHouse = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = db.getConnection();
    console.log(`Attempting to delete house with ID: ${id}`);

    // First, try to delete all bookings associated with this house
    try {
      console.log(`Attempting to delete bookings for house ID: ${id}`);
      await connection.query('DELETE FROM bookings WHERE house_id = ?', [id]);
      console.log(`Successfully deleted bookings for house ID: ${id}`);
    } catch (bookingError) {
      console.error(`Error deleting bookings for house ID ${id}:`, bookingError);
      // If the error is not about table not existing, re-throw
      if (!bookingError.message.includes('Table') && !bookingError.message.includes('doesn\'t exist')) {
        throw bookingError;
      }
      // Otherwise, continue - bookings table might not exist yet
      console.warn(`Bookings table might not exist or another non-critical error occurred for house ID ${id}. Continuing with house deletion.`);
    }

    // Then delete the house
    console.log(`Attempting to delete house with ID: ${id} from houses table`);
    const [result] = await connection.query('DELETE FROM houses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      console.log(`House with ID: ${id} not found.`);
      return res.status(404).json({ message: 'House not found.' });
    }

    console.log(`Successfully deleted house with ID: ${id}`);
    res.json({ message: 'House deleted successfully.' });
  } catch (error) {
    console.error(`Error in deleteHouse for ID ${id}:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getHouses,
  addHouse,
  updateHouse,
  deleteHouse,
};