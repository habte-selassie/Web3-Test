import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SERVER_URL} from '../../constants/env';
import openNotification from '../helpers/notification';
import Wallet from '../../utils/wallet';
import setAuthToken from '../../utils/setAuthToken';
import SIGNUP_URL from '../../constants/env'
import { EMAIL_VERIFY_URL } from '../../constants/env';
//import UserProvider from './UserProvider';
// Define the initial user context template
const userContextTemplate = {
  userInfo: '',
  userRegister: () => {},
  sendEmail: () => {},
  login: () => {},
  jwtInfo: '',
  wallet: new Wallet()
};

// Create the user context
 export const UserContext = React.createContext(userContextTemplate);

// UserProvider component
 function UserProvider(props) {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState('');
  const [jwtInfo, setJwtInfo] = useState('');
  const wallet = new Wallet();

  // Function to handle user registration
  const userRegister = (requestData) => {
    axios.post(SIGNUP_URL, requestData)
      .then(response => {
        if (response.data.response) {
          openNotification(t('Success'), t('Account successfully created!'), true, goWalletMain);
          localStorage.setItem('userInfo', JSON.stringify(response.data.data.userInfo));
          localStorage.setItem('jwtToken', JSON.stringify(response.data.data.token));

          if (response.data.data.keyPair) {
            localStorage.setItem('privateKey', wallet.decrypt(response.data.data.keyPair[0].privateKey));
            localStorage.setItem('publicKey', JSON.stringify(response.data.data.keyPair[0].publicKey));
          }
        } else {
          openNotification(t('Fail!'), response.data.message, false, null);
        }
      });
  };

  // Function to send email verification
  const sendEmail = (requestData) => {
    axios.post(EMAIL_VERIFY_URL, requestData)
      .then(response => {
        if (response.data.response) {
          openNotification(t('Success'), t('E-mail sent successfully'), true, null);
        } else {
          openNotification(t('Fail!'), t('E-mail not verified!'), false, null);
        }
      });
  };

  // Function to handle user login
  const login = (requestData) => {
    axios.post(SERVER_URL + 'users/login', requestData)
      .then(response => {
        if (response.data.response) {
          localStorage.setItem('userInfo', JSON.stringify(response.data.data.userInfo));
          localStorage.setItem('jwtToken', JSON.stringify(response.data.data.token));

          if (response.data.data.keyPair) {
            localStorage.setItem('privateKey', wallet.decrypt(response.data.data.keyPair[0].privateKey));
            localStorage.setItem('publicKey', response.data.data.keyPair[0].publicKey);
          }

          openNotification(t('Successful'), t('Welcome to our site.'), true, goMain);
          setAuthToken(response.data.data.token);
        } else {
          openNotification(t('Login Failed'), response.data.message, false, null);
        }
      });
  };

  // Function to redirect to wallet main
  const goWalletMain = () => {
    window.location.href = '/walletMain';
  };

  // Function to redirect to main
  const goMain = () => {
    window.location.href = '/';
  };

  // Effect to update user info and JWT info from local storage
  useEffect(() => {
    setUserInfo(localStorage.getItem('userInfo'));
    setJwtInfo(localStorage.getItem('jwtToken'));
  }, []);

  // Render the UserContext.Provider with the provided value
  return (
    <UserContext.Provider value={{
      userInfo,
      userRegister,
      sendEmail,
      jwtInfo,
      wallet,
      login
    }}>
      {props.children}
    </UserContext.Provider>
  );
}

// Export the UserContext and UserProvider
export {UserProvider};