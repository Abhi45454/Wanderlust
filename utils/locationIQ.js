const axios = require('axios');
const apiKey = 'pk.8e5446aa533b61a564c574c95159cb25'; // replace with your real key

async function forwardGeocode(address) {
  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search', {
      params: {
        key: apiKey,
        q: address,
        format: 'json'
      }
    });
    const place = response.data[0];
    return {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      display_name: place.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

module.exports = { forwardGeocode };
