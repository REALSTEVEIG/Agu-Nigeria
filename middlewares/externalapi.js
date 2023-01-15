const options = {
    method: 'POST',
    url: 'https://motivational-quotes1.p.rapidapi.com/motivation',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'motivational-quotes1.p.rapidapi.com'
    },
    data: '{"key1":"value","key2":"value"}'
  };

module.exports = options