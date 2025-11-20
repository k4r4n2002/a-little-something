const bcrypt = require('bcrypt');

const testBcrypt = async () => {
  const plainPassword = 'karan123';
  const storedHash = '$2b$10$veDV.S2TKCQM67ywNdyE7OOJfoByLYGXmw8/lcotsMU7MVTchXSgu';
  
  console.log('Testing bcrypt...');
  console.log('Plain password:', plainPassword);
  console.log('Stored hash:', storedHash);
  
  // Test 1: Generate a fresh hash and compare
  console.log('\n--- Test 1: Fresh hash ---');
  const newHash = await bcrypt.hash(plainPassword, 10);
  console.log('New hash:', newHash);
  const match1 = await bcrypt.compare(plainPassword, newHash);
  console.log('Fresh hash matches:', match1);
  
  // Test 2: Compare with stored hash
  console.log('\n--- Test 2: Stored hash ---');
  const match2 = await bcrypt.compare(plainPassword, storedHash);
  console.log('Stored hash matches:', match2);
  
  // Test 3: Try different variations
  console.log('\n--- Test 3: Different inputs ---');
  const variations = ['karan123', 'Karan123', 'karan123 ', ' karan123'];
  for (const variant of variations) {
    const match = await bcrypt.compare(variant, storedHash);
    console.log(`"${variant}" matches:`, match);
  }
  
  // Test 4: Check bcrypt version
  console.log('\n--- Test 4: Package info ---');
  console.log('bcrypt version:', require('bcrypt/package.json').version);
};

testBcrypt().catch(console.error);