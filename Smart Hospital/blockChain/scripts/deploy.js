const { ethers } = require("hardhat");

async function main() {

    const MedicalRecords = await ethers.getContractFactory("MedicalRecords");

    const contract = await MedicalRecords.deploy();

    // ✅ ethers v5 uses deployed()
    await contract.deployed();

    console.log("✅ MedicalRecords deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
