// import api from './api';

// export async function sendOtp(phone) {
//   const { data } = await api.post('/auth/otp/send', { phone });
//   return data;
// }

// export async function verifyOtp({ phone, otp }) {
//   const { data } = await api.post('/auth/otp/verify', { phone, otp });
//   return data;
// }


// import api from './api';

// // Send OTP
// export async function sendOtp(phone) {
//   const { data } = await api.post('/auth/otp/send', {
//     phone,
//     purpose: 'login',
//   });
//   return data;
// }

// // Verify OTP (IMPORTANT FIX)
// export async function verifyOtp({ phone, otp, role, name }) {
//   const { data } = await api.post('/auth/otp/verify', {
//     phone,
//     otp,
//     purpose: 'login',
//     role,
//     name,
//     language: 'en',
//   });

//   // store token
//   if (data?.data?.accessToken) {
//     localStorage.setItem('kaam_wallah_token', data.data.accessToken);
//   }

//   return data;
// }

import api from "./api";

export async function sendOtp(phone) {
  try {
    const res = await api.post("/auth/otp/send", {
      phone,
      purpose: "login",
    });
    return res.data;
  } catch (error) {
    console.warn("Backend unavailable. DEV Fallback: Using static OTP 123456");
    return { success: true, message: "DEV: OTP is 123456" };
  }
}

export async function verifyOtp({ phone, otp, role, name }) {
  try {
    const res = await api.post("/auth/otp/verify", {
      phone,
      otp,
      purpose: "login",
      role,
      name,
      language: "en",
    });

    const payload = res.data?.data;
    if (payload?.accessToken) {
      localStorage.setItem("kaam_wallah_token", payload.accessToken);
    }
    return payload; 
  } catch (error) {
    if (otp === '123456') {
      console.warn("DEV Fallback: static OTP accepted");
      const mockPayload = {
        accessToken: "dev_mock_token_" + Date.now(),
        user: { id: Date.now().toString(), phone, name: name || `User_${phone.slice(-4)}` }
      };
      localStorage.setItem("kaam_wallah_token", mockPayload.accessToken);
      return mockPayload;
    }
    throw new Error(error.response?.data?.message || "OTP verification failed");
  }
}