// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecords {

    struct Record {
        string ipfsHash;
        uint256 timestamp;
    }

    // patient => records
    mapping(address => Record[]) private records;

    // patient => doctor => access
    mapping(address => mapping(address => bool)) private accessGranted;

    // EVENTS (important for audit trail)
    event RecordAdded(address indexed patient, string ipfsHash);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    // ---------------- ADD RECORD ----------------
    function addRecord(string memory _ipfsHash) public {
        records[msg.sender].push(
            Record(_ipfsHash, block.timestamp)
        );
        emit RecordAdded(msg.sender, _ipfsHash);
    }

    // ---------------- GRANT ACCESS ----------------
    function grantAccess(address _doctor) public {
        accessGranted[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    // ---------------- REVOKE ACCESS ----------------
    function revokeAccess(address _doctor) public {
        accessGranted[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    // ---------------- GET RECORDS ----------------
    function getRecords(address _patient)
        public
        view
        returns (Record[] memory)
    {
        require(
            msg.sender == _patient || accessGranted[_patient][msg.sender],
            "Access denied"
        );
        return records[_patient];
    }
}
