module.exports = (err, req, res, next) => {
  console.error(err.stack); 

  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Invalid JSON syntax.' });
  }

  return res.status(500).json({ message: 'Internal server error.' });
};
