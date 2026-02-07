
const store = new Map();

const EXPIRY_MS = (parseInt(process.env.OTP_EXPIRE_MINUTES, 10) || 10) * 60 * 1000;

const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const set = (email, otp) => {
  const expiresAt = Date.now() + EXPIRY_MS;
  store.set(email.toLowerCase().trim(), { otp, expiresAt });
};

const get = (email) => {
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.otp;
};

const verifyAndClear = (email, otp) => {
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  const match = entry.otp === String(otp).trim();
  if (match) store.delete(key);
  return match;
};

module.exports = { set, get, verifyAndClear, generateOTP };
