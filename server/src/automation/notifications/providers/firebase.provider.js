const admin = require('firebase-admin');

class FirebaseProvider {
  constructor() {
    try {
      if (!admin.apps.length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          this.initialized = true;
        } else {
          this.initialized = false;
        }
      } else {
        this.initialized = true;
      }
    } catch (err) {
      console.error('[Firebase] Init error', err);
      this.initialized = false;
    }
  }

  async sendPush(token, title, body, data = {}) {
    if (!this.initialized) {
      console.log(`[Firebase Mock] Push to ${token}: ${title} - ${body}`);
      return 'mock_push_id';
    }

    // Ensure all data values are strings as required by Firebase messaging
    const stringifiedData = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
    }, {});

    const message = {
      notification: { title, body },
      data: {
        ...stringifiedData,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('[Firebase] Send push error', error);
      throw error;
    }
  }
}

module.exports = new FirebaseProvider();
