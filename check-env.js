const fs = require('fs');
const path = require('path');

console.log('🔍 Checking .env.local file...\n');

try {
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  
  console.log('📁 File exists and readable');
  console.log('📏 File size:', content.length, 'characters');
  console.log('🔢 Number of lines:', content.split('\n').length);
  
  console.log('\n📋 File content:');
  console.log('---START OF FILE---');
  console.log(content);
  console.log('---END OF FILE---');
  
  console.log('\n🔍 Checking each line:');
  content.split('\n').forEach((line, index) => {
    if (line.trim()) {
      console.log(`Line ${index + 1}: "${line}"`);
      if (line.includes('=')) {
        const [key, value] = line.split('=');
        console.log(`  Key: "${key.trim()}"`);
        console.log(`  Value: "${value.trim()}"`);
      }
    }
  });
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}
