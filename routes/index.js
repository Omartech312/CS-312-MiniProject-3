// routes/index.js

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  user: 'sergior',
  host: 'localhost',
  database: 'BlogDB',
  password: 'password132',
  port: 5432,
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Home route to display all blog posts
router.get('/', async (req, res) => 
  {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY date_created DESC');
    res.render('index', { blogs: result.rows, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.send('Error retrieving blog posts');
  }
});

// Routes for user registration
router.get('/register', (req, res) => 
  {
  res.render('signup');
});

router.post('/register', async (req, res) => {
  const { name, password } = req.body;

  try 
  {
    const result = await pool.query('SELECT NOW()'); 
    console.log('Database connection works:', result.rows[0]);
    res.send('Database connection works');
  } catch (err) 
  {
    console.error('Error registering user:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).send('Error registering user');
  }
});



// Routes for user login
router.get('/login', (req, res) => 
  {
  res.render('login');
});

router.post('/login', async (req, res) => 
  {
  const { name, password } = req.body;

  try 
  {
    const result = await pool.query(
      'SELECT * FROM users WHERE name = $1 AND password = $2',
      [name, password]
    );

    if (result.rows.length > 0) 
      {
      // User authenticated successfully
      req.session.user = {
        id: result.rows[0].user_id,
        name: result.rows[0].name
      };
      res.redirect('/');
    } else 
    {
      res.send('Invalid name or password');
    }
  } catch (err) {
    console.error(err);
    res.send('Error logging in');
  }
});

// Route for user logout
router.get('/logout', (req, res) => 
  {
  req.session.destroy((err) => 
    {
    if (err) {
      return console.error(err);
    }
    res.redirect('/login');
  });
});

// Route to handle submission of a new blog post
router.post('/new', isAuthenticated, async (req, res) => 
  {
  const { title, body } = req.body;
  const creator_user_id = req.session.user.id;
  const creator_name = req.session.user.name;

  console.log('Inserting blog post with data:', { creator_user_id, creator_name, title, body });

  try 
  {
    // Insert new blog post into blogs table
    await pool.query(
      'INSERT INTO blogs (creator_user_id, creator_name, title, body) VALUES ($1, $2, $3, $4)',
      [creator_user_id, creator_name, title, body]
    );

    res.redirect('/');
  } catch (err) 
  {
    console.error('Error creating blog post:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).send('Error creating blog post');
  }
});


// Route to render the edit form for a specific blog post
router.get('/edit/:id', isAuthenticated, async (req, res) => 
  {
  const postId = req.params.id;

  console.log('Fetching blog post with ID:', postId);

  try 
  {
    const result = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [postId]);
    if (result.rows.length > 0) 
      {
        // Render the edit page with the blog data
      res.render('edit', { blog: result.rows[0] });
    } else 
    {
      res.status(404).send('Blog post not found');
    }
  } 
  catch (err) 
  {
    console.error('Error retrieving blog post:', err.message);
    res.status(500).send('Error retrieving blog post');
  }
});

// Route to handle updating a blog post
router.post('/edit/:id', isAuthenticated, async (req, res) => 
  {
  // Get the blog ID from the URL
  const postId = req.params.id; 
  // Get the updated title and body from the form
  const { title, body } = req.body;  

   // Log the post ID
  console.log('Updating post with ID:', postId); 
  // Log the form data
  console.log('Form data:', { title, body });  

  try 
  {
    // Update the blog post in the database
    await pool.query(
      'UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3',
      [title, body, postId] 
    );
    
    // Redirect back to the homepage after the update
    res.redirect('/');
  } catch (err) 
  {
    console.error('Error updating blog post:', err.message);
    res.status(500).send('Error updating blog post');
  }
});



// Route to delete a blog post
router.post('/delete/:id', isAuthenticated, async (req, res) => 
  {
  const postId = req.params.id;
    // Log the postId
  console.log('Deleting post with ID:', postId); 

  try 
  {
    await pool.query('DELETE FROM blogs WHERE blog_id = $1', [postId]);  
    res.redirect('/');
  } catch (err) 
  {
    console.error('Error deleting blog post:', err.message);  
    res.status(500).send('Error deleting blog post');
  }
});


module.exports = router;
