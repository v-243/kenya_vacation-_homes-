const { getConnection } = require('../db');

class Admin {
  constructor(data) {
    this.full_name = data.full_name;
    this.id_number = data.id_number;
    this.location = data.location;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.password = data.password;
    this.is_approved = data.is_approved || 0;
    this.approved_by = data.approved_by || null;
    this.approval_token = data.approval_token || null;
    this.created_at = data.created_at || new Date();
  }

  static async findOne(query) {
    const connection = getConnection();
    let sql = 'SELECT * FROM admins WHERE ';
    const values = [];
    const conditions = [];

    if (query.id) {
      conditions.push('id = ?');
      values.push(query.id);
    }

    if (query.email) {
      conditions.push('email = ?');
      values.push(query.email);
    }

    if (query.idNumber) {
      conditions.push('idNumber = ?');
      values.push(query.idNumber);
    }

    sql += conditions.join(' AND ');

    try {
      const [rows] = await connection.execute(sql, values);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async save() {
    const connection = getConnection();
    const sql = 'INSERT INTO admins (full_name, id_number, location, email, phone_number, password, is_approved, approved_by, approval_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
      this.full_name,
      this.id_number,
      this.location,
      this.email,
      this.phone_number,
      this.password,
      this.is_approved,
      this.approved_by,
      this.approval_token,
      this.created_at
    ];

    try {
      const [result] = await connection.execute(sql, values);
      this.id = result.insertId;
      return this;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Admin;
