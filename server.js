const jsonServer = require('json-server')
const auth = require('json-server-auth')
const multer  = require('multer')
const validateOrder = require('./middlewares/orderValidation')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)


// /!\ Bind the router db to the app
server.db = router.db


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    let date = new Date()
    
	  let imageFilename = date.getTime() + "_" + file.originalname
	  req.body.imageFilename = imageFilename
    cb(null, imageFilename)
  }
})

const bodyParser = multer({ storage: storage }).any()

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(bodyParser) // Handles file uploads
server.post("/products", (req, res, next) => {
  let date = new Date()
  req.body.createdAt = date.toISOString()
  
  if (req.body.price) {
	req.body.price = Number(req.body.price)
  }
  
  let hasErrors = false
  let errors = {}
  
  if (req.body.name.length < 2) {
	  hasErrors = true
	  errors.name = "The name length should be at least 2 characters"
  }
  if (req.body.brand.length < 2) {
	  hasErrors = true
	  errors.brand = "The brand length should be at least 2 characters"
  }
  if (req.body.category.length < 2) {
	  hasErrors = true
	  errors.category = "The category length should be at least 2 characters"
  }
  if (req.body.price <= 0) {
	  hasErrors = true
	  errors.price = "The price is not valid"
  }
  if (req.body.description.length < 10) {
	  hasErrors = true
	  errors.description = "The description length should be at least 10 characters"
  }
  

  if (hasErrors) {
	  // return bad request (400) with validation errors
	  res.status(400).jsonp(errors)
	  return
  }
  
  // Continue to JSON Server router
  next()
})

// Add custom routes for orders
server.post("/orders", auth, (req, res, next) => {
    // Validate order data
    if (!req.body.userId || !req.body.items || !req.body.total) {
        return res.status(400).json({ error: "Missing required order fields" });
    }

    // Add timestamp
    req.body.createdAt = new Date().toISOString();
    
    // Set initial status
    req.body.status = "pending";

    // Continue to JSON Server router
    next();
});

const rules = auth.rewriter({
    users: 660,
    products: 664,
    orders: 660  // Only authenticated users can access orders
})
server.use(validateOrder)
server.use(rules)
server.use(auth)

// Use default router
server.use(router)

// Start server
const port = process.env.PORT || 4000
server.listen(port, () => {
    console.log(`JSON Server with Auth is running on port ${port}`)
})
