/**
 * Multilingual Labels — Hindi & English
 * API responses include language-specific labels based on user.language preference
 */

const labels = {
  en: {
    // Job Statuses
    status: {
      requested:   'Requested',
      accepted:    'Accepted',
      on_the_way:  'On the Way',
      in_progress: 'In Progress',
      completed:   'Completed',
      cancelled:   'Cancelled',
      rejected:    'Rejected',
    },
    // Common messages
    messages: {
      otpSent:          'OTP sent successfully',
      otpVerified:      'OTP verified successfully',
      loginSuccess:     'Login successful',
      signupSuccess:    'Account created successfully',
      profileUpdated:   'Profile updated successfully',
      jobCreated:       'Job posted successfully',
      jobAccepted:      'Job accepted',
      jobRejected:      'Job rejected',
      jobCompleted:     'Job marked as completed',
      reviewSubmitted:  'Review submitted successfully',
      workerNotFound:   'Worker not found',
      jobNotFound:      'Job not found',
      unauthorized:     'Unauthorized access',
      invalidOtp:       'Invalid or expired OTP',
      serverError:      'Internal server error',
      alreadyReviewed:  'You have already reviewed this job',
    },
    // Skills
    skills: {
      plumber:      'Plumber',
      electrician:  'Electrician',
      carpenter:    'Carpenter',
      painter:      'Painter',
      cleaner:      'House Cleaner',
      mason:        'Mason',
      mechanic:     'Mechanic',
      driver:       'Driver',
      gardener:     'Gardener',
      cook:         'Cook',
    },
  },
  hi: {
    // Job Statuses
    status: {
      requested:   'अनुरोध किया',
      accepted:    'स्वीकार किया',
      on_the_way:  'रास्ते में',
      in_progress: 'काम जारी है',
      completed:   'पूरा हुआ',
      cancelled:   'रद्द किया',
      rejected:    'अस्वीकार किया',
    },
    // Common messages
    messages: {
      otpSent:          'OTP सफलतापूर्वक भेजा गया',
      otpVerified:      'OTP सफलतापूर्वक सत्यापित हुआ',
      loginSuccess:     'लॉगिन सफल',
      signupSuccess:    'खाता सफलतापूर्वक बनाया गया',
      profileUpdated:   'प्रोफ़ाइल अपडेट हो गई',
      jobCreated:       'काम सफलतापूर्वक पोस्ट किया गया',
      jobAccepted:      'काम स्वीकार किया गया',
      jobRejected:      'काम अस्वीकार किया गया',
      jobCompleted:     'काम पूरा हो गया',
      reviewSubmitted:  'समीक्षा सफलतापूर्वक सबमिट हुई',
      workerNotFound:   'मजदूर नहीं मिला',
      jobNotFound:      'काम नहीं मिला',
      unauthorized:     'अनधिकृत पहुंच',
      invalidOtp:       'गलत या समाप्त OTP',
      serverError:      'सर्वर में गड़बड़ी हुई',
      alreadyReviewed:  'आपने इस काम की समीक्षा पहले ही कर दी है',
    },
    // Skills
    skills: {
      plumber:      'प्लंबर',
      electrician:  'इलेक्ट्रीशियन',
      carpenter:    'बढ़ई',
      painter:      'पेंटर',
      cleaner:      'सफाईकर्मी',
      mason:        'राजमिस्त्री',
      mechanic:     'मैकेनिक',
      driver:       'ड्राइवर',
      gardener:     'माली',
      cook:         'रसोइया',
    },
  },
};

/**
 * Get labels for a given language, falling back to English
 */
const getLabels = (lang = 'en') => labels[lang] || labels.en;

/**
 * Translate a status key
 */
const translateStatus = (statusKey, lang = 'en') => {
  const l = getLabels(lang);
  return l.status[statusKey] || statusKey;
};

/**
 * Get message in user language
 */
const getMessage = (key, lang = 'en') => {
  const l = getLabels(lang);
  return l.messages[key] || l.messages['serverError'];
};

module.exports = { getLabels, translateStatus, getMessage };
