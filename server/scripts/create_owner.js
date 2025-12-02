require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

async function main(){
  const [,, username, password] = process.argv;
  if(!username || !password){
    console.error('Usage: node scripts/create_owner.js <username> <password>');
    process.exit(1);
  }

  const dbPath = path.join(__dirname, '..', 'data.db');
  const db = new sqlite3.Database(dbPath);

  db.serialize(async ()=>{
    db.get("SELECT * FROM users WHERE role = 'owner'", async (err, row) => {
      if(err) { console.error('DB error', err); process.exit(1); }
      if(row){
        console.log('Owner already exists:', row.username);
        process.exit(0);
      }
      const hash = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'owner'], function(e){
        if(e){ console.error('Insert error', e); process.exit(1); }
        const user = { id: this.lastID, username, role: 'owner' };
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
        console.log('Owner created:', user);
        console.log('Use this token to login (or via Login form):');
        console.log(token);
        process.exit(0);
      });
    });
  });
}

main();
