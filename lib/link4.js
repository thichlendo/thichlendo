export const createShortlink = async (longUrl) => {
  try {
    const endpoint = `${process.env.LINK4_API_ENDPOINT}?api=${process.env.LINK4_API_TOKEN}&url=${encodeURIComponent(longUrl)}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        shortUrl: data.shortenedUrl,
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to create shortlink',
    };
  } catch (error) {
    console.error('Link4 API Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
