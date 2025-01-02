/* eslint-disable */
import Long from "long";
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "";

export interface AcquireLockRequest {
  chainName: string;
  address?:
    | string
    | undefined;
  /** FIXME: We are missing waitToAcquireTimeout. */
  leaseTimeout?: number | undefined;
}

export interface AcquireLockResponse {
  address: string;
}

export interface ReleaseLockRequest {
  chainName: string;
  address: string;
}

function createBaseAcquireLockRequest(): AcquireLockRequest {
  return { chainName: "", address: undefined, leaseTimeout: undefined };
}

export const AcquireLockRequest = {
  encode(message: AcquireLockRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainName !== "") {
      writer.uint32(10).string(message.chainName);
    }
    if (message.address !== undefined) {
      writer.uint32(18).string(message.address);
    }
    if (message.leaseTimeout !== undefined) {
      writer.uint32(24).uint64(message.leaseTimeout);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AcquireLockRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAcquireLockRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chainName = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.address = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.leaseTimeout = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AcquireLockRequest {
    return {
      chainName: isSet(object.chainName) ? String(object.chainName) : "",
      address: isSet(object.address) ? String(object.address) : undefined,
      leaseTimeout: isSet(object.leaseTimeout) ? Number(object.leaseTimeout) : undefined,
    };
  },

  toJSON(message: AcquireLockRequest): unknown {
    const obj: any = {};
    message.chainName !== undefined && (obj.chainName = message.chainName);
    message.address !== undefined && (obj.address = message.address);
    message.leaseTimeout !== undefined && (obj.leaseTimeout = Math.round(message.leaseTimeout));
    return obj;
  },

  create(base?: DeepPartial<AcquireLockRequest>): AcquireLockRequest {
    return AcquireLockRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AcquireLockRequest>): AcquireLockRequest {
    const message = createBaseAcquireLockRequest();
    message.chainName = object.chainName ?? "";
    message.address = object.address ?? undefined;
    message.leaseTimeout = object.leaseTimeout ?? undefined;
    return message;
  },
};

function createBaseAcquireLockResponse(): AcquireLockResponse {
  return { address: "" };
}

export const AcquireLockResponse = {
  encode(message: AcquireLockResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AcquireLockResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAcquireLockResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AcquireLockResponse {
    return { address: isSet(object.address) ? String(object.address) : "" };
  },

  toJSON(message: AcquireLockResponse): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  create(base?: DeepPartial<AcquireLockResponse>): AcquireLockResponse {
    return AcquireLockResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AcquireLockResponse>): AcquireLockResponse {
    const message = createBaseAcquireLockResponse();
    message.address = object.address ?? "";
    return message;
  },
};

function createBaseReleaseLockRequest(): ReleaseLockRequest {
  return { chainName: "", address: "" };
}

export const ReleaseLockRequest = {
  encode(message: ReleaseLockRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainName !== "") {
      writer.uint32(10).string(message.chainName);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReleaseLockRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReleaseLockRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chainName = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.address = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ReleaseLockRequest {
    return {
      chainName: isSet(object.chainName) ? String(object.chainName) : "",
      address: isSet(object.address) ? String(object.address) : "",
    };
  },

  toJSON(message: ReleaseLockRequest): unknown {
    const obj: any = {};
    message.chainName !== undefined && (obj.chainName = message.chainName);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  create(base?: DeepPartial<ReleaseLockRequest>): ReleaseLockRequest {
    return ReleaseLockRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ReleaseLockRequest>): ReleaseLockRequest {
    const message = createBaseReleaseLockRequest();
    message.chainName = object.chainName ?? "";
    message.address = object.address ?? "";
    return message;
  },
};

export type WalletManagerGRPCServiceDefinition = typeof WalletManagerGRPCServiceDefinition;
export const WalletManagerGRPCServiceDefinition = {
  name: "WalletManagerGRPCService",
  fullName: "WalletManagerGRPCService",
  methods: {
    acquireLock: {
      name: "AcquireLock",
      requestType: AcquireLockRequest,
      requestStream: false,
      responseType: AcquireLockResponse,
      responseStream: false,
      options: {},
    },
    releaseLock: {
      name: "ReleaseLock",
      requestType: ReleaseLockRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface WalletManagerGRPCServiceImplementation<CallContextExt = {}> {
  acquireLock(
    request: AcquireLockRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<AcquireLockResponse>>;
  releaseLock(request: ReleaseLockRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
}

export interface WalletManagerGRPCServiceClient<CallOptionsExt = {}> {
  acquireLock(
    request: DeepPartial<AcquireLockRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<AcquireLockResponse>;
  releaseLock(request: DeepPartial<ReleaseLockRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
