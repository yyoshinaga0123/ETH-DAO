// 接続中のネットワークを取得するため useNetwork を新たにインポートします。
import { ConnectWallet, useNetwork, useAddress } from '@thirdweb-dev/react';
import type { NextPage } from 'next';

import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();

  if (address && network && network?.data?.chain?.id !== 11155111) {
    console.log('wallet address: ', address);
    console.log('network: ', network?.data?.chain?.id);

    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Sepolia に切り替えてください⚠️</h1>
          <p>この dApp は Sepolia テストネットのみで動作します。</p>
          <p>ウォレットから接続中のネットワークを切り替えてください。</p>
        </main>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Welcome to Tokyo Sauna Collective !!
          </h1>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }
};

export default Home;