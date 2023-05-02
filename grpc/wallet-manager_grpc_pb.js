// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var wallet$manager_pb = require('./wallet-manager_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_AcquireLockRequest(arg) {
  if (!(arg instanceof wallet$manager_pb.AcquireLockRequest)) {
    throw new Error('Expected argument of type AcquireLockRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_AcquireLockRequest(buffer_arg) {
  return wallet$manager_pb.AcquireLockRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_AcquireLockResponse(arg) {
  if (!(arg instanceof wallet$manager_pb.AcquireLockResponse)) {
    throw new Error('Expected argument of type AcquireLockResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_AcquireLockResponse(buffer_arg) {
  return wallet$manager_pb.AcquireLockResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetAllBalancesResponse(arg) {
  if (!(arg instanceof wallet$manager_pb.GetAllBalancesResponse)) {
    throw new Error('Expected argument of type GetAllBalancesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetAllBalancesResponse(buffer_arg) {
  return wallet$manager_pb.GetAllBalancesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetChainBalancesRequest(arg) {
  if (!(arg instanceof wallet$manager_pb.GetChainBalancesRequest)) {
    throw new Error('Expected argument of type GetChainBalancesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetChainBalancesRequest(buffer_arg) {
  return wallet$manager_pb.GetChainBalancesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ReleaseLockRequest(arg) {
  if (!(arg instanceof wallet$manager_pb.ReleaseLockRequest)) {
    throw new Error('Expected argument of type ReleaseLockRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ReleaseLockRequest(buffer_arg) {
  return wallet$manager_pb.ReleaseLockRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_WalletBalanceByAddress(arg) {
  if (!(arg instanceof wallet$manager_pb.WalletBalanceByAddress)) {
    throw new Error('Expected argument of type WalletBalanceByAddress');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_WalletBalanceByAddress(buffer_arg) {
  return wallet$manager_pb.WalletBalanceByAddress.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


var WalletManagerService = exports.WalletManagerService = {
  getAllBalances: {
    path: '/WalletManager/GetAllBalances',
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: wallet$manager_pb.GetAllBalancesResponse,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_GetAllBalancesResponse,
    responseDeserialize: deserialize_GetAllBalancesResponse,
  },
  getChainBalances: {
    path: '/WalletManager/GetChainBalances',
    requestStream: false,
    responseStream: false,
    requestType: wallet$manager_pb.GetChainBalancesRequest,
    responseType: wallet$manager_pb.WalletBalanceByAddress,
    requestSerialize: serialize_GetChainBalancesRequest,
    requestDeserialize: deserialize_GetChainBalancesRequest,
    responseSerialize: serialize_WalletBalanceByAddress,
    responseDeserialize: deserialize_WalletBalanceByAddress,
  },
  acquireLock: {
    path: '/WalletManager/AcquireLock',
    requestStream: false,
    responseStream: false,
    requestType: wallet$manager_pb.AcquireLockRequest,
    responseType: wallet$manager_pb.AcquireLockResponse,
    requestSerialize: serialize_AcquireLockRequest,
    requestDeserialize: deserialize_AcquireLockRequest,
    responseSerialize: serialize_AcquireLockResponse,
    responseDeserialize: deserialize_AcquireLockResponse,
  },
  releaseLock: {
    path: '/WalletManager/ReleaseLock',
    requestStream: false,
    responseStream: false,
    requestType: wallet$manager_pb.ReleaseLockRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_ReleaseLockRequest,
    requestDeserialize: deserialize_ReleaseLockRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.WalletManagerClient = grpc.makeGenericClientConstructor(WalletManagerService);
