const hre = require("hardhat");

async function main() {
    await hre.run("verify:verify", {
        address: "0x236C6fFc7c72d1Fe69ff3530D5aBeBC0B1594F99",
        constructorArguments: [
            "0x9ac2c46d7acc21c881154d57c0dc1c55a3139198",
            "0x9C72a31e4be67bD2dbC955E2b86Ccc5BDE4b79C0",
            "0xFD1b05E51653339c850c8a18c9Ac11Aed9105F2A"
        ],
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});