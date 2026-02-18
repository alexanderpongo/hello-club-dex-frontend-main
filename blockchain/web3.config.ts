import { Hex, erc20Abi } from "viem";

export const contractAddresses: Record<string, Hex> = {
  stakingContractAddress: process.env
    .NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as Hex,
  predictionMarketContractAddress: process.env
    .NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_ADDRESS as Hex,
  referralSystemContractAddress: process.env.NEXT_PUBLIC_REFERRAL_SYSTEM_CONTRACT_ADDRESS as Hex,  
};

export const nativeTokenAddresses: Record<number, string> = {
  56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  8453: "0x4200000000000000000000000000000000000006", // WETH - BASE
  97: "0xae13d989dac2f0debff460ac112a837c89baa7cd", // WBNB Testnet
};

export const contractAbis: Record<string, any> = {
  erc20Abi,
  stakingAbi:
    '[{"inputs":[{"internalType":"contract IERC20","name":"_stakingToken","type":"address"},{"internalType":"contract IHelloClubNFT","name":"_tierNFT","type":"address"},{"internalType":"address","name":"_treasuryWallet","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"EnforcedPause","type":"error"},{"inputs":[],"name":"ExpectedPause","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newFees","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"FeesCalculated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum IHelloClubNFT.Tier","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lockPeriod","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"nftTokenId","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum IHelloClubNFT.Tier","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"newAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newWeight","type":"uint256"}],"name":"TierThresholdUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"enum IHelloClubNFT.Tier","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"nftTokenId","type":"uint256"}],"name":"TierUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TreasuryWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"penalty","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"BURN_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEAD_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEPOSIT_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FIFTEEN_DAY_LOCK","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NINETY_DAY_LOCK","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD_POOL_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TREASURY_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UNLOCK_PENALTY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accumulatedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum IHelloClubNFT.Tier","name":"tier","type":"uint8"}],"name":"calculateAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"calculateNewFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"calculateTier","outputs":[{"internalType":"enum IHelloClubNFT.Tier","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"isNinetyDayLock","type":"bool"}],"name":"createStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getContractInfo","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_uniqueStakers","type":"uint256"},{"internalType":"uint256","name":"_totalPendingRewards","type":"uint256"},{"internalType":"uint256","name":"_accumulatedRewards","type":"uint256"},{"internalType":"uint256","name":"_totalWeightedStake","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getStakeInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"lockEndTime","type":"uint256"},{"internalType":"uint256","name":"nftTokenId","type":"uint256"},{"internalType":"bool","name":"isNinetyDayLock","type":"bool"},{"internalType":"uint256","name":"pendingReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum IHelloClubNFT.Tier","name":"tier","type":"uint8"}],"name":"getTierInfo","outputs":[{"internalType":"uint256","name":"tierTotalStaked","type":"uint256"},{"internalType":"uint256","name":"accRewardPerShare","type":"uint256"},{"internalType":"uint256","name":"lastRewardBalance","type":"uint256"},{"internalType":"uint256","name":"totalWeightedStake","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isStaker","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalCalculation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"pendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_treasuryWallet","type":"address"}],"name":"setTreasuryWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"lockEndTime","type":"uint256"},{"internalType":"uint256","name":"nftTokenId","type":"uint256"},{"internalType":"bool","name":"isNinetyDayLock","type":"bool"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"lastRewardCalculation","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stakingToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum IHelloClubNFT.Tier","name":"","type":"uint8"}],"name":"tierInfo","outputs":[{"internalType":"uint256","name":"totalStaked","type":"uint256"},{"internalType":"uint256","name":"totalWeightedStake","type":"uint256"},{"internalType":"uint256","name":"accRewardPerShare","type":"uint256"},{"internalType":"uint256","name":"lastRewardBalance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tierNFT","outputs":[{"internalType":"contract IHelloClubNFT","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum IHelloClubNFT.Tier","name":"","type":"uint8"}],"name":"tierThresholds","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"weightMultiplier","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalWeightedStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasuryBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"treasuryWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniqueStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateTierRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"enum IHelloClubNFT.Tier","name":"tier","type":"uint8"},{"internalType":"uint256","name":"newAmount","type":"uint256"},{"internalType":"uint256","name":"newWeight","type":"uint256"}],"name":"updateTierThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawTreasury","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
  predictionMarketAbi:
    '[{"inputs":[{"internalType":"address","name":"_helloToken","type":"address"},{"internalType":"address","name":"_tierNFT","type":"address"},{"internalType":"address","name":"_treasury","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"FailedCall","type":"error"},{"inputs":[{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"InsufficientBalance","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"helloTokens","type":"uint256"}],"name":"CancelledFundsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"CategoryCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"CategoryRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldPeriod","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPeriod","type":"uint256"}],"name":"ClaimPeriodUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CreatorFeesClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldThreshold","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newThreshold","type":"uint256"}],"name":"DownvoteThresholdUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FeesCollected","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"OwnerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"OwnerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"downvotes","type":"uint256"}],"name":"PredictionAutoDelisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"cancelTime","type":"uint256"}],"name":"PredictionCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"startTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"categoryId","type":"uint256"},{"indexed":false,"internalType":"string","name":"source","type":"string"},{"indexed":false,"internalType":"bool","name":"isAdminCreated","type":"bool"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"PredictionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"}],"name":"PredictionDelistConfirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"PredictionDownvoted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newEndTime","type":"uint256"}],"name":"PredictionExtended","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"updater","type":"address"},{"indexed":false,"internalType":"string","name":"newTitle","type":"string"},{"indexed":false,"internalType":"string","name":"newDescription","type":"string"}],"name":"PredictionInfoUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newEndTime","type":"uint256"}],"name":"PredictionRelisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"bool","name":"outcome","type":"bool"}],"name":"PredictionResolved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"}],"name":"PredictionUpvoted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"helloTokens","type":"uint256"}],"name":"RewardsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsPoolAllocated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsPoolIncreased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensVoted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"sharesReceived","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timeWeight","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"probabilityBonus","type":"uint256"},{"indexed":false,"internalType":"bool","name":"earlyStageProtection","type":"bool"}],"name":"SharesCalculated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousSuperOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newSuperOwner","type":"address"}],"name":"SuperOwnerTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"additionalTokens","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"additionalShares","type":"uint256"}],"name":"TokensAddedToVote","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"UnclaimedFundsBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"bool","name":"vote","type":"bool"},{"indexed":false,"internalType":"uint256","name":"helloTokens","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"}],"name":"VoteCast","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"predictionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newVotingRound","type":"uint256"}],"name":"VotesReset","type":"event"},{"inputs":[],"name":"BURN_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CREATOR_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEAD_WALLET","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EARLY_STAGE_PROTECTION_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_PREDICTION_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_PROBABILITY_BONUS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_HOURS_BEFORE_END","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_PREDICTION_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARDS_POOL_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TREASURY_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"VOTE_FEE_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"addOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"burnUnclaimedFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"cancelPrediction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"categories","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"claimCancelledFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"claimCreatorFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"confirmDelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"}],"name":"createCategory","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_endTime","type":"uint256"},{"internalType":"uint256","name":"_categoryId","type":"uint256"},{"internalType":"string","name":"_source","type":"string"},{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"}],"name":"createPrediction","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"downvotePrediction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"downvoteThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"uint256","name":"_newEndTime","type":"uint256"}],"name":"extendPrediction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_categoryId","type":"uint256"}],"name":"getCategory","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentRewardsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"getPredictionBasicInfo","outputs":[{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"bool","name":"isAdminCreated","type":"bool"},{"internalType":"string","name":"source","type":"string"},{"internalType":"uint256","name":"categoryId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"getPredictionRewardsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"getPredictionVoteStats","outputs":[{"internalType":"bool","name":"isResolved","type":"bool"},{"internalType":"bool","name":"outcome","type":"bool"},{"internalType":"uint256","name":"totalYesVotes","type":"uint256"},{"internalType":"uint256","name":"totalNoVotes","type":"uint256"},{"internalType":"uint256","name":"yesPercentage","type":"uint256"},{"internalType":"uint256","name":"noPercentage","type":"uint256"},{"internalType":"uint256","name":"feesCollected","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"getPredictionVotingStats","outputs":[{"internalType":"uint256","name":"upvotes","type":"uint256"},{"internalType":"uint256","name":"downvotes","type":"uint256"},{"internalType":"uint256","name":"currentVotingRound","type":"uint256"},{"internalType":"bool","name":"isDelisted","type":"bool"},{"internalType":"bool","name":"adminConfirmedDelist","type":"bool"},{"internalType":"uint256","name":"delistTime","type":"uint256"},{"internalType":"uint256","name":"remainingTimeAtDelist","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"getUnclaimedFunds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"getUserVote","outputs":[{"internalType":"bool","name":"userVote","type":"bool"},{"internalType":"uint256","name":"helloTokens","type":"uint256"},{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"bool","name":"hasVoted","type":"bool"},{"internalType":"bool","name":"hasClaimed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"getUserVotingStatus","outputs":[{"internalType":"bool","name":"hasUpvoted","type":"bool"},{"internalType":"bool","name":"hasDownvoted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"hasTierNFT","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"hasUserDownvoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"hasUserUpvoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"helloToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"owners","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"predictionVoting","outputs":[{"internalType":"uint256","name":"upvotes","type":"uint256"},{"internalType":"uint256","name":"downvotes","type":"uint256"},{"internalType":"uint256","name":"currentVotingRound","type":"uint256"},{"internalType":"bool","name":"isDelisted","type":"bool"},{"internalType":"uint256","name":"delistTime","type":"uint256"},{"internalType":"uint256","name":"remainingTimeAtDelist","type":"uint256"},{"internalType":"bool","name":"adminConfirmedDelist","type":"bool"},{"internalType":"uint256","name":"cancelTime","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"predictions","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"bool","name":"isAdminCreated","type":"bool"},{"internalType":"string","name":"source","type":"string"},{"internalType":"uint256","name":"categoryId","type":"uint256"},{"internalType":"bool","name":"isResolved","type":"bool"},{"internalType":"bool","name":"outcome","type":"bool"},{"internalType":"uint256","name":"totalYesVotes","type":"uint256"},{"internalType":"uint256","name":"totalNoVotes","type":"uint256"},{"internalType":"uint256","name":"feesCollected","type":"uint256"},{"internalType":"uint256","name":"creatorFeesEarned","type":"uint256"},{"internalType":"uint256","name":"totalClaimedFunds","type":"uint256"},{"internalType":"uint256","name":"rewardsPoolAllocation","type":"uint256"},{"internalType":"bool","name":"isFrozen","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"},{"internalType":"bool","name":"_assumedOutcome","type":"bool"}],"name":"previewRewardCalculation","outputs":[{"internalType":"uint256","name":"originalBet","type":"uint256"},{"internalType":"uint256","name":"losingPoolShare","type":"uint256"},{"internalType":"uint256","name":"rewardsPoolBonus","type":"uint256"},{"internalType":"uint256","name":"totalReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"uint256","name":"_helloTokens","type":"uint256"},{"internalType":"bool","name":"_vote","type":"bool"}],"name":"previewShareCalculation","outputs":[{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"uint256","name":"timeWeight","type":"uint256"},{"internalType":"uint256","name":"probabilityBonus","type":"uint256"},{"internalType":"bool","name":"earlyStageProtection","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"relistPrediction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_categoryId","type":"uint256"}],"name":"removeCategory","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"removeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"bool","name":"_outcome","type":"bool"}],"name":"resolvePrediction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rewardsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"superOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tierNFT","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newSuperOwner","type":"address"}],"name":"transferSuperOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPeriod","type":"uint256"}],"name":"updateClaimPeriod","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newThreshold","type":"uint256"}],"name":"updateDownvoteThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"string","name":"_newTitle","type":"string"},{"internalType":"string","name":"_newDescription","type":"string"}],"name":"updatePredictionInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newTierNFT","type":"address"}],"name":"updateTierNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newTreasury","type":"address"}],"name":"updateTreasury","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"}],"name":"upvotePrediction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_predictionId","type":"uint256"},{"internalType":"bool","name":"_vote","type":"bool"},{"internalType":"uint256","name":"_helloTokens","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
};

export const pcsRouterAbi = [
  {
    inputs: [
      { internalType: "address", name: "_deployer", type: "address" },
      { internalType: "address", name: "_factory", type: "address" },
      { internalType: "address", name: "_WETH9", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WETH9",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deployer",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "bytes", name: "path", type: "bytes" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
        ],
        internalType: "struct ISwapRouter.ExactInputParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInput",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct ISwapRouter.ExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "bytes", name: "path", type: "bytes" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountOut", type: "uint256" },
          { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
        ],
        internalType: "struct ISwapRouter.ExactOutputParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactOutput",
    outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountOut", type: "uint256" },
          { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct ISwapRouter.ExactOutputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactOutputSingle",
    outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "int256", name: "amount0Delta", type: "int256" },
      { internalType: "int256", name: "amount1Delta", type: "int256" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "pancakeV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "refundETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermitAllowed",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermitAllowedIfNecessary",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermitIfNecessary",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "feeBips", type: "uint256" },
      { internalType: "address", name: "feeRecipient", type: "address" },
    ],
    name: "sweepTokenWithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "unwrapWETH9",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "feeBips", type: "uint256" },
      { internalType: "address", name: "feeRecipient", type: "address" },
    ],
    name: "unwrapWETH9WithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

export const uniswapRouterAbi = [
  {
    inputs: [
      { internalType: "address", name: "_factoryV2", type: "address" },
      { internalType: "address", name: "factoryV3", type: "address" },
      { internalType: "address", name: "_positionManager", type: "address" },
      { internalType: "address", name: "_WETH9", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WETH9",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "approveMax",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "approveMaxMinusOne",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "approveZeroThenMax",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "approveZeroThenMaxMinusOne",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
    name: "callPositionManager",
    outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes[]", name: "paths", type: "bytes[]" },
      { internalType: "uint128[]", name: "amounts", type: "uint128[]" },
      { internalType: "uint24", name: "maximumTickDivergence", type: "uint24" },
      { internalType: "uint32", name: "secondsAgo", type: "uint32" },
    ],
    name: "checkOracleSlippage",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "path", type: "bytes" },
      { internalType: "uint24", name: "maximumTickDivergence", type: "uint24" },
      { internalType: "uint32", name: "secondsAgo", type: "uint32" },
    ],
    name: "checkOracleSlippage",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "bytes", name: "path", type: "bytes" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
        ],
        internalType: "struct IV3SwapRouter.ExactInputParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInput",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IV3SwapRouter.ExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "bytes", name: "path", type: "bytes" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amountOut", type: "uint256" },
          { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
        ],
        internalType: "struct IV3SwapRouter.ExactOutputParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactOutput",
    outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amountOut", type: "uint256" },
          { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IV3SwapRouter.ExactOutputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactOutputSingle",
    outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "factoryV2",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getApprovalType",
    outputs: [
      {
        internalType: "enum IApproveAndCall.ApprovalType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "token0", type: "address" },
          { internalType: "address", name: "token1", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "uint256", name: "amount0Min", type: "uint256" },
          { internalType: "uint256", name: "amount1Min", type: "uint256" },
        ],
        internalType: "struct IApproveAndCall.IncreaseLiquidityParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "increaseLiquidity",
    outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "token0", type: "address" },
          { internalType: "address", name: "token1", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "int24", name: "tickLower", type: "int24" },
          { internalType: "int24", name: "tickUpper", type: "int24" },
          { internalType: "uint256", name: "amount0Min", type: "uint256" },
          { internalType: "uint256", name: "amount1Min", type: "uint256" },
          { internalType: "address", name: "recipient", type: "address" },
        ],
        internalType: "struct IApproveAndCall.MintParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "mint",
    outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "previousBlockhash", type: "bytes32" },
      { internalType: "bytes[]", name: "data", type: "bytes[]" },
    ],
    name: "multicall",
    outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bytes[]", name: "data", type: "bytes[]" },
    ],
    name: "multicall",
    outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "positionManager",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "pull",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "refundETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermitAllowed",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermitAllowedIfNecessary",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "selfPermitIfNecessary",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "amountInMax", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "swapTokensForExactTokens",
    outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "uint256", name: "feeBips", type: "uint256" },
      { internalType: "address", name: "feeRecipient", type: "address" },
    ],
    name: "sweepTokenWithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "feeBips", type: "uint256" },
      { internalType: "address", name: "feeRecipient", type: "address" },
    ],
    name: "sweepTokenWithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "int256", name: "amount0Delta", type: "int256" },
      { internalType: "int256", name: "amount1Delta", type: "int256" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "unwrapWETH9",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
    ],
    name: "unwrapWETH9",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "feeBips", type: "uint256" },
      { internalType: "address", name: "feeRecipient", type: "address" },
    ],
    name: "unwrapWETH9WithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountMinimum", type: "uint256" },
      { internalType: "uint256", name: "feeBips", type: "uint256" },
      { internalType: "address", name: "feeRecipient", type: "address" },
    ],
    name: "unwrapWETH9WithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
    name: "wrapETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

export const aggregatorPcsAbi = [
  {
    inputs: [
      { internalType: "address", name: "_treasury", type: "address" },
      { internalType: "address", name: "_weth", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newFeeNumerator",
        type: "uint256",
      },
    ],
    name: "FeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "router",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "whitelisted",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isV2",
        type: "bool",
      },
    ],
    name: "RouterConfigured",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "router",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isNativeIn",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isNativeOut",
        type: "bool",
      },
    ],
    name: "SwapExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newTreasury",
        type: "address",
      },
    ],
    name: "TreasuryUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "FEE_DENOMINATOR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "routers", type: "address[]" },
      { internalType: "bool[]", name: "whitelisted", type: "bool[]" },
      { internalType: "bool[]", name: "isV2", type: "bool[]" },
    ],
    name: "batchConfigureRouters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "router", type: "address" },
      { internalType: "bool", name: "isWhitelisted", type: "bool" },
      { internalType: "bool", name: "isV2Router", type: "bool" },
    ],
    name: "configureRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "tokenOut", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "minAmountOut", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "address", name: "router", type: "address" },
      { internalType: "uint24", name: "feeTier", type: "uint24" },
      { internalType: "bool", name: "isNativeIn", type: "bool" },
      { internalType: "bool", name: "isNativeOut", type: "bool" },
    ],
    name: "executeSwap",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "feeNumerator",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "routerConfigs",
    outputs: [
      { internalType: "bool", name: "isWhitelisted", type: "bool" },
      { internalType: "bool", name: "isV2Router", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_feeNumerator", type: "uint256" },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "router", type: "address" }],
    name: "whitelistedRouters",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

export const referralSystemAbi = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "claimReferralReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// export const predictionMarketAbi = [
//   {
//     inputs: [
//       { internalType: "uint256", name: "_predictionId", type: "uint256" },
//       { internalType: "bool", name: "_vote", type: "bool" },
//       { internalType: "uint256", name: "_helloTokens", type: "uint256" },
//     ],
//     name: "vote",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint256", name: "_predictionId", type: "uint256" },
//       { internalType: "address", name: "_user", type: "address" },
//     ],
//     name: "getUserVote",
//     outputs: [
//       { internalType: "bool", name: "userVote", type: "bool" },
//       { internalType: "uint256", name: "helloTokens", type: "uint256" },
//       { internalType: "uint256", name: "shares", type: "uint256" },
//       { internalType: "bool", name: "hasVoted", type: "bool" },
//       { internalType: "bool", name: "hasClaimed", type: "bool" },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
// ] as const;
