const crypto = require('crypto');
const { encode } = require('cbor');

const transaction = {
  "id": "9607088",
  "transaction": {
    "memo": "1704544211241",
    "icrc1_memo": [],
    "operation": {
      "Transfer": {
        "to": "220c3a33f90601896e26f76fa619fe288742df1fa75426edfaf759d39f2455a5",
        "fee": {
          "e8s": "10000"
        },
        "from": "856cf8b6fc5297fb0e15379807643521ef8755b139a00bfa6776196bedcb9442",
        "amount": {
          "e8s": "4073024360"
        }
      }
    },
    "created_at_time": [
      {
        "timestamp_nanos": "1704544211241571279"
      }
    ]
  }
};

function generateTransactionHash(transaction) {
  const serializedTransaction = encode(transaction);
  const sha256Hash = crypto.createHash('sha256').update(serializedTransaction).digest('hex');
  return sha256Hash;
}

const transactionHash = generateTransactionHash(transaction);
console.log('Transaction Hash:', transactionHash);
