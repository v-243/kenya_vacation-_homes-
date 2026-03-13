const { query } = require('../db');

class Video {
  constructor(data) {
    this.id = data.id;
    this.filename = data.filename;
    this.original_name = data.original_name;
    this.path = data.path;
    this.size = data.size;
    this.mimetype = data.mimetype;
    this.uploaded_at = data.uploaded_at;
  }

  static async create(videoData) {
    const [result] = await query(
      'INSERT INTO advertisement_videos (filename, original_name, path, size, mimetype) VALUES (?, ?, ?, ?, ?)',
      [videoData.filename, videoData.original_name, videoData.path, videoData.size, videoData.mimetype]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await query('SELECT * FROM advertisement_videos ORDER BY uploaded_at DESC');
    return rows.map(row => new Video(row));
  }

  static async deleteById(id) {
    await query('DELETE FROM advertisement_videos WHERE id = ?', [id]);
  }

  static async deleteByFilename(filename) {
    await query('DELETE FROM advertisement_videos WHERE filename = ?', [filename]);
  }
}

module.exports = Video;
