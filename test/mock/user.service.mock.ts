export const UserServiceMockObject = {
  sendMessageOnEmail(_email: string) {
    console.log('Call mock method sendMessageOnEmail / MailService');
    return Promise.resolve(true);
  },
  create() {
    return Promise.resolve('123');
  },
};


