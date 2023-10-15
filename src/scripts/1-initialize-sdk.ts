import nextEnv from '@next/env';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import ethers from 'ethers';

const { loadEnvConfig } = nextEnv;
// 環境変数を env ファイルから読み込む
const { PRIVATE_KEY, ALCHEMY_API_URL, WALLET_ADDRESS, THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY } = loadEnvConfig(
  process.cwd()
).combinedEnv;

// 環境変数が取得できてとれているか確認
if (!PRIVATE_KEY || PRIVATE_KEY === '') {
  console.log('🛑 Private key not found.');
}

if (!ALCHEMY_API_URL || ALCHEMY_API_URL === '') {
  console.log('🛑 Alchemy API URL not found.');
}

if (!WALLET_ADDRESS || WALLET_ADDRESS === '') {
  console.log('🛑 Wallet Address not found.');
}

if (!THIRDWEB_CLIENT_ID || THIRDWEB_CLIENT_ID === '') {
  console.log('🛑 Thirdweb Client ID not found.');
}

if (!THIRDWEB_SECRET_KEY || THIRDWEB_SECRET_KEY === '') {
  console.log('🛑 Thirdweb Secret Key not found.');
}

//const apiKey = "YOUR_API_KEY_HERE"; 
// const apiKey = "UNCHAIN_ETC_DAO_20231015"; 

// const sdk = new ThirdwebSDK(
//   new ethers.Wallet(PRIVATE_KEY!, ethers.getDefaultProvider(ALCHEMY_API_URL)),
// );

const sdk = ThirdwebSDK.fromPrivateKey(
  PRIVATE_KEY!, // Your wallet's private key (only required for write operations)
  "ethereum",
  {
    clientId: THIRDWEB_CLIENT_ID, // Use client id if using on the client side, get it from dashboard settings
    secretKey: THIRDWEB_SECRET_KEY, // Use secret key if using on the server, get it from dashboard settings
  },
);

// const sdk = ThirdwebSDK.fromWallet(
//   new ethers.Wallet(PRIVATE_KEY!, ethers.getDefaultProvider(ALCHEMY_API_URL)),
//   "ethereum",
//   {
//     accessKeyId: "UNCHAIN_ETC_DAO_20231015",
//     secretAccessKey: "xxxxx",
//   }
// );


// ここでスクリプトを実行
(async () => {
  try {
    if (!sdk || !('getSigner' in sdk)) return;
    const address = await sdk.getSigner()?.getAddress();
    console.log('SDK initialized by address:', address);
  } catch (err) {
    console.error('Failed to get apps from the sdk', err);
    process.exit(1);
  }
})();

// 初期化した sdk を他のスクリプトで再利用できるように export
export default sdk;