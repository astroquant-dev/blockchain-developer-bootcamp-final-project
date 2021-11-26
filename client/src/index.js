import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import { MoralisProvider } from "react-moralis";
// const dotenv = require('dotenv');
// dotenv.config();
// const moralis_key = process.env.MORALIS_KEY;


ReactDOM.render(<App />, document.getElementById('root'));
// ReactDOM.render(<MoralisProvider appId="xxxxxxxx" serverUrl="xxxxxxxx"><App /></MoralisProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


//https://medium.com/swlh/responsive-navbar-using-react-bootstrap-5e0e0bd33bd6