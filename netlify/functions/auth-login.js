const { connectToDatabase } = require('./utils/db');
const { generateToken } = require('./utils/jwt');
const User = require('./models/User');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    console.log('Auth-login: Starting login attempt');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const { email, password } = JSON.parse(event.body);
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('No user found with email:', email);
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Account is inactive' })
      };
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Check app permission for WMS Questionnaire
    if (!user.hasAppAccess('wms-questionnaire')) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Access denied to WMS Questionnaire application' })
      };
    }

    user.lastLogin = new Date();
    await user.save();

    // Use shared token generation
    const token = generateToken(user);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        user: { 
          id: user._id, 
          email: user.email, 
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.fullName, // Virtual field
          role: user.role,
          appPermissions: user.appPermissions
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Server error', error: error.message })
    };
  }
};

