// HelloSwap V3 Fee Checker - CLI tool to check uncollected fees
const { ethers } = require("ethers");
require("dotenv").config();
const readline = require("readline");

// Contract addresses from your deployment
const POSITION_MANAGER_ADDRESS = "0xa40870bd61B43D33AEa7db37cF48D5d9Cdc3245C";
const FACTORY_ADDRESS = "0x8D874A783516DDeb7Acd36317D03c9Eb7Adb3dc6";

// ABIs - Simplified versions with just the functions we need
const POSITION_MANAGER_ABI = [
"function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
];

const ERC20_ABI = [
"function symbol() view returns (string)",
"function decimals() view returns (uint8)",
];

const FACTORY_ABI = [
"function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

const POOL_ABI = [
"function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint32 feeProtocol, bool unlocked)",
"function feeGrowthGlobal0X128() external view returns (uint256)",
"function feeGrowthGlobal1X128() external view returns (uint256)",
"function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)",
];

// Setup interactive CLI
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});

// Initialize provider
let provider;
try {
// Use environment variables for RPC URL or default to a common one
const rpcUrl =
process.env.RPC_URL ||
"https://bsc-testnet.core.chainstack.com/2ca0709acd78bddafa766f65cf8b8e5a";
provider = new ethers.providers.JsonRpcProvider(rpcUrl);
console.log("Connected to blockchain network");
} catch (error) {
console.error("Error connecting to provider:", error.message);
process.exit(1);
}

// Contract instances
const positionManager = new ethers.Contract(
POSITION_MANAGER_ADDRESS,
POSITION_MANAGER_ABI,
provider
);

const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

// Calculate pending fees (not yet accumulated into tokensOwed)
async function calculatePendingFees(position, poolContract) {
try {
// Get current state from the pool
const [slot0, feeGrowthGlobal0, feeGrowthGlobal1] = await Promise.all([
poolContract.slot0(),
poolContract.feeGrowthGlobal0X128(),
poolContract.feeGrowthGlobal1X128(),
]);

    // Get tick data
    const [lowerTickData, upperTickData] = await Promise.all([
      poolContract.ticks(position.tickLower),
      poolContract.ticks(position.tickUpper),
    ]);

    // Calculate fee growth inside the range
    let feeGrowthInside0X128;
    let feeGrowthInside1X128;

    const currentTick = slot0.tick;

    if (currentTick < position.tickLower) {
      // Current tick is below the position range
      feeGrowthInside0X128 = lowerTickData.feeGrowthOutside0X128.sub(
        upperTickData.feeGrowthOutside0X128
      );
      feeGrowthInside1X128 = lowerTickData.feeGrowthOutside1X128.sub(
        upperTickData.feeGrowthOutside1X128
      );
    } else if (currentTick >= position.tickUpper) {
      // Current tick is above the position range
      feeGrowthInside0X128 = upperTickData.feeGrowthOutside0X128.sub(
        lowerTickData.feeGrowthOutside0X128
      );
      feeGrowthInside1X128 = upperTickData.feeGrowthOutside1X128.sub(
        lowerTickData.feeGrowthOutside1X128
      );
    } else {
      // Current tick is within the position range
      feeGrowthInside0X128 = feeGrowthGlobal0
        .sub(lowerTickData.feeGrowthOutside0X128)
        .sub(upperTickData.feeGrowthOutside0X128);
      feeGrowthInside1X128 = feeGrowthGlobal1
        .sub(lowerTickData.feeGrowthOutside1X128)
        .sub(upperTickData.feeGrowthOutside1X128);
    }

    // Calculate fee growth since last position update
    const feeGrowthDelta0 = feeGrowthInside0X128.sub(
      position.feeGrowthInside0LastX128
    );
    const feeGrowthDelta1 = feeGrowthInside1X128.sub(
      position.feeGrowthInside1LastX128
    );

    // Calculate fees
    let pendingFees0 = ethers.BigNumber.from(0);
    let pendingFees1 = ethers.BigNumber.from(0);

    if (position.liquidity.gt(0)) {
      pendingFees0 = position.liquidity
        .mul(feeGrowthDelta0)
        .div(ethers.BigNumber.from(2).pow(128));
      pendingFees1 = position.liquidity
        .mul(feeGrowthDelta1)
        .div(ethers.BigNumber.from(2).pow(128));
    }

    return {
      pendingFees0,
      pendingFees1,
      currentTick,
      sqrtPriceX96: slot0.sqrtPriceX96,
      inRange:
        currentTick >= position.tickLower && currentTick < position.tickUpper,
    };

} catch (error) {
console.error("Error calculating pending fees:", error);
return {
pendingFees0: ethers.BigNumber.from(0),
pendingFees1: ethers.BigNumber.from(0),
currentTick: 0,
sqrtPriceX96: ethers.BigNumber.from(0),
inRange: false,
};
}
}

// Get position details and fees
async function getPositionFees(tokenId) {
console.log(`\nFetching details for position #${tokenId}...`);

try {
// Fetch position details
const position = await positionManager.positions(tokenId);

    // Fetch token info
    const token0Contract = new ethers.Contract(
      position.token0,
      ERC20_ABI,
      provider
    );
    const token1Contract = new ethers.Contract(
      position.token1,
      ERC20_ABI,
      provider
    );

    const [token0Symbol, token0Decimals, token1Symbol, token1Decimals] =
      await Promise.all([
        token0Contract.symbol(),
        token0Contract.decimals(),
        token1Contract.symbol(),
        token1Contract.decimals(),
      ]);

    // Get pool address
    const poolAddress = await factory.getPool(
      position.token0,
      position.token1,
      position.fee
    );

    // Get pool contract
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);

    // Get pending fees
    const pendingFeeInfo = await calculatePendingFees(position, poolContract);

    // Format fees
    const collectedFees0 = ethers.utils.formatUnits(
      position.tokensOwed0,
      token0Decimals
    );
    const collectedFees1 = ethers.utils.formatUnits(
      position.tokensOwed1,
      token1Decimals
    );

    const pendingFees0 = ethers.utils.formatUnits(
      pendingFeeInfo.pendingFees0,
      token0Decimals
    );
    const pendingFees1 = ethers.utils.formatUnits(
      pendingFeeInfo.pendingFees1,
      token1Decimals
    );

    const totalFees0 = parseFloat(collectedFees0) + parseFloat(pendingFees0);
    const totalFees1 = parseFloat(collectedFees1) + parseFloat(pendingFees1);

    // Print position details
    console.log("\n=== POSITION DETAILS ===");
    console.log(`Position ID: ${tokenId}`);
    console.log(`Pool: ${token0Symbol}/${token1Symbol}`);
    console.log(`Fee Tier: ${position.fee / 10000}%`);
    console.log(
      `Liquidity: ${ethers.utils.formatUnits(position.liquidity, 18)}`
    );
    console.log(`Range: ${position.tickLower} to ${position.tickUpper}`);
    console.log(`Current Tick: ${pendingFeeInfo.currentTick}`);
    console.log(
      `Position Status: ${
        pendingFeeInfo.inRange ? "In Range ✅" : "Out of Range ❌"
      }`
    );

    // Print fee details
    console.log("\n=== FEE DETAILS ===");
    console.log("\nCollected Fees (Ready to claim):");
    console.log(`${token0Symbol}: ${collectedFees0}`);
    console.log(`${token1Symbol}: ${collectedFees1}`);

    console.log("\nPending Fees (Not yet collected):");
    console.log(`${token0Symbol}: ${pendingFees0}`);
    console.log(`${token1Symbol}: ${pendingFees1}`);

    console.log("\nTotal Fees:");
    console.log(`${token0Symbol}: ${totalFees0.toFixed(6)}`);
    console.log(`${token1Symbol}: ${totalFees1.toFixed(6)}`);

    return {
      position,
      poolAddress,
      token0Symbol,
      token1Symbol,
      fees: {
        collected0: collectedFees0,
        collected1: collectedFees1,
        pending0: pendingFees0,
        pending1: pendingFees1,
        total0: totalFees0,
        total1: totalFees1,
      },
    };

} catch (error) {
console.error("Error fetching position:", error.message);
return null;
}
}

// Main function
async function main() {
console.log("===========================================");
console.log(" HelloSwap V3 Fee Checker Tool");
console.log("===========================================");

const network = await provider.getNetwork();
console.log(
`Connected to network: ${network.name} (Chain ID: ${network.chainId})`
);

// Interactive loop
const askForPositionId = () => {
rl.question('\nEnter Position ID (or "exit" to quit): ', async (input) => {
if (input.toLowerCase() === "exit") {
console.log("Exiting...");
rl.close();
return;
}

      const tokenId = parseInt(input.trim());

      if (isNaN(tokenId) || tokenId <= 0) {
        console.log("Please enter a valid position ID.");
        askForPositionId();
        return;
      }

      await getPositionFees(tokenId);

      // Ask if user wants to check another position
      rl.question("\nCheck another position? (y/n): ", (answer) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          askForPositionId();
        } else {
          console.log("Exiting...");
          rl.close();
        }
      });
    });

};

askForPositionId();
}

// Run the main function
main().catch((error) => {
console.error("Fatal error:", error);
rl.close();
});
