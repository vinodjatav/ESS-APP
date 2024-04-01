## Edge Security System: Key management using blockchain hyperledger-fabric

1) Navigate to the project directory: cd ESS-APP/application/
2) Run cmd as a root user: sudo su
3) Down existing network if previously created: ./networkDown.sh
4) Remove existing Running docker container
5) Run the script: ./startFabric.sh javascript (with preferred programming language)
6) It will create test network and deployee KeyManagement smart contract on test network.
7) Delete the wallet, if already enrolled and registered a user.
8) Then run the following applications to enroll the admin user, and register a new user called appUser which will be used by the other applications to interact with the deployed
  KeyManagement contract: node enrollAdmin.js
    node registerUser.js
9) Then start the application: nodemon apiserver.js
