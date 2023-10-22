// 接続中のネットワークを取得するため useNetwork を新たにインポートします。
import { Sepolia } from '@thirdweb-dev/chains';
import {
  ConnectWallet,
  useAddress,
  useChain,
  useContract,
} from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { Proposal } from '@thirdweb-dev/sdk';

import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  const address = useAddress();
  console.log('👋Wallet Address: ', address);

  const chain = useChain();

  // editionDrop コントラクトを初期化
  const editionDrop = useContract(
    'INSERT_EDITION_DROP_ADDRESS',
    'edition-drop',
  ).contract;

  // トークンコントラクトの初期化
  const token = useContract(
    'INSERT_TOKEN_ADDRESS',
    'token',
  ).contract;

  // 投票コントラクトの初期化
  const vote = useContract(
    'INSERT_VOTE_ADDRESS',
    'vote',
  ).contract;

  // ユーザーがメンバーシップ NFT を持っているかどうかを知るためのステートを定義
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // メンバーごとの保有しているトークンの数をステートとして宣言
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);
  
  // DAO メンバーのアドレスをステートで宣言
  const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // アドレスの長さを省略してくれる便利な関数
  const shortenAddress = (str: string) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  // コントラクトから既存の提案を全て取得します
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // vote!.getAll() を使用して提案を取得します
    const getAllProposals = async () => {
      try {
        const proposals = await vote!.getAll();
        setProposals(proposals);
        console.log('🌈 Proposals:', proposals);
      } catch (error) {
        console.log('failed to get proposals', error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // ユーザーがすでに投票したかどうか確認します
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // 提案を取得し終えない限り、ユーザーが投票したかどうかを確認することができない
    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote!.hasVoted(proposals[0].proposalId.toString(), address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log('🥵 User has already voted');
        } else {
          console.log('🙂 User has not voted yet');
        }
      } catch (error) {
        console.error('Failed to check if wallet has voted', error);
      }
    };
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // メンバーシップを保持しているメンバーの全アドレスを取得します
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // 先ほどエアドロップしたユーザーがここで取得できます（発行された tokenID 0 のメンバーシップ NFT）
    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
          0
        );
        setMemberAddresses(memberAddresses);
        console.log('🚀 Members addresses', memberAddresses);
      } catch (error) {
        console.error('failed to get member list', error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop?.history]);

  // 各メンバーが保持するトークンの数を取得します
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log('👜 Amounts', amounts);
      } catch (error) {
        console.error('failed to get member balances', error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);

  // memberAddresses と memberTokenAmounts を 1 つの配列に結合します
  const memberList = useMemo(() => {
    return memberAddresses?.map((address) => {
      // memberTokenAmounts 配列でアドレスが見つかっているかどうかを確認します
      // その場合、ユーザーが持っているトークンの量を返します
      // それ以外の場合は 0 を返します
      const member = memberTokenAmounts?.find(
        ({ holder }: {holder: string}) => holder === address,
      );

      return {
        address,
        tokenAmount: member?.balance.displayValue || '0',
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // NFT をミンティングしている間を表すステートを定義
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    // もしウォレットに接続されていなかったら処理をしない
    if (!address) {
      return;
    }
    // ユーザーがメンバーシップ NFT を持っているかどうかを確認する関数を定義
    const checkBalance = async () => {
      try {
        const balance = await editionDrop!.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log('🌟 this user has a membership NFT!');
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error('Failed to get balance', error);
      }
    };
    // 関数を実行
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop!.claim('0', 1);
      console.log(
        `🌊 Successfully Minted! Check it out on etherscan: https://sepolia.etherscan.io/address/${editionDrop!.getAddress()}`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error('Failed to mint NFT', error);
    } finally {
      setIsClaiming(false);
    }
  };

  // ウォレットと接続していなかったら接続を促す
  if (!address) {
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
  // テストネットが Sepolia ではなかった場合に警告を表示
  else if (chain && chain.chainId !== Sepolia.chainId) {
    console.log('wallet address: ', address);
    console.log('chain name: ', chain.name);

    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Sepolia に切り替えてください⚠️</h1>
          <p>この dApp は Sepolia テストネットのみで動作します。</p>
          <p>ウォレットから接続中のネットワークを切り替えてください。</p>
        </main>
      </div>
    );
  }
// ユーザーがすでに NFT を要求している場合は、内部 DAO ページを表示します
// これは DAO メンバーだけが見ることができ、すべてのメンバーとすべてのトークン量をレンダリングします
else if (hasClaimedNFT){
  return (
    <div className={styles.container}>
    <main className={styles.main}>
      <h1 className={styles.title}>🍪DAO Member Page</h1>
      <p>Congratulations on being a member</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList!.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
    </div>
    );
  }
  // ウォレットと接続されていたら Mint ボタンを表示
  else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Mint your free 🍪DAO Membership NFT</h1>
          <button disabled={isClaiming} onClick={mintNft}>
            {isClaiming ? 'Minting...' : 'Mint your nft (FREE)'}
          </button>
        </main>
      </div>
    );
  }
};

export default Home;