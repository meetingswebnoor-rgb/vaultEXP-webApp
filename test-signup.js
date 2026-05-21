const axios = require('axios');

async function run() {
  try {
    const signupRes = await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'Test Auth Me',
      email: 'testauthme' + Date.now() + '@example.com',
      password: 'Password123!'
    });
    console.log('SIGNUP SUCCESS:', signupRes.data.success);
    
    const token = signupRes.data.data.accessToken;
    
    // Now test /api/auth/me
    const meRes = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('AUTH ME SUCCESS:', meRes.data);
  } catch (err) {
    if (err.response) {
      console.log('ERROR:', err.response.data);
    } else {
      console.log('NETWORK ERROR:', err.message);
    }
  }
}

run();
