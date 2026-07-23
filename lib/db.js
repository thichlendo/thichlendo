// In-memory database (tạm thời - sau switch MongoDB)
let keys = [];
let links = [];
let keyIdCounter = 1;
let linkIdCounter = 1;

export const db = {
  // Keys
  createKey: (data) => {
    const key = {
      id: keyIdCounter++,
      ...data,
      createdAt: new Date(),
    };
    keys.push(key);
    return key;
  },

  getKeyById: (id) => keys.find(k => k.id === id),
  
  getKeyByCode: (code) => keys.find(k => k.keyCode === code),
  
  getAllKeys: () => keys,
  
  updateKey: (id, updates) => {
    const key = keys.find(k => k.id === id);
    if (key) Object.assign(key, updates);
    return key;
  },

  // Links
  createLink: (data) => {
    const link = {
      id: linkIdCounter++,
      ...data,
      createdAt: new Date(),
    };
    links.push(link);
    return link;
  },

  getLinkById: (id) => links.find(l => l.id === id),
  
  getLinkByShortUrl: (url) => links.find(l => l.shortUrl === url),
  
  getAllLinks: () => links,
  
  updateLink: (id, updates) => {
    const link = links.find(l => l.id === id);
    if (link) Object.assign(link, updates);
    return link;
  },

  // Clear all (dev only)
  clearAll: () => {
    keys = [];
    links = [];
  },
};
