import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream('package.json'), { filename: 'test.pdf', contentType: 'application/pdf' });
  
  try {
    const res = await fetch('http://localhost:41029/api/documents/analyze', {
      method: 'POST',
      body: form
    });
    
    const data = await res.text();
    console.log(res.status, data);
  } catch (err) {
    console.error(err);
  }
}
test();
