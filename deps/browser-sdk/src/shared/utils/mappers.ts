import {
  JsDepositData,
  JsDepositEntry,
  JsMetaData,
  JsTransferData,
  JsTransferEntry,
  JsTxData,
  JsTxEntry,
} from '../../wasm/browser/intmax2_wasm_lib';
import { Token, Transaction, TransactionStatus, TransactionType, Transfer } from '../types';

const wasmStatuses = {
  settled: TransactionStatus.Processing,
  processed: TransactionStatus.Completed,
  pending: TransactionStatus.Processing,
  timeout: TransactionStatus.Rejected,
};

const filterWithdrawals = (transfers: Transfer[]) => {
  return transfers.some((transfer) => transfer.isWithdrawal) ? TransactionType.Withdraw : TransactionType.Send;
};

export const wasmTxToTx = (
  rawTx: (JsTxEntry | JsTransferEntry | JsDepositEntry) & { txType: TransactionType },
  tokens: Token[],
): Transaction | null => {
  if (rawTx.txType === TransactionType.Receive) {
    const tx = rawTx.data as JsTransferData;
    const { timestamp, digest } = rawTx.meta as JsMetaData;
    const token = tokens.find((t) => t.tokenIndex === tx.transfer.token_index);

    return {
      amount: tx.transfer.amount,
      from: tx.sender,
      status: wasmStatuses[rawTx.status.status as keyof typeof wasmStatuses],
      timestamp: Number(timestamp),
      to: tx.transfer.recipient.data,
      tokenType: token?.tokenType,
      tokenIndex: tx.transfer.token_index,
      transfers: [],
      txType: rawTx.txType,
      digest: digest,
    };
  } else if (rawTx.txType === TransactionType.Deposit) {
    const tx = rawTx.data as JsDepositData;
    const { timestamp, digest } = rawTx.meta as JsMetaData;
    const token = tokens.find((t) => t.contractAddress.toLowerCase() === tx.token_address.toLowerCase());

    const transaction: Transaction = {
      amount: tx.amount,
      from: '',
      status: wasmStatuses[rawTx.status.status as keyof typeof wasmStatuses],
      timestamp: Number(timestamp),
      to: '',
      tokenType: tx.token_type,
      tokenIndex: token?.tokenIndex ?? 0,
      transfers: [],
      txType: rawTx.txType,
      digest: digest,
      tokenAddress: tx.token_address,
    };

    return transaction;
  } else if (rawTx.txType === TransactionType.Send || rawTx.txType === TransactionType.Withdraw) {
    const tx = rawTx.data as JsTxData;
    const { timestamp, digest } = rawTx.meta as JsMetaData;

    let transaction: Transaction = {
      amount: '',
      from: '',
      status: wasmStatuses[rawTx.status.status as keyof typeof wasmStatuses],
      timestamp: Number(timestamp),
      to: '',
      tokenIndex: 0,
      transfers: [],
      txType: rawTx.txType,
      digest: digest,
    };

    const transfers = tx.transfers
      .filter((transfer) => transfer.amount !== '0')
      .map((transfer) => {
        const isWithdrawal = !transfer.recipient.is_pubkey;
        let returnObject: Transfer = {
          recipient: transfer.recipient.data,
          salt: transfer.salt,
          amount: transfer.amount,
          tokenIndex: transfer.token_index,
          to: transfer.recipient.data,
          isWithdrawal: isWithdrawal,
        };

        if (isWithdrawal) {
          returnObject = {
            ...returnObject,
            nullifier: transfer.to_withdrawal().nullifier,
          };
        }

        return returnObject;
      });

    transaction.txType = filterWithdrawals(transfers);

    transaction = {
      ...transaction,
      transfers,
      timestamp: Number(timestamp),
    };

    return transaction;
  }

  return null;
};
